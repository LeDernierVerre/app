<template>
  <UModal
    v-model:open="openModel"
    :dismissible="false"
    :ui="{
      overlay: 'bg-neutral-950/75 backdrop-blur-sm',
      content: 'w-[min(92vw,440px)] rounded-[32px] bg-neutral-900 ring-1 ring-white/10 shadow-2xl'
    }"
  >
    <template #content>
      <div class="p-6 text-center">
        <h2 class="text-3xl font-black text-neutral-50">
          {{ t('games.pmu.end.title') }}
        </h2>

        <div class="mt-5 flex items-center justify-center gap-3">
          <span
            v-if="winnerMeta"
            class="grid h-14 w-14 place-items-center rounded-2xl bg-white text-3xl font-black"
            :style="{ color: winnerMeta.color }"
          >
            {{ winnerMeta.symbol }}
          </span>

          <div class="text-left">
            <p class="text-xs font-black uppercase tracking-wider text-neutral-500">
              {{ t('games.pmu.end.winner') }}
            </p>
            <p class="text-2xl font-black text-neutral-50">
              {{ winnerMeta?.label ?? '—' }}
            </p>
          </div>
        </div>

        <div
          v-if="sortedResults.length"
          class="mt-5 flex flex-col gap-2"
        >
          <div
            v-for="result in sortedResults"
            :key="result.id"
            class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-950/40 px-4 py-3"
            :class="{ 'ring-2 ring-primary-500/50': result.id === selfId }"
          >
            <div class="flex items-center gap-3 min-w-0">
              <UAvatar :alt="result.username" size="sm" />
              <span class="truncate text-sm font-black text-neutral-50">
                {{ result.username }}
              </span>
            </div>

            <span
              class="shrink-0 text-sm font-black"
              :class="result.won ? 'text-primary-300' : 'text-error-400'"
            >
              {{ result.won
                ? t('games.pmu.end.distributes', { count: result.gorgees })
                : t('games.pmu.end.drinks', { count: result.gorgees }) }}
            </span>
          </div>
        </div>

        <UButton
          block
          size="xl"
          color="primary"
          icon="i-lucide-home"
          class="mt-6 h-13 rounded-2xl font-bold"
          @click="emit('home')"
        >
          {{ t('games.pmu.end.backToHome') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { CardSuit } from '~/types/cards'
import { getSuitMeta, type PmuResult } from '~/types/games/pmu'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  winner?: CardSuit | null
  results?: PmuResult[] | null
  selfId?: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  home: []
}>()

const openModel = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const winnerMeta = computed(() => {
  return props.winner ? getSuitMeta(props.winner) : null
})

// Gagnants d'abord, puis mise la plus élevée.
const sortedResults = computed(() => {
  return [...(props.results ?? [])].sort((a, b) => {
    if (a.won !== b.won) {
      return a.won ? -1 : 1
    }

    return b.gorgees - a.gorgees
  })
})
</script>
