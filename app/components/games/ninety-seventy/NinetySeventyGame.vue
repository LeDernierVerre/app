<template>
  <NinetySeventyTurnResultOverlay
    v-if="turnResultData"
    v-model:open="isTurnResultOpen"
    v-bind="turnResultData"
    @acknowledge="turnResultData = null"
  />

  <NinetySeventyGameEnd
    v-model:open="isGameEndOpen"
    :result="gameResult"
    @home="goHome"
  />

  <NinetySeventyTotalGuess
    v-model="announcedTotal"
    v-model:open="isAnnouncedTotalOpened"
    :min="NINETY_SEVENTY_MIN_GUESS"
    :max="NINETY_SEVENTY_MAX_GUESS"
    @confirm="dropCard"
  />

  <NinetySeventyJackChoice
    v-model:open="isJackChoiceOpen"
    :suit="selectedCard?.suit"
    @confirm="onJackChoice"
  />

  <div
    v-if="publicData"
    class="layout"
  >
    <CardPiles
      ref="cardPilesRef"
      :can-drop="canPlay && selectedCardIdx !== -1"
      :discard-pile="publicData.discardPile ?? []"
      @on-drop="startDropFlow"
    />

    <NinetySeventyPlayersLayout
      :players="publicData.players ?? []"
      :current-player-idx="publicData.currentPlayerIdx ?? 0"
    />

    <NinetySeventyPlayerHUD
      v-if="canPlay"
      :cards="handCards"
      :selected-card-idx="selectedCardIdx"
      @on-select="(idx: number) => selectedCardIdx = idx"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  NINETY_SEVENTY_MAX_GUESS,
  NINETY_SEVENTY_MIN_GUESS,
  type NinetySeventyAction,
  type NinetySeventyPrivateData,
  type NinetySeventyPublicData,
  type NinetySeventyTurnResult,
  type NinetySeventyTurnResultOverlayData
} from '~/types/games/ninety-seventy.js'

import type { Card } from '~/types/cards.js'

import { useAuth } from '~/composables/core/useAuth.js'

import CardPiles from '../shared/cards/CardPiles.vue'
import NinetySeventyPlayersLayout from './NinetySeventyPlayersLayout.vue'
import NinetySeventyPlayerHUD from './NinetySeventyPlayerHUD.vue'
import NinetySeventyTotalGuess from './NinetySeventyTotalGuess.vue'
import NinetySeventyJackChoice from './NinetySeventyJackChoice.vue'
import NinetySeventyTurnResultOverlay from './NinetySeventyTurnResultOverlay.vue'
import NinetySeventyGameEnd from './NinetySeventyGameEnd.vue'
import type { GamePropsData, GameSessionPlayer } from '../../../types/games.js'

type JackChoice = -10 | 10

type NinetySeventyGameResult = {
  loser: {
    id: string
    username: string
  }
}

const props = defineProps<GamePropsData<
  NinetySeventyPrivateData,
  NinetySeventyPublicData
>>()

const router = useRouter()
const { sendAction } = useGameSocket<NinetySeventyAction>()
const auth = useAuth()

const selfPlayerId = computed(() => {
  return auth.id?.value ?? null
})

const selfUsername = computed(() => {
  return auth.username?.value ?? null
})

const cardPilesRef = ref<InstanceType<typeof CardPiles> | null>(null)

const publicData = ref<(NinetySeventyPublicData & {
  isFinished?: boolean
  gameResult?: NinetySeventyGameResult | null
}) | null>(null)

const handCards = ref<Card[]>([])
const pendingDrawnCards = ref<Card[]>([])
const lastDrawnCardKey = ref<string | null>(null)

const selectedCardIdx = ref<number>(-1)

const isAnnouncedTotalOpened = ref<boolean>(false)
const announcedTotal = ref<number | null>(null)

const isJackChoiceOpen = ref<boolean>(false)
const jackChoice = ref<JackChoice | null>(null)

const isTurnResultOpen = ref(false)
const turnResultData = ref<NinetySeventyTurnResultOverlayData | null>(null)
const lastShownTurnResultId = ref<string | null>(null)

const isGameEndOpen = ref(false)

const isSamePlayer = (player?: Partial<GameSessionPlayer> | null) => {
  if (!player) {
    return false
  }

  if (selfPlayerId.value && player.id === selfPlayerId.value) {
    return true
  }

  if (selfUsername.value && player.username === selfUsername.value) {
    return true
  }

  return false
}

const currentPlayer = computed(() => {
  const players = publicData.value?.players ?? []
  const currentPlayerIdx = publicData.value?.currentPlayerIdx

  if (typeof currentPlayerIdx !== 'number') {
    return null
  }

  return players[currentPlayerIdx] ?? null
})

const isCurrentPlayer = computed(() => {
  return isSamePlayer(currentPlayer.value)
})

const isGameFinished = computed(() => {
  return publicData.value?.isFinished === true
})

const gameResult = computed(() => {
  return publicData.value?.gameResult ?? null
})

const canPlay = computed(() => {
  return isCurrentPlayer.value && !isGameFinished.value
})

const selectedCard = computed(() => {
  if (selectedCardIdx.value === -1) {
    return null
  }

  return handCards.value[selectedCardIdx.value] ?? null
})

const isSelectedCardJack = computed(() => {
  return selectedCard.value?.rank === 'J'
})

const getCardKey = (card: Card) => {
  return `${card.rank}-${card.suit}`
}

const resetCurrentAction = () => {
  selectedCardIdx.value = -1
  announcedTotal.value = null
  jackChoice.value = null
  isAnnouncedTotalOpened.value = false
  isJackChoiceOpen.value = false
}

const goHome = async () => {
  await router.push('/')
}

const showTurnResult = (result: NinetySeventyTurnResult) => {
  if (result.id === lastShownTurnResultId.value) {
    return
  }

  lastShownTurnResultId.value = result.id

  turnResultData.value = {
    isSelf: isSamePlayer(result.playedPlayer),
    playerName: result.playedPlayer.username,
    announcedTotal: result.announcedTotal,
    realTotal: result.realTotal,
    penalty: result.penalty,
    isCorrect: result.isCorrect
  }

  isTurnResultOpen.value = true
}

const handlePublicData = (data: (NinetySeventyPublicData & {
  isFinished?: boolean
  gameResult?: NinetySeventyGameResult | null
}) | null) => {
  if (!data) {
    return
  }

  publicData.value = {
    ...(publicData.value ?? {}),
    ...data
  }

  if (data.lastTurnResult) {
    showTurnResult(data.lastTurnResult)
  }

  if (data.isFinished || data.gameResult) {
    resetCurrentAction()
    isGameEndOpen.value = true
  }
}

const addCardToHand = (card: Card) => {
  handCards.value = [
    ...handCards.value,
    card
  ]
}

const handleDrawnCard = (card: Card) => {
  const cardKey = getCardKey(card)

  if (lastDrawnCardKey.value === cardKey) {
    return
  }

  lastDrawnCardKey.value = cardKey

  if (cardPilesRef.value) {
    cardPilesRef.value.toggleDrawAnimation(card, () => {
      addCardToHand(card)
    })

    return
  }

  addCardToHand(card)
}

const initHand = (cards: Card[]) => {
  handCards.value = [
    ...cards,
    ...pendingDrawnCards.value
  ]

  pendingDrawnCards.value = []
}

const handlePrivateData = (data: NinetySeventyPrivateData | null) => {
  if (!data) {
    return
  }

  if (data.drawnCard) {
    handleDrawnCard(data.drawnCard)
    return
  }

  if (data.cards) {
    initHand(data.cards)
  }
}

watch(
  () => props.publicData,
  handlePublicData,
  {
    immediate: true
  }
)

watch(
  () => props.privateData,
  handlePrivateData,
  {
    immediate: true
  }
)

watch(canPlay, value => {
  if (value) {
    return
  }

  resetCurrentAction()
})

watch(isGameFinished, value => {
  if (!value) {
    return
  }

  resetCurrentAction()
  isGameEndOpen.value = true
})

const startDropFlow = () => {
  if (!canPlay.value) {
    return
  }

  const cardIdx = selectedCardIdx.value

  if (cardIdx === -1 || !handCards.value[cardIdx]) {
    return
  }

  jackChoice.value = null

  if (isSelectedCardJack.value) {
    isJackChoiceOpen.value = true
    return
  }

  openTotalGuess()
}

const onJackChoice = (value: JackChoice) => {
  if (!canPlay.value) {
    return
  }

  jackChoice.value = value
  openTotalGuess()
}

const openTotalGuess = () => {
  announcedTotal.value = null
  isAnnouncedTotalOpened.value = true
}

const dropCard = (total?: number) => {
  if (!canPlay.value) {
    return
  }

  const cardIdx = selectedCardIdx.value
  const finalTotal = total ?? announcedTotal.value

  if (
    cardIdx === -1 ||
    finalTotal === null ||
    !handCards.value[cardIdx]
  ) {
    return
  }

  sendAction('play-card', {
    cardIdx,
    announcedTotal: finalTotal,
    ...(jackChoice.value !== null ? { jackChoice: jackChoice.value } : {})
  })

  handCards.value = handCards.value.filter((_, index) => index !== cardIdx)

  resetCurrentAction()

  cardPilesRef.value?.triggerDropAnimation()
}

watch(
  () => publicData.value?.discardPile?.length,
  (newLength, oldLength) => {
    if (
      typeof newLength !== 'number' ||
      typeof oldLength !== 'number' ||
      newLength <= oldLength
    ) {
      return
    }

    cardPilesRef.value?.triggerDropAnimation()
  }
)
</script>

<style scoped>
.layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 78vh;
}
</style>