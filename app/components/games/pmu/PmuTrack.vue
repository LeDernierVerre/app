<template>
  <div class="pmu-track">
    <div class="finish-line" />

    <div class="arena">
      <div class="malus-column">
        <div
          v-for="handicap in handicaps"
          :key="handicap.step"
          class="malus-slot"
          :style="{ '--frac': stepFraction(handicap.step) }"
        >
          <PlayingCard
            v-if="handicap.card"
            :rank="handicap.card.rank"
            :suit="handicap.card.suit"
            size="xs"
          />
          <PlayingCard
            v-else
            face-down
            size="xs"
          />
        </div>
      </div>

      <div class="lanes">
        <div
          v-for="meta in PMU_SUITS"
          :key="meta.suit"
          class="lane"
          :class="{ winner: winner === meta.suit }"
        >
          <div
            class="horse"
            :style="{
              '--frac': horseFraction(meta.suit),
              '--suit-color': meta.color
            }"
          >
            <span class="horse-symbol">{{ meta.symbol }}</span>
          </div>
        </div>
      </div>

      <div class="drawn-card">
        <p class="drawn-label">
          {{ t('games.pmu.track.lastCard') }}
        </p>

        <Transition name="drawn" mode="out-in">
          <PlayingCard
            v-if="lastDrawnCard"
            :key="`${lastDrawnCard.rank}-${lastDrawnCard.suit}`"
            :rank="lastDrawnCard.rank"
            :suit="lastDrawnCard.suit"
            size="sm"
          />
          <PlayingCard
            v-else
            face-down
            size="sm"
          />
        </Transition>
      </div>
    </div>

    <div class="bet-legend">
      <div
        v-for="meta in PMU_SUITS"
        :key="meta.suit"
        class="bet-lane"
      >
        <div
          class="bet-badge"
          :style="{ '--suit-color': meta.color }"
        >
          {{ meta.symbol }}
        </div>

        <div
          v-if="bettorsForSuit(meta.suit).length"
          class="bet-avatars"
        >
          <UAvatar
            v-for="player in bettorsForSuit(meta.suit)"
            :key="player.id"
            :alt="player.username"
            size="2xs"
            class="ring-2 ring-neutral-950"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card, CardSuit } from '~/types/cards'
import type { GameSessionPlayer } from '~/types/games'
import { PMU_SUITS, type PmuHandicap } from '~/types/games/pmu'
import PlayingCard from '../shared/cards/PlayingCard.vue'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  position?: Record<CardSuit, number>
  stepNumber?: number
  handicaps?: PmuHandicap[]
  lastDrawnCard?: Card | null
  players?: GameSessionPlayer[]
  choices?: Record<string, CardSuit>
  winner?: CardSuit | null
}>(), {
  stepNumber: 6,
  handicaps: () => [],
  lastDrawnCard: null,
  winner: null
})

const stepFraction = (step: number) => {
  return props.stepNumber > 0 ? step / props.stepNumber : 0
}

const horseFraction = (suit: CardSuit) => {
  const step = props.position?.[suit] ?? 0
  const clamped = Math.max(0, Math.min(step, props.stepNumber))

  return props.stepNumber > 0 ? clamped / props.stepNumber : 0
}

const bettorsForSuit = (suit: CardSuit): GameSessionPlayer[] => {
  const players = props.players ?? []
  const choices = props.choices ?? {}

  return players.filter(player => choices[player.id] === suit)
}
</script>

<style scoped>
.pmu-track {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(94vw, 520px);
}

.finish-line {
  height: 0;
  border-top: 4px dotted var(--color-neutral-500);
  margin: 0 0.25rem;
}

.arena {
  position: relative;
  display: flex;
  gap: 0.75rem;
  height: 46vh;
  min-height: 300px;
}

.malus-column {
  position: relative;
  width: 2.75rem;
  flex-shrink: 0;
}

.malus-slot {
  position: absolute;
  left: 0;
  width: 100%;
  bottom: calc(var(--frac) * (100% - 3.85rem));
  display: flex;
  justify-content: center;
}

.lanes {
  position: relative;
  flex: 1;
  display: flex;
  gap: 0.4rem;
}

.lane {
  position: relative;
  flex: 1;
  border-radius: 14px;
  background: rgb(255 255 255 / 0.03);
  border: 1px solid rgb(255 255 255 / 0.05);
  transition: border-color 200ms ease, background 200ms ease;
}

.lane.winner {
  border-color: var(--color-primary-400);
  background: rgb(255 255 255 / 0.08);
}

.horse {
  position: absolute;
  left: 50%;
  bottom: calc(var(--frac) * (100% - 3.25rem));
  transform: translateX(-50%);
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 3.25rem;
  border-radius: 10px;
  background: white;
  color: var(--suit-color);
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.45);
  transition: bottom 450ms cubic-bezier(0.22, 1, 0.36, 1);
}

.horse-symbol {
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1;
}

.drawn-card {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.drawn-label {
  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-neutral-400);
}

.bet-legend {
  display: flex;
  gap: 0.4rem;
  padding-left: calc(2.75rem + 0.75rem);
}

.bet-lane {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.bet-badge {
  display: grid;
  place-items: center;
  width: 100%;
  max-width: 3rem;
  aspect-ratio: 5 / 7;
  border-radius: 10px;
  background: white;
  color: var(--suit-color);
  font-size: 1.4rem;
  font-weight: 900;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.35);
}

.bet-avatars {
  display: flex;
}

.bet-avatars > :not(:first-child) {
  margin-left: -0.4rem;
}

.drawn-enter-active,
.drawn-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.drawn-enter-from,
.drawn-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}
</style>
