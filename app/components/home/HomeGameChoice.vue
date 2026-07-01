<template>
  <UDrawer
    v-model:open="isCreateDrawerOpen"
    :handle="false"
    :ui="{
      overlay: 'bg-neutral-950/70',
      content: 'bg-transparent ring-0'
    }"
  >
  <UButton
    type="button"
    block
    size="xl"
    color="primary"
    icon="i-lucide-plus"
    :disabled="isBusy"
    class="h-14 rounded-2xl text-neutral-300 font-black text-white shadow-lg shadow-primary-950/30 transition hover:bg-primary-800 active:scale-[0.98]"
  >
    {{ t('home.createBtn') }}
  </UButton>

    <template #content>
      <div
        class="w-full rounded-t-[36px] border-t border-white/10 bg-neutral-950 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div class="flex items-center gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            class="h-11 w-11 rounded-full text-neutral-300 hover:bg-white/10 hover:text-white"
            @click="isCreateDrawerOpen = false"
          />

          <h2 class="text-3xl font-black text-white">
            {{ t('home.chooseGameTitle') }}
          </h2>
        </div>

        <div class="mt-7 grid gap-4">
          <button
            v-for="game in games"
            :key="game.id"
            type="button"
            class="group flex w-full items-center gap-4 rounded-[28px] border border-white/10 bg-neutral-800/90 p-4 text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-primary-400/50 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isBusy || game.disabled"
            :class="loadingGameId === game.id ? 'pointer-events-none opacity-60' : ''"
            @click="onGameClick(game)"
          >
            <div
              class="grid h-20 w-20 shrink-0 place-items-center rounded-[24px] border border-white/10 bg-neutral-950/50"
            >
              <img
                v-if="game.image"
                :src="game.image"
                :alt="t(game.name)"
                class="h-14 w-14 object-contain drop-shadow-xl transition group-hover:scale-110"
              />

              <UIcon
                v-else
                name="i-lucide-gamepad-2"
                class="h-9 w-9 text-primary-300"
              />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h3 class="truncate text-xl font-black text-white">
                  {{ t(game.name) }}
                </h3>

                <span
                  v-if="game.disabled"
                  class="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-neutral-400"
                >
                  Bientôt
                </span>
              </div>

              <p class="mt-1 line-clamp-2 text-sm font-medium leading-relaxed text-neutral-300">
                {{ t(game.description) }}
              </p>
            </div>

            <UIcon
              name="i-lucide-chevron-right"
              class="h-6 w-6 shrink-0 text-neutral-500 transition group-hover:translate-x-1 group-hover:text-primary-300"
            />
          </button>
        </div>
      </div>
    </template>
  </UDrawer>

  <UDrawer
    v-model:open="isOptionsDrawerOpen"
    :handle="false"
    :ui="{
      overlay: 'bg-neutral-950/70',
      content: 'bg-transparent ring-0'
    }"
  >
    <template #content>
      <div
        class="w-full rounded-t-[36px] border-t border-white/10 bg-neutral-950 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div class="flex items-center gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            class="h-11 w-11 rounded-full text-neutral-300 hover:bg-white/10 hover:text-white"
            @click="backToGameList"
          />

          <h2 class="text-2xl font-black text-white">
            {{ t('home.games.pmu.options.title') }}
          </h2>
        </div>

        <div class="mt-7 rounded-[28px] border border-white/10 bg-neutral-800/90 p-5">
          <p class="text-sm font-bold text-neutral-300">
            {{ t('home.games.pmu.options.stepLabel') }}
          </p>

          <div class="mt-4 flex items-center justify-between gap-4">
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-minus"
              size="xl"
              class="h-14 w-14 rounded-2xl"
              :disabled="stepNumber <= PMU_STEP_MIN"
              @click="stepNumber = Math.max(PMU_STEP_MIN, stepNumber - 1)"
            />

            <span class="min-w-16 text-center text-4xl font-black text-white tabular-nums">
              {{ stepNumber }}
            </span>

            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-plus"
              size="xl"
              class="h-14 w-14 rounded-2xl"
              :disabled="stepNumber >= PMU_STEP_MAX"
              @click="stepNumber = Math.min(PMU_STEP_MAX, stepNumber + 1)"
            />
          </div>

          <p class="mt-3 text-center text-xs font-medium text-neutral-500">
            {{ t('home.games.pmu.options.stepHint', { min: PMU_STEP_MIN, max: PMU_STEP_MAX }) }}
          </p>
        </div>

        <UButton
          type="button"
          block
          size="xl"
          color="primary"
          icon="i-lucide-check"
          :disabled="isBusy || !pendingGame"
          :class="pendingGame && loadingGameId === pendingGame.id ? 'pointer-events-none opacity-60' : ''"
          class="mt-6 h-14 rounded-2xl font-black text-white"
          @click="confirmPmuCreate"
        >
          {{ t('home.games.pmu.options.confirm') }}
        </UButton>
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import { GameEnum } from '~/types/games'
import ninetySevenCover from '~/assets/images/games/ninety-seven/cover.png'

const { createRoom } = useRooms()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()

type GameCard = {
  id: GameEnum
  name: string
  description: string
  image?: string
  disabled?: boolean
  configurable?: boolean
}

const PMU_STEP_MIN = 3
const PMU_STEP_MAX = 12
const PMU_STEP_DEFAULT = 6

const games: GameCard[] = [
  {
    id: GameEnum.NINETY_SEVEN,
    name: 'home.games.ninetySeven.title',
    description: 'home.games.ninetySeven.description',
    image: ninetySevenCover
  },
  {
    id: GameEnum.PMU,
    name: 'home.games.pmu.title',
    description: 'home.games.pmu.description',
    configurable: true
  }
]

const emit = defineEmits<{
  onGameId: [gameId: GameEnum | null]
}>()

const props = defineProps<{
  isBusy: boolean
}>()

const { isBusy } = toRefs(props)

const loadingGameId = ref<GameEnum | null>(null)
const isCreateDrawerOpen = ref(false)
const isOptionsDrawerOpen = ref(false)
const pendingGame = ref<GameCard | null>(null)
const stepNumber = ref(PMU_STEP_DEFAULT)

const onGameClick = (game: GameCard) => {
  if (isBusy.value || game.disabled) {
    return
  }

  if (game.configurable) {
    pendingGame.value = game
    stepNumber.value = PMU_STEP_DEFAULT
    isCreateDrawerOpen.value = false
    isOptionsDrawerOpen.value = true
    return
  }

  createGameRoom(game.id)
}

const backToGameList = () => {
  isOptionsDrawerOpen.value = false
  pendingGame.value = null
  isCreateDrawerOpen.value = true
}

const confirmPmuCreate = () => {
  if (!pendingGame.value) {
    return
  }

  createGameRoom(pendingGame.value.id, {
    stepNumber: stepNumber.value
  })
}

const createGameRoom = async (
  gameId: GameEnum,
  options?: Record<string, unknown>
) => {
  if (isBusy.value) {
    return
  }

  try {
    loadingGameId.value = gameId
    emit('onGameId', gameId)

    const room = await createRoom(gameId, options)

    isCreateDrawerOpen.value = false
    isOptionsDrawerOpen.value = false
    pendingGame.value = null

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
    emit('onGameId', null)
  }
}
</script>