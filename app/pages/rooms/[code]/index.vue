<template>
  <div class="grid min-h-[calc(100vh-4rem)] place-items-center px-4">
    <Transition
      mode="out-in"
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <RoomLobbySkeleton v-if="isInitialLoading" />

      <div
        v-else
        class="w-full max-w-md rounded-[32px] border border-white/10 bg-neutral-900/90 p-6 text-center shadow-2xl backdrop-blur"
      >
        <h1 class="mt-5 text-2xl font-black text-neutral-50">
          {{ t('room.title', {code}) }}
        </h1>

        <RoomLobbyCode :code="code" />

        <RoomLobbyPlayers :players="players" />

        <RoomLobbyFooter 
          :code="code"
          :is-loading="isLoading"
          :status="room?.status"
          :players="players"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import RoomLobbyCode from '~/components/rooms/RoomLobbyCode.vue';
import RoomLobbyFooter from '~/components/rooms/RoomLobbyFooter.vue';
import RoomLobbyPlayers from '~/components/rooms/RoomLobbyPlayers.vue';
import RoomLobbySkeleton from '~/components/rooms/RoomLobbySkeleton.vue'
import { useAuth } from '~/composables/core/useAuth'
import { useSocket } from '~/composables/core/useSocket'
import { RoomStatus, type Room, type RoomPlayer } from '~/types/rooms'

interface RoomPlayerEvent {
  players: RoomPlayer[];
  username: string;
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const code = String(route.params.code ?? '').toUpperCase()

const { id } = useAuth()
const {
  getRoom,
  currentRoom,
  joinRoom,
  leaveRoom
} = useRooms()

const { socket, connect, disconnect } = useSocket()

const isLoading = ref(false)
const isGoingToGame = ref(false)
const hasLoadedRoom = ref(false)

const room = computed(() => currentRoom.value as Room | null)
const players = computed(() => room.value?.players ?? [])

const selfPlayerId = computed(() => id.value ?? null)

const isInitialLoading = computed(() => {
  return !hasLoadedRoom.value
})

const isInRoom = computed(() => {
  return players.value.some(player => player.id === selfPlayerId.value)
})

const redirectIfPlaying = async () => {
  if (room.value?.status !== RoomStatus.PLAYING) {
    return
  }

  isGoingToGame.value = true
  await router.push(`/games/${code}`)
}

const ensureJoinedRoom = async () => {
  if (!room.value || isInRoom.value || room.value.status !== RoomStatus.WAITING) {
    return
  }

  const joinedRoom = await joinRoom(code)

  if (joinedRoom) {
    currentRoom.value = joinedRoom
    return
  }

  await getRoom(code)
}

const loadRoom = async () => {
  try {
    isLoading.value = true
    hasLoadedRoom.value = false
    currentRoom.value = null

    const result = await getRoom(code)

    if (!result) {
      toast.add({
        title: 'Salle introuvable',
        description: 'Vérifie le code et réessaie.',
        icon: 'i-lucide-search-x',
        color: 'error'
      })

      await router.push('/')
      return
    }

    await ensureJoinedRoom()

    hasLoadedRoom.value = true

    await redirectIfPlaying()
  } catch (error) {
    hasLoadedRoom.value = true

    toast.add({
      title: 'Impossible de charger la salle',
      description: error instanceof Error ? error.message : 'Réessaie dans quelques secondes.',
      icon: 'i-lucide-triangle-alert',
      color: 'error'
    })

    await router.push('/')
  } finally {
    isLoading.value = false
  }
}

const onRoomStarted = async () => {
  isGoingToGame.value = true
  await router.push(`/games/${code}`)
}

const onRoomPlayerJoined = (payload: RoomPlayerEvent) => {
  room.value!.players = payload.players;
}

const onRoomPlayerLeft = (payload: RoomPlayerEvent) => {
  room.value!.players = payload.players;
}

const onRoomError = (error: string) => {
  console.error(error);
}

onMounted(async () => {
  await loadRoom()

  socket.on('room:started', onRoomStarted)
  socket.on('room:player-join', onRoomPlayerJoined)
  socket.on('room:player-left', onRoomPlayerLeft)
  socket.on("room:error", onRoomError)

  connect(code)
})

onBeforeUnmount(() => {
  socket.off('room:started', onRoomStarted)
  socket.off('room:player-join', onRoomPlayerJoined)
  socket.off('room:player-left', onRoomPlayerLeft)
  socket.on("room:error", onRoomError)

  if (!isGoingToGame.value && isInRoom.value) {
    leaveRoom(code);
  }

  disconnect()
})
</script>