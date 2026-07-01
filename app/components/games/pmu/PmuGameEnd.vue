<template>
  <UModal
    v-model:open="openModel"
    :dismissible="false"
    :ui="{
      overlay: 'bg-neutral-950/75 backdrop-blur-sm',
      content: 'w-[min(92vw,420px)] rounded-[32px] bg-neutral-900 ring-1 ring-white/10 shadow-2xl'
    }"
  >
    <template #content>
      <div class="p-6 text-center">
        <h2 class="mt-2 text-3xl font-black text-neutral-50">
          {{ t('games.pmu.end.title') }}
        </h2>

        <div class="mt-5 rounded-3xl border border-white/10 bg-neutral-950/40 p-5">
          <p class="text-xs font-black uppercase tracking-wider text-neutral-500">
            {{ t('games.pmu.end.winner') }}
          </p>

          <div class="mt-3 flex items-center justify-center gap-3">
            <span
              v-if="winnerMeta"
              class="grid h-14 w-14 place-items-center rounded-2xl bg-white text-3xl font-black"
              :style="{ color: winnerMeta.color }"
            >
              {{ winnerMeta.symbol }}
            </span>

            <p class="text-2xl font-black text-neutral-50">
              {{ winnerMeta?.label ?? '—' }}
            </p>
          </div>
        </div>

        <p
          v-if="myBet"
          class="mt-4 text-sm font-bold"
          :class="didWin ? 'text-primary-300' : 'text-error-400'"
        >
          {{ didWin ? t('games.pmu.end.youWon') : t('games.pmu.end.youLost') }}
        </p>

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
import { getSuitMeta } from '~/types/games/pmu'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  winner?: CardSuit | null
  myBet?: CardSuit | null
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

const didWin = computed(() => {
  return !!props.myBet && props.myBet === props.winner
})
</script>
