<script setup lang="ts">
import { computed } from 'vue'
import type { CardRank } from '~/types/cards'
import { CardSuit } from '~/types/cards'

type CardSize = 'sm' | 'md' | 'lg'

type PipPosition = {
  x: number
  y: number
  rotate?: number
  scale?: number
}

const props = withDefaults(defineProps<{
  rank?: CardRank
  suit?: CardSuit
  faceDown?: boolean
  selected?: boolean
  size?: CardSize
}>(), {
  rank: 'A',
  suit: CardSuit.SPADES,
  faceDown: false,
  selected: false,
  size: 'md'
})

const suits: Record<CardSuit, {
  symbol: string
  label: string
  color: string
}> = {
  [CardSuit.SPADES]: {
    symbol: '♠',
    label: 'Spades',
    color: '#111827',
  },
  [CardSuit.HEARTS]: {
    symbol: '♥',
    label: 'Hearts',
    color: '#ef4444',
  },
  [CardSuit.DIAMONDS]: {
    symbol: '♦',
    label: 'Diamonds',
    color: '#ef4444',
  },
  [CardSuit.CLUBS]: {
    symbol: '♣',
    label: 'Clubs',
    color: '#111827',
  },
}

const suitData = computed(() => suits[props.suit])
const isFigure = computed(() => ['J', 'Q', 'K'].includes(props.rank))

const sizeClass = computed(() => ({
  sm: 'card-sm',
  md: 'card-md',
  lg: 'card-lg',
}[props.size]))

const pipLayouts: Partial<Record<CardRank, PipPosition[]>> = {
  A: [
    { x: 50, y: 52, scale: 2.5 },
  ],
  '2': [
    { x: 50, y: 28 },
    { x: 50, y: 72 },
  ],
  '3': [
    { x: 50, y: 25 },
    { x: 50, y: 50 },
    { x: 50, y: 75 },
  ],
  '4': [
    { x: 35, y: 28 },
    { x: 65, y: 28 },
    { x: 35, y: 72 },
    { x: 65, y: 72 },
  ],
  '5': [
    { x: 35, y: 28 },
    { x: 65, y: 28 },
    { x: 50, y: 50 },
    { x: 35, y: 72 },
    { x: 65, y: 72 },
  ],
  '6': [
    { x: 35, y: 25 },
    { x: 65, y: 25 },
    { x: 35, y: 50 },
    { x: 65, y: 50 },
    { x: 35, y: 75 },
    { x: 65, y: 75 },
  ],
  '7': [
    { x: 35, y: 23 },
    { x: 65, y: 23 },
    { x: 50, y: 38 },
    { x: 35, y: 52 },
    { x: 65, y: 52 },
    { x: 35, y: 77 },
    { x: 65, y: 77 },
  ],
  '8': [
    { x: 35, y: 22 },
    { x: 65, y: 22 },
    { x: 50, y: 36 },
    { x: 35, y: 50 },
    { x: 65, y: 50 },
    { x: 50, y: 64 },
    { x: 35, y: 78 },
    { x: 65, y: 78 },
  ],
  '9': [
    { x: 35, y: 20 },
    { x: 65, y: 20 },
    { x: 35, y: 35 },
    { x: 65, y: 35 },
    { x: 50, y: 50 },
    { x: 35, y: 65 },
    { x: 65, y: 65 },
    { x: 35, y: 80 },
    { x: 65, y: 80 },
  ],
  '10': [
    { x: 35, y: 18 },
    { x: 65, y: 18 },
    { x: 50, y: 30 },
    { x: 35, y: 40 },
    { x: 65, y: 40 },
    { x: 35, y: 60 },
    { x: 65, y: 60 },
    { x: 50, y: 70 },
    { x: 35, y: 82 },
    { x: 65, y: 82 },
  ],
}

const pips = computed(() => pipLayouts[props.rank] ?? [])
</script>

<template>
  <div
    class="playing-card"
    :class="[sizeClass, { selected }]"
    :style="{ '--suit-color': suitData.color }"
  >
    <div v-if="faceDown" class="card-back">
      <div class="back-pattern" />
      <div class="back-center">
        <div class="back-logo">
          {{ "CARD" }}
        </div>
      </div>
    </div>

    <div v-else class="card-front">
      <div class="corner corner-top">
        <span class="corner-rank">{{ rank }}</span>
        <span class="corner-suit">{{ suitData.symbol }}</span>
      </div>

      <div class="corner corner-bottom">
        <span class="corner-rank">{{ rank }}</span>
        <span class="corner-suit">{{ suitData.symbol }}</span>
      </div>

      <div v-if="isFigure" class="figure">
        <div class="figure-card">
          <span class="figure-rank">{{ rank }}</span>
        </div>
      </div>

      <div v-else class="pip-zone">
        <span
          v-for="(pip, index) in pips"
          :key="index"
          class="pip"
          :style="{
            left: `${pip.x}%`,
            top: `${pip.y}%`,
            transform: `translate(-50%, -50%) rotate(${pip.rotate ?? 0}deg) scale(${pip.scale ?? 1})`
          }"
        >
          {{ suitData.symbol }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playing-card {
  position: relative;
  aspect-ratio: 5 / 7;
  border-radius: 18px;
  user-select: none;
  transform-style: preserve-3d;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    translate 160ms ease;
}

.playing-card.selected {
  translate: 0 -10px;
}

.card-sm {
  width: 86px;
}

.card-md {
  width: 128px;
}

.card-lg {
  width: 172px;
}

.card-front,
.card-back {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  box-shadow:
    0 14px 28px rgb(15 23 42 / 0.16),
    inset 0 0 0 1px rgb(255 255 255 / 0.75);
}

.card-front {
  background:
    radial-gradient(circle at 50% 0%, rgb(255 255 255) 0%, rgb(248 250 252) 42%, rgb(241 245 249) 100%);
  border: 1px solid rgb(226 232 240);
  color: var(--suit-color);
}

.corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  line-height: 0.9;
  font-weight: 900;
}

.corner-top {
  top: 9%;
  left: 10%;
}

.corner-bottom {
  right: 10%;
  bottom: 9%;
}

.corner-rank {
  font-size: 1.05em;
  letter-spacing: -0.08em;
}

.corner-suit {
  margin-top: 0.22em;
  font-size: 0.9em;
}

.pip-zone {
  position: absolute;
  inset: 16% 16%;
}

.pip {
  position: absolute;
  font-size: 1.45em;
  font-weight: 900;
  line-height: 1;
}

.figure {
  position: absolute;
  inset: 22% 18%;
  display: grid;
  place-items: center;
}

.figure-card {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  border-radius: 22px;
}

.figure-rank {
  font-size: 3.4em;
  font-weight: 950;
  letter-spacing: -0.12em;
  transform: translateX(-0.05em);
}

.figure-suit {
  position: absolute;
  bottom: 14%;
  right: 16%;
  font-size: 1.8em;
}

.card-back {
  background: #111827;
  border: 3px solid rgb(51 65 85);
}

.back-pattern {
  position: absolute;
  inset: 10px;
  border-radius: 14px;
  opacity: 0.75;
}

.back-center {
  position: absolute;
  inset: 22%;
  display: grid;
  place-items: center;
  border-radius: 20px;  
}

.back-logo {
  color: white;
  font-size: 1.15em;
  font-weight: 950;
  letter-spacing: 0.04em;
}
</style>