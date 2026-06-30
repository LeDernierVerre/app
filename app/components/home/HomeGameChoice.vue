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
            @click="createGameRoom(game.id)"
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
}

const games: GameCard[] = [
  {
    id: GameEnum.NINETY_SEVEN,
    name: 'home.games.ninetySeven.title',
    description: 'home.games.ninetySeven.description',
    image: ninetySevenCover
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

const createGameRoom = async (gameId: GameEnum) => {
  if (isBusy.value) {
    return
  }

  try {
    loadingGameId.value = gameId
    emit('onGameId', gameId)

    const room = await createRoom(gameId)

    isCreateDrawerOpen.value = false

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