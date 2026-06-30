<template>
    <UButton
        v-if="status === RoomStatus.WAITING"
        block
        size="xl"
        color="primary"
        :loading="isStarting"
        :disabled="isLoading || isStarting || !isHost"
        class="mt-6 h-13 rounded-2xl font-bold"
        @click="start"
    >
        {{ t('room.' + (isHost ? 'startBtn' : 'waitingForHost')) }}
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
        {{ t('room.leaveBtn') }}
    </UButton>
</template>

<script lang="ts" setup>
import { useAuth } from '~/composables/core/useAuth';
import { useSocket } from '~/composables/core/useSocket';
import { RoomStatus, type RoomPlayer } from '~/types/rooms';

const { id: selfPlayerId } = useAuth()
const router = useRouter()
const toast = useToast()
const {t} = useI18n()
const { socket, disconnect } = useSocket()

const {
  currentRoom,
  leaveRoom
} = useRooms()

const p = defineProps<{
    code: string;
    status?: RoomStatus;
    isLoading: boolean;
    players: RoomPlayer[];
}>();
const {players} = toRefs(p);

const isStarting = ref(false)
const isLeaving = ref(false)

const isHost = computed(() => {
  return players.value.some(player => {
    return player.id === selfPlayerId.value && player.isHost
  })
})

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

    await leaveRoom(p.code)

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
</script>