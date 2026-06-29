<template>
  <div class="game-players-layout">
    <div
      v-for="seat in seats"
      :key="`${seat.position}-${seat.player.id}`"
      class="player-seat"
      :class="[
        `seat-${seat.position}`,
        {
          active: seat.playerIdx === currentPlayerIdx,
          self: seat.position === 'bottom',
          disconnected: seat.isDisconnected
        }
      ]"
    >
      <div class="player-avatar-wrapper">
        <UAvatar
          :alt="seat.player.username"
          size="3xl"
        />

        <div
          v-if="seat.isDisconnected"
          class="disconnected-badge"
        >
          <UIcon
            name="i-lucide-wifi-off"
            class="size-3.5"
          />
        </div>
      </div>

      <div class="player-name">
        {{ seat.player.username }}
      </div>

      <div
        v-if="seat.isDisconnected"
        class="player-status"
      >
        {{ t('games.ninetySeventy.offlinePlayers.disconnectedLabel') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/core/useAuth'
import type { GameSessionPlayer } from '~/types/games'

type SeatPosition = 'bottom' | 'top' | 'left' | 'right'

const {t} = useI18n()
const {
  username: selfUsername,
  id: selfPlayerId
} = useAuth()

const props = defineProps<{
  players: GameSessionPlayer[]
  currentPlayerIdx: number
  disconnectedPlayerIds?: string[]
}>()

const disconnectedPlayerIdsSet = computed(() => {
  return new Set(props.disconnectedPlayerIds ?? [])
})

const selfIdx = computed(() => {
  if (!props.players.length) {
    return -1
  }

  if (selfPlayerId.value) {
    const idx = props.players.findIndex(player => player.id === selfPlayerId.value)

    if (idx !== -1) {
      return idx
    }
  }

  if (selfUsername.value) {
    const idx = props.players.findIndex(player => player.username === selfUsername.value)

    if (idx !== -1) {
      return idx
    }
  }

  return 0
})

const orderedPlayers = computed(() => {
  const players = props.players.map((player, playerIdx) => ({
    player,
    playerIdx,
    isDisconnected: disconnectedPlayerIdsSet.value.has(player.id)
  }))

  if (selfIdx.value === -1) {
    return []
  }

  return [
    ...players.slice(selfIdx.value),
    ...players.slice(0, selfIdx.value)
  ]
})

const getPositions = (count: number): SeatPosition[] => {
  if (count <= 1) {
    return ['bottom']
  }

  if (count === 2) {
    return ['bottom', 'top']
  }

  if (count === 3) {
    return ['bottom', 'right', 'left']
  }

  return ['bottom', 'right', 'top', 'left']
}

const seats = computed(() => {
  const players = orderedPlayers.value.slice(0, 4)
  const positions = getPositions(players.length)

  return players.map((entry, index) => ({
    ...entry,
    position: positions[index]
  }))
})
</script>

<style scoped>
.game-players-layout {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.player-seat {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition:
    transform 180ms ease,
    filter 180ms ease,
    opacity 180ms ease;
}

.player-avatar-wrapper {
  position: relative;
}

.player-seat.active :deep(.rounded-full) {
  outline: 3px solid var(--color-primary-300);
  outline-offset: 3px;
}

.player-seat.disconnected {
  opacity: 0.55;
  filter: grayscale(0.85);
}

.player-seat.disconnected.active :deep(.rounded-full) {
  outline: 3px solid var(--color-warning-400);
  outline-offset: 3px;
}

.disconnected-badge {
  position: absolute;
  right: -0.35rem;
  bottom: -0.35rem;
  display: grid;
  place-items: center;
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 9999px;
  border: 2px solid var(--color-neutral-950);
  background: var(--color-warning-500);
  color: white;
}

.player-name {
  max-width: 7rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 9999px;
  background: rgb(10 15 28 / 0.78);
  padding: 0.2rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-neutral-50);
  backdrop-filter: blur(8px);
}

.player-status {
  border-radius: 9999px;
  background: rgb(245 158 11 / 0.16);
  padding: 0.15rem 0.45rem;
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--color-warning-300);
}

.seat-bottom {
  left: 50%;
  bottom: 9.5rem;
  transform: translateX(-50%);
}

.seat-top {
  left: 50%;
  top: 1rem;
  transform: translateX(-50%);
}

.seat-left {
  left: 0.85rem;
  top: 45%;
  transform: translateY(-50%);
}

.seat-right {
  right: 0.85rem;
  top: 45%;
  transform: translateY(-50%);
}
</style>