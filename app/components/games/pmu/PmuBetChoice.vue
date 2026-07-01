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
        :class="{ active: modelValue === meta.suit }"
        :style="{ '--suit-color': meta.color }"
        :disabled="started"
        @click="select(meta.suit)"
      >
        <span class="bet-symbol">{{ meta.symbol }}</span>
        <span class="bet-label">{{ meta.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CardSuit } from '~/types/cards'
import { PMU_SUITS } from '~/types/games/pmu'

const { t } = useI18n()

defineProps<{
  modelValue?: CardSuit | null
  started?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CardSuit]
  select: [value: CardSuit]
}>()

const select = (suit: CardSuit) => {
  emit('update:modelValue', suit)
  emit('select', suit)
}
</script>

<style scoped>
.pmu-bet {
  width: min(92vw, 520px);
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
  padding: 0.75rem 0.25rem;
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
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 12px;
  background: white;
  font-size: 1.4rem;
  font-weight: 900;
  line-height: 1;
}

.bet-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--color-neutral-200);
}
</style>
