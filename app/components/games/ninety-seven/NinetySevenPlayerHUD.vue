<template>
  <div class="player-hud">
    <div
      class="player-cards"
      :style="{ '--cards-count': String(cards?.length ?? 0) }"
    >
      <button
        v-for="(card, index) in cards ?? []"
        :key="`${card.rank}-${card.suit}-${index}`"
        type="button"
        class="player-card"
        :class="{ active: index === selectedCardIdx }"
        :style="getArcStyle(index, cards?.length ?? 0)"
        @click="selectCard(index)"
      >
        <PlayingCard
          :rank="card.rank"
          :suit="card.suit"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Card } from '~/types/cards'
import PlayingCard from '../shared/cards/PlayingCard.vue'

const props = defineProps<{
  cards?: Card[]
  selectedCardIdx: number
}>()

const emit = defineEmits<{
  'on-select': [idx: number]
}>()

const selectCard = (idx: number) => {
  emit('on-select', props.selectedCardIdx === idx ? -1 : idx)
}

const getArcStyle = (index: number, total: number): Record<string, string> => {
  const middle = (total - 1) / 2
  const offset = index - middle
  const absOffset = Math.abs(offset)

  const rotationStep = total <= 4
    ? 9
    : total <= 6
      ? 7
      : total <= 8
        ? 5.5
        : 4.2

  const translateYStep = total <= 4
    ? 18
    : total <= 6
      ? 14
      : total <= 8
        ? 10
        : 7

  const translateXStep = total <= 6 ? -4 : -2

  return {
    '--card-rotation': `${offset * rotationStep}deg`,
    '--card-translate-y': `${absOffset * translateYStep}px`,
    '--card-translate-x': `${offset * translateXStep}px`,
    '--card-z-index': `${100 - absOffset}`
  }
}
</script>

<style scoped>
.player-hud {
  position: fixed;
  left: 0;
  right: 0;
  bottom: max(-1.25rem, calc(env(safe-area-inset-bottom) - 2rem));
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none;
  overflow: visible;
}

.player-cards {
  --card-scale: 1;
  --card-overlap: -0.65rem;
  --active-lift: 24px;

  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  max-width: 100vw;
  padding-inline: clamp(0.35rem, 2vw, 1rem);
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  overflow: visible;
  pointer-events: auto;
}

.player-card {
  display: block;
  flex: 0 0 auto;
  margin-inline: var(--card-overlap);
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  transform:
    translateX(var(--card-translate-x))
    translateY(var(--card-translate-y))
    rotate(var(--card-rotation))
    scale(var(--card-scale));
  transform-origin: 50% 145%;
  z-index: var(--card-z-index);
  transition:
    transform 180ms ease,
    filter 180ms ease;
}

.player-card.active {
  transform:
    translateX(var(--card-translate-x))
    translateY(calc(var(--card-translate-y) - var(--active-lift)))
    rotate(var(--card-rotation))
    scale(calc(var(--card-scale) * 1.06));
  z-index: 999;
  filter: drop-shadow(0 18px 24px rgba(59, 130, 246, 0.35));
}

@media (max-width: 640px) {
  .player-hud {
    bottom: max(-1.75rem, calc(env(safe-area-inset-bottom) - 2.35rem));
  }

  .player-cards {
    --card-scale: 0.82;
    --card-overlap: -1.15rem;
    --active-lift: 22px;
  }
}

@media (max-width: 430px) {
  .player-cards {
    --card-scale: 0.72;
    --card-overlap: -1.45rem;
    --active-lift: 20px;
    padding-inline: 0.25rem;
  }
}

@media (max-width: 360px) {
  .player-cards {
    --card-scale: 0.64;
    --card-overlap: -1.65rem;
    --active-lift: 18px;
  }
}

@media (min-width: 768px) {
  .player-cards {
    --card-scale: 1;
    --card-overlap: -0.65rem;
    --active-lift: 24px;
  }
}

@media (min-width: 1024px) {
  .player-hud {
    bottom: -1.25rem;
  }

  .player-cards {
    --card-scale: 1.05;
    --card-overlap: -0.55rem;
  }
}
</style>