<template>
  <UDrawer
    v-model:open="isCreateDrawerOpen"
    :handle="false"
    :ui="{
      overlay: 'bg-neutral-950/80 backdrop-blur-sm',
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
      class="h-13 rounded-2xl font-bold"
    >
      {{ t('home.createBtn') }}
    </UButton>

    <template #content>
      <div
        class="w-full rounded-t-[36px] border-t border-neutral-700 bg-neutral-900 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div class="flex items-center gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            class="rounded-full text-neutral-300 hover:bg-neutral-800"
            @click="isCreateDrawerOpen = false"
          />

          <h2 class="text-2xl font-black text-neutral-50">
            {{ t('home.chooseGameTitle') }}
          </h2>
        </div>

        <div class="relative mt-7 grid gap-4">
          <button
            v-for="game in games"
            :key="game.id"
            type="button"
            class="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-primary-400/20 via-neutral-800 to-secondary-400/10 p-4 text-left shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-primary-300/50 hover:shadow-primary-950/40 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-400/50 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isBusy || game.disabled"
            :class="loadingGameId === game.id ? 'pointer-events-none opacity-60' : ''"
            @click="createGameRoom(game.id)"
          >
            <div class="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-300/25 blur-2xl" />

            <div class="relative flex items-center gap-4">
              <div
                class="relative grid h-24 w-24 shrink-0 place-items-center rounded-[28px] border border-white/15 bg-white/10 shadow-inner"
              >
                <img
                  :src="game.image"
                  :alt="t(game.name)"
                  class="relative h-20 w-20 object-contain drop-shadow-2xl transition duration-200 group-hover:scale-110 group-hover:-rotate-3"
                />
              </div>

              <div class="min-w-0 flex-1">
                <h3 class="text-2xl font-black leading-none text-white">
                  {{ t(game.name) }}
                </h3>

                <p class="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-neutral-300">
                  {{ t(game.description) }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import { GameEnum } from '~/types/games';

import ninetySevenCover from "~/assets/images/games/ninety-seven/cover.png"

const { createRoom } = useRooms()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()

type GameCard = {
  id: GameEnum
  name: string
  description: string
  image?: string;
  disabled?: boolean
}

const games: GameCard[] = [
  {
    id: GameEnum.NINETY_SEVEN,
    name: 'home.games.ninetySeven.title',
    description: 'home.games.ninetySeven.description',
    image: ninetySevenCover
  },
  {
    id: GameEnum.SPOT_RUSH,
    name: 'home.games.spotRush.title',
    description: 'home.games.spotRush.description',
    image: ninetySevenCover
  }
]

const emit = defineEmits(["onGameId"])

const loadingGameId = ref<GameEnum | null>(null)
const isCreateDrawerOpen = ref(false)

const p = defineProps<{
    isBusy: boolean;
}>();
const {isBusy} = toRefs(p); 

const createGameRoom = async (gameId: GameEnum) => {
  if (isBusy.value) {
    return
  }

  try {
    loadingGameId.value = gameId
    emit('onGameId', gameId);

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
    emit('onGameId', null);
  }
}
</script>