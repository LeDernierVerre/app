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

        <UButton
          type="submit"
          block
          size="xl"
          color="primary"
          :loading="isJoiningRoom"
          :disabled="!canJoin || isBusy"
          class="mt-6 h-13 rounded-2xl font-bold"
        >
          {{ t('home.joinBtn') }}
        </UButton>
      </form>

      <div class="my-6 flex items-center gap-3">
        <div class="h-px flex-1 bg-white/10" />

        <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">
          {{ t('home.otherChoice') }}
        </span>

        <div class="h-px flex-1 bg-white/10" />
      </div>

      <div class="grid gap-3">
        <button
          v-for="game in games"
          :key="game.id"
          type="button"
          class="group w-full rounded-3xl border border-white/10 bg-neutral-950/60 p-4 text-left transition hover:border-primary-400/40 hover:bg-primary-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isBusy || game.disabled"
          @click="createGameRoom(game.id)"
        >
          <div class="flex items-center gap-4">
            <!-- <div class="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl p-1 transition group-hover:bg-primary-500/20">
              <img
                :src="game.image"
                :alt="game.name"
                draggable="false"
                class="size-[115%] -translate-y-2 object-cover transition duration-200 group-hover:scale-105"
              >
            </div> -->

            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-lg font-black text-neutral-50">
                    {{ game.name }}
                  </h2>

                  <p class="mt-1 text-sm text-neutral-300">
                    {{ game.description }}
                  </p>
                </div>

                <div class="shrink-0">
                  <div
                    v-if="loadingGameId !== game.id"
                    class="grid size-14 place-items-center rounded-full bg-primary-500/10 text-primary-300 ring-1 ring-white/5 transition duration-200 group-hover:bg-primary-500/20 group-hover:text-primary-200 group-hover:ring-primary-400/20"
                  >
                    <UIcon
                      name="i-lucide-chevron-right"
                      class="size-7 transition duration-200 group-hover:translate-x-0.5"
                    />
                  </div>

                  <div
                    v-else
                    class="grid size-14 place-items-center rounded-full bg-primary-500/10 text-primary-300 ring-1 ring-primary-400/20"
                  >
                    <UIcon
                      name="i-lucide-loader-circle"
                      class="size-6 animate-spin"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ninetySevenImage from '~/assets/images/games/ninety-seventy.png'
import { GameEnum } from '~/types/games'

type GameCard = {
  id: GameEnum
  name: string
  description: string
  image: string
  disabled?: boolean
}

const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const { createRoom, getRoom } = useRooms()

const games: GameCard[] = [
  {
    id: GameEnum.NINETY_SEVEN,
    name: 'Le 97',
    description: 'Revenez en primaire à faire des calculs mentaux. Attention à ne pas dépasser 97 !',
    image: ninetySevenImage
  }
]

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

const join = async () => {
  if (!canJoin.value || isBusy.value) {
    return
  }

  try {
    isJoiningRoom.value = true

    const room = await getRoom(code.value)

    if (!room) {
      toast.add({
        title: t('home.errors.roomNotFound.title'),
        description: t('home.errors.roomNotFound.subtitle'),
        icon: 'i-lucide-search-x',
        color: 'error'
      })

      return
    }

    await router.push(`/rooms/${code.value}`)
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

const createGameRoom = async (gameId: GameEnum) => {
  if (isBusy.value) {
    return
  }

  try {
    loadingGameId.value = gameId

    const room = await createRoom(gameId)
    await router.push(`/rooms/${room.code}`)
  } catch (error) {
    toast.add({
      title: t('home.errors.roomCreate.common'),
      description: error instanceof Error ? error.message : 'Réessaie dans quelques secondes.',
      icon: 'i-lucide-triangle-alert',
      color: 'error'
    })
  } finally {
    loadingGameId.value = null
  }
}
</script>