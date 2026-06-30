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

          <h2 class="text-2xl font-black text-primary-400">
            {{ t('home.chooseGameTitle') }}
          </h2>
        </div>

        <div class="mt-7 grid gap-3">
          <button
            v-for="game in games"
            :key="game.id"
            type="button"
            class="group w-full rounded-3xl border border-neutral-700 bg-neutral-800 p-4 text-left transition hover:border-primary-500 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isBusy || game.disabled"
            @click="createGameRoom(game.id)"
          >
            <div class="flex items-center gap-2">
              <img
                :src="game.image"
                :alt="game.name"
                class="h-25 w-25 shrink-0 object-cover"
              />

              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <h3 class="text-lg font-black text-white">
                      {{ game.name }}
                    </h3>

                    <p class="mt-1 text-sm text-neutral-300">
                      {{ game.description }}
                    </p>
                  </div>
                </div>
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
    name: t('home.games.ninetySeven.title'),
    description: t('home.games.ninetySeven.description'),
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