<template>
  <div class="grid min-h-[calc(100vh-4rem)] place-items-center px-4">
    <div class="w-full max-w-md rounded-[32px] border border-white/10 bg-neutral-900/90 p-6 text-center shadow-2xl backdrop-blur">
      <h1 class="mt-5 text-2xl font-black text-neutral-50">
        {{ t('home.title') }}
      </h1>

      <p class="mt-2 text-sm text-neutral-300">
        {{ t('home.subtitle') }}
      </p>

      <form @submit.prevent="join">
        <div class="mt-7 flex justify-center">
          <UPinInput
            v-model="value"
            :length="6"
            size="xl"
            autofocus
            placeholder="_"
            :disabled="isBusy"
            :ui="{
              root: 'gap-2 sm:gap-3',
              base: 'size-12 sm:size-14 rounded-2xl bg-neutral-950/70 text-center text-xl sm:text-2xl font-black uppercase text-neutral-50 ring-white/10 placeholder:text-neutral-600 focus:ring-primary-300'
            }"
            @complete="join"
          />
        </div>

        <div class="mt-6 grid grid-cols-[1fr_auto] gap-3">
          <UButton
            type="submit"
            block
            size="xl"
            color="primary"
            :loading="isJoiningRoom"
            :disabled="!canJoin || isBusy"
            class="h-13 rounded-2xl font-bold"
          >
            {{ t('home.joinBtn') }}
          </UButton>

          <HomeQrCodeScanner 
            :is-busy="isBusy"
            :join-code="joinCode"
            @on-value="(value: string[]) => rawValue = value"
          />
        </div>
      </form>

      <div class="my-6 flex items-center gap-3">
        <div class="h-px flex-1 bg-white/10" />

        <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">
          {{ t('home.otherChoice') }}
        </span>

        <div class="h-px flex-1 bg-white/10" />
      </div>

      <HomeGameChoice 
        :is-busy="isBusy"
        @on-game-id="gameId => loadingGameId = gameId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import HomeGameChoice from '~/components/home/HomeGameChoice.vue'
import HomeQrCodeScanner from '~/components/home/HomeQrCodeScanner.vue'
import { GameEnum } from '~/types/games'

const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const { getRoom } = useRooms()

const rawValue = ref<string[]>([])
const loadingGameId = ref<GameEnum | null>(null)
const isJoiningRoom = ref(false)

const isCreatingRoom = computed(() => {
  return loadingGameId.value !== null
})

const isBusy = computed(() => {
  return isJoiningRoom.value || isCreatingRoom.value
})

const value = computed<string[]>({
  get: () => rawValue.value,
  set: val => {
    rawValue.value = val
      .map(item => String(item ?? '').toUpperCase())
      .map(item => item.replace(/[^A-Z0-9]/g, '').slice(0, 1))
      .slice(0, 6)
  }
})

const code = computed(() => {
  return rawValue.value.join('').toUpperCase()
})

const canJoin = computed(() => {
  return code.value.length === 6
})

const joinCode = async (roomCode: string) => {
  const normalizedCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)

  if (normalizedCode.length !== 6 || isBusy.value) {
    return
  }

  try {
    isJoiningRoom.value = true

    const room = await getRoom(normalizedCode)

    if (!room) {
      toast.add({
        title: t('home.errors.roomNotFound.title'),
        description: t('home.errors.roomNotFound.subtitle'),
        icon: 'i-lucide-search-x',
        color: 'error'
      })

      return
    }

    await router.push(`/rooms/${normalizedCode}`)
  } catch (error) {
    toast.add({
      title: t('home.errors.roomNotFound.common'),
      description: error instanceof Error ? error.message : 'Vérifie le code et réessaie.',
      icon: 'i-lucide-triangle-alert',
      color: 'error'
    })
  } finally {
    isJoiningRoom.value = false
  }
}

const join = async () => {
  await joinCode(code.value)
}

</script>