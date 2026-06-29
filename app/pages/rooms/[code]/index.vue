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
          Salle {{ code }}
        </h1>

        <div class="mt-6 rounded-3xl border border-white/10 bg-neutral-950/60 p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="text-left">
              <p class="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Code de la salle
              </p>

              <p class="mt-1 font-mono text-2xl font-black tracking-[0.25em] text-neutral-50">
                {{ code }}
              </p>
            </div>

            <UButton
              icon="i-lucide-copy"
              color="neutral"
              variant="soft"
              class="rounded-2xl"
              @click="copyCode"
            />
          </div>
        </div>

        <div class="mt-6 text-left">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-black uppercase tracking-wider text-neutral-400">
              Joueurs
            </h2>
          </div>

          <div class="grid gap-2">
            <div
              v-for="player in players"
              :key="player.id"
              class="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/50 p-3"
            >
              <div class="relative shrink-0">
                <UAvatar
                  :alt="player.username"
                  size="lg"
                />

                <div
                  v-if="player.isHost"
                  class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-warning-400 text-neutral-950 ring-2 ring-neutral-950"
                >
                  <UIcon
                    name="i-lucide-crown"
                    class="size-3.5"
                  />
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-black text-neutral-50">
                  {{ player.username }}
                </p>
              </div>

              <UBadge
                v-if="player.isReady"
                color="success"
                variant="soft"
                class="rounded-full"
              >
                Prêt
              </UBadge>
            </div>

            <div
              v-if="!players.length"
              class="rounded-2xl border border-white/10 bg-neutral-950/50 p-4 text-center text-sm text-neutral-400"
            >
              Aucun joueur dans la salle.
            </div>
          </div>
        </div>

        <UButton
          v-if="room?.status === RoomStatus.WAITING"
          block
          size="xl"
          color="primary"
          :loading="isStarting"
          :disabled="isLoading || isStarting || !isHost"
          class="mt-6 h-13 rounded-2xl font-bold"
          @click="start"
        >
          {{ isHost ? 'Lancer la partie' : 'En attente de l’hôte' }}
        </UButton>

        <UButton
          block
          size="xl"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :loading="isLeaving"
          class="mt-3 h-13 rounded-2xl font-bold text-neutral-300 hover:!bg-transparent hover:!text-neutral-100 active:!bg-transparent focus-visible:!ring-0"
          @click="leave"
        >
          Quitter la salle
        </UButton>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
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
const isStarting = ref(false)
const isLeaving = ref(false)
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

const isHost = computed(() => {
  return players.value.some(player => {
    return player.id === selfPlayerId.value && player.isHost
  })
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

const copyCode = async () => {
  await navigator.clipboard.writeText(code)

  toast.add({
    title: 'Code copié',
    description: code,
    icon: 'i-lucide-copy-check',
    color: 'success',
    duration: 2000
  })
}

const start = async () => {
  if (!isHost.value || isStarting.value) {
    return
  }

  try {
    isStarting.value = true
    socket.emit("room:start");
  } catch (error) {
    toast.add({
      title: 'Impossible de lancer la partie',
      description: error instanceof Error ? error.message : 'Réessaie dans quelques secondes.',
      icon: 'i-lucide-triangle-alert',
      color: 'error'
    })
  } finally {
    isStarting.value = false
  }
}

const leave = async () => {
  if (isLeaving.value) {
    return
  }

  try {
    isLeaving.value = true

    await leaveRoom(code)

    disconnect()
    currentRoom.value = null

    await router.push('/')
  } catch (error) {
    toast.add({
      title: 'Impossible de quitter la salle',
      description: error instanceof Error ? error.message : 'Réessaie dans quelques secondes.',
      icon: 'i-lucide-triangle-alert',
      color: 'error'
    })
  } finally {
    isLeaving.value = false
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