<template>
  <div class="pmu-bet">
    <p class="bet-title">
      {{ started ? t('games.pmu.bet.locked') : t('games.pmu.bet.title') }}
    </p>

    <div class="bet-grid">
      <button
        v-for="meta in PMU_SUITS"
        :key="meta.suit"
        type="button"
        class="bet-option"
        :class="{ active: suit === meta.suit }"
        :style="{ '--suit-color': meta.color }"
        :disabled="started"
        @click="emit('update:suit', meta.suit)"
      >
        <span class="bet-symbol">{{ meta.symbol }}</span>
        <span class="bet-label">{{ meta.label }}</span>
      </button>
    </div>

    <div class="mise-row">
      <span class="mise-label">{{ t('games.pmu.bet.miseLabel') }}</span>

      <div class="mise-stepper">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-minus"
          class="h-10 w-10 rounded-xl"
          :disabled="started || bet <= PMU_BET_MIN"
          @click="emit('update:bet', Math.max(PMU_BET_MIN, bet - 1))"
        />

        <span class="mise-value tabular-nums">{{ bet }}</span>

        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          class="h-10 w-10 rounded-xl"
          :disabled="started || bet >= PMU_BET_MAX"
          @click="emit('update:bet', Math.min(PMU_BET_MAX, bet + 1))"
        />
      </div>
    </div>

    <UButton
      block
      size="xl"
      color="primary"
      :icon="isConfirmed ? 'i-lucide-check' : 'i-lucide-hand-coins'"
      class="h-13 rounded-2xl font-black text-white"
      :disabled="started || !suit"
      @click="emit('confirm')"
    >
      {{ confirmLabel }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { CardSuit } from '~/types/cards'
import { PMU_SUITS, PMU_BET_MIN, PMU_BET_MAX } from '~/types/games/pmu'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  suit?: CardSuit | null
  bet?: number
  started?: boolean
  isConfirmed?: boolean
}>(), {
  suit: null,
  bet: 1,
  started: false,
  isConfirmed: false
})

const emit = defineEmits<{
  'update:suit': [value: CardSuit]
  'update:bet': [value: number]
  confirm: []
}>()

const confirmLabel = computed(() => {
  if (props.isConfirmed) {
    return t('games.pmu.bet.confirmed', { count: props.bet })
  }

  return t('games.pmu.bet.confirm', { count: props.bet })
})
</script>

<style scoped>
.pmu-bet {
  width: min(94vw, 520px);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bet-title {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-neutral-400);
}

.bet-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.bet-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem 0.25rem;
  border-radius: 18px;
  background: rgb(10 15 28 / 0.6);
  border: 2px solid rgb(255 255 255 / 0.08);
  color: var(--suit-color);
  transition: transform 150ms ease, border-color 150ms ease, background 150ms ease;
}

.bet-option:not(:disabled):active {
  transform: scale(0.96);
}

.bet-option.active {
  border-color: var(--color-primary-400);
  background: rgb(255 255 255 / 0.06);
}

.bet-option:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.bet-symbol {
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 12px;
  background: white;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1;
}

.bet-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--color-neutral-200);
}

.mise-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.35rem 0.5rem;
}

.mise-label {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-neutral-200);
}

.mise-stepper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mise-value {
  min-width: 2rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--color-neutral-50);
}
</style>
