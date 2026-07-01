<template>
  <PmuGameEnd
    v-model:open="isGameEndOpen"
    :winner="winner"
    :results="results"
    :self-id="selfPlayerId"
    @home="goHome"
  />

  <div
    v-if="publicData"
    class="pmu-layout"
  >
    <PmuTrack
      :position="publicData.position"
      :step-number="publicData.stepNumber ?? 6"
      :handicaps="publicData.handicaps ?? []"
      :last-drawn-card="publicData.lastDrawnCard ?? null"
      :players="publicData.players ?? []"
      :choices="publicData.choices ?? {}"
      :winner="winner"
    />

    <PmuBetChoice
      v-if="!isFinished"
      v-model:suit="betSuit"
      v-model:bet="betAmount"
      :started="started"
      :is-confirmed="isConfirmed"
      @confirm="confirmBet"
    />

    <div class="pmu-controls">
      <UButton
        v-if="isHost && !isFinished"
        block
        size="xl"
        color="primary"
        :icon="started ? 'i-lucide-play' : 'i-lucide-flag'"
        class="h-13 rounded-2xl font-black"
        @click="playRound"
      >
        {{ started ? t('games.pmu.controls.next') : t('games.pmu.controls.start') }}
      </UButton>

      <p
        v-else-if="!isFinished"
        class="pmu-waiting"
      >
        {{ started ? t('games.pmu.controls.racing') : t('games.pmu.controls.waitingHost') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CardSuit } from '~/types/cards'
import type { GamePropsData } from '~/types/games'
import {
  PMU_BET_DEFAULT,
  type PmuAction,
  type PmuPrivateData,
  type PmuPublicData
} from '~/types/games/pmu'

import { useAuth } from '~/composables/core/useAuth'

import PmuTrack from './PmuTrack.vue'
import PmuBetChoice from './PmuBetChoice.vue'
import PmuGameEnd from './PmuGameEnd.vue'

const props = defineProps<GamePropsData<PmuPrivateData, PmuPublicData>>()

const { t } = useI18n()
const router = useRouter()
const auth = useAuth()
const { sendAction } = useGameSocket<PmuAction>()

const publicData = ref<PmuPublicData | null>(null)

const betSuit = ref<CardSuit | null>(null)
const betAmount = ref<number>(PMU_BET_DEFAULT)

const isGameEndOpen = ref(false)

const selfPlayerId = computed(() => auth.id?.value ?? null)

const started = computed(() => publicData.value?.started === true)
const isFinished = computed(() => publicData.value?.isFinished === true)
const winner = computed(() => publicData.value?.winner ?? null)
const results = computed(() => publicData.value?.results ?? null)

const isHost = computed(() => {
  const hostId = publicData.value?.hostId
  return !!hostId && !!selfPlayerId.value && hostId === selfPlayerId.value
})

const isConfirmed = computed(() => {
  const id = selfPlayerId.value
  return !!id && !!publicData.value?.choices?.[id]
})

const confirmBet = () => {
  if (started.value || !betSuit.value) {
    return
  }

  sendAction('make-choice', {
    choice: {
      cardSuit: betSuit.value,
      bet: betAmount.value
    }
  })
}

const playRound = () => {
  if (isFinished.value) {
    return
  }

  sendAction('play-round')
}

const goHome = async () => {
  await router.push('/')
}

watch(
  () => props.publicData,
  data => {
    if (!data) {
      return
    }

    publicData.value = data

    // Le pari confirmé par le serveur fait autorité (couleur + mise).
    const confirmed = selfPlayerId.value
      ? data.choices?.[selfPlayerId.value]
      : undefined

    if (confirmed) {
      betSuit.value = confirmed.cardSuit
      betAmount.value = confirmed.bet
    }

    if (data.isFinished) {
      isGameEndOpen.value = true
    }
  },
  { immediate: true }
)

watch(
  () => props.privateData,
  data => {
    if (data?.choice) {
      betSuit.value = data.choice.cardSuit
      betAmount.value = data.choice.bet
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.pmu-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-height: 100vh;
  padding: 4rem 1rem 1.5rem;
}

.pmu-controls {
  width: min(94vw, 520px);
  margin-top: auto;
}

.pmu-waiting {
  text-align: center;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-neutral-400);
}
</style>
