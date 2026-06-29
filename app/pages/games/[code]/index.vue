<template>
  <Transition
    enter-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isLoading"
      class="fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden bg-primary-500/10"
    >
      <div class="loading-bar h-full w-1/3 rounded-full bg-primary-500" />
    </div>
  </Transition>

  <UButton
    icon="i-lucide-log-out"
    color="neutral"
    variant="ghost"
    size="lg"
    class="fixed right-4 top-4 z-[9998] rounded-2xl bg-neutral-950/40 text-neutral-300 backdrop-blur hover:!bg-neutral-900/70 hover:!text-neutral-50"
    @click="isLeaveConfirmOpen = true"
  />

  <UModal
    v-model:open="isLeaveConfirmOpen"
    :ui="{
      overlay: 'bg-neutral-950/70 backdrop-blur-sm',
      content: 'w-[min(92vw,380px)] rounded-[28px] bg-neutral-900 ring-1 ring-white/10 shadow-2xl'
    }"
  >
    <template #content>
      <div class="p-6 text-center">
        <h2 class="mt-5 text-2xl font-black text-neutral-50">
          Quitter la partie ?
        </h2>

        <p class="mt-2 text-sm text-neutral-300">
          Tu vas être renvoyé à l’accueil. La partie restera en cours pour les autres joueurs.
        </p>

        <div class="mt-6 grid grid-cols-2 gap-3">
          <UButton
            block
            size="xl"
            color="neutral"
            variant="soft"
            class="h-12 rounded-2xl font-bold"
            @click="isLeaveConfirmOpen = false"
          >
            Annuler
          </UButton>

          <UButton
            block
            size="xl"
            color="error"
            class="h-12 rounded-2xl font-bold"
            @click="leaveGame"
          >
            Quitter
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <KeepAlive>
    <component
      v-if="gameComponent"
      :is="gameComponent"
      :key="currentGameId"
      :private-data="privateData"
      :public-data="publicData"
    />
  </KeepAlive>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import NinetySeventyGame from '~/components/games/ninety-seventy/NinetySeventyGame.vue'
import { useAuth } from '~/composables/core/useAuth'
import { useSocket } from '~/composables/core/useSocket'
import { GameEnum, type GameData } from '~/types/games'

const gameComponents: Record<GameEnum, Component> = {
  [GameEnum.NINETY_SEVEN]: NinetySeventyGame
}

const route = useRoute()
const router = useRouter()

const code = route.params.code as string

const currentGameId = ref<GameEnum | null>(null)

const publicData = shallowRef<GameData | null>(null)
const privateData = shallowRef<GameData | null>(null)

const isConnected = ref(false)
const isLeaveConfirmOpen = ref(false)
const isLeavingGame = ref(false)

const { connect, disconnect, socket } = useSocket()

const gameComponent = computed(() => {
  if (!currentGameId.value) {
    return null
  }

  return gameComponents[currentGameId.value]
})

const isLoading = computed(() => {
  return (
    !isConnected.value ||
    !currentGameId.value ||
    !gameComponent.value ||
    !publicData.value ||
    !privateData.value
  )
})

const onConnect = () => {
  isConnected.value = true
}

const onDisconnect = () => {
  isConnected.value = false
}

const onSessionError = (error: unknown) => {
  console.error(error)
}

const onSessionInfos = ({ gameId }: { gameId?: GameEnum }) => {
  if (!gameId) {
    return
  }

  currentGameId.value = gameId
}

const onPublicData = (data: GameData) => {
  publicData.value = data
}

const onPrivateData = (data: GameData) => {
  privateData.value = data
}

const leaveGame = async () => {
  if (isLeavingGame.value) {
    return
  }

  isLeavingGame.value = true
  isLeaveConfirmOpen.value = false

  socket.emit('game:leave', {
    code
  })

  disconnect()

  currentGameId.value = null
  publicData.value = null
  privateData.value = null

  await router.push('/')
}

onMounted(() => {
  socket.on('connect', onConnect)
  socket.on('disconnect', onDisconnect)

  socket.on('session:error', onSessionError)
  socket.on('session:infos', onSessionInfos)

  socket.on('game:public-data', onPublicData)
  socket.on('game:private-data', onPrivateData)

  connect(code)
})

onBeforeUnmount(() => {
  socket.off('connect', onConnect)
  socket.off('disconnect', onDisconnect)

  socket.off('session:error', onSessionError)
  socket.off('session:infos', onSessionInfos)

  socket.off('game:public-data', onPublicData)
  socket.off('game:private-data', onPrivateData)

  disconnect()
})
</script>

<style scoped>
.loading-bar {
  animation: loading-slide 1s ease-in-out infinite;
}

@keyframes loading-slide {
  0% {
    transform: translateX(-120%);
  }

  100% {
    transform: translateX(320%);
  }
}
</style>