<template>
  <UModal
    v-model:open="openModel"
    :ui="{
      overlay: 'bg-neutral-950/65 backdrop-blur-sm',
      content: 'w-[min(92vw,360px)] rounded-[28px] bg-neutral-900 ring-1 ring-white/10 shadow-2xl'
    }"
  >
    <template #content>
      <div class="relative flex flex-col items-center p-6">
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          class="absolute right-3 top-3 rounded-full"
          @click="close"
        />

        <div class="grid size-16 place-items-center rounded-2xl text-primary-100">
          <UIcon name="i-mdi-cards-playing" class="size-9" />
        </div>

        <h2 class="mt-4 text-xl font-black text-neutral-50">
          {{ t('games.ninetySeventy.jackChoice.title') }}
        </h2>

        <span class="mt-2 text-center text-sm font-normal text-neutral-300">
          {{ t('games.ninetySeventy.jackChoice.subtitle') }}
        </span>

        <div class="mt-6">
          <PlayingCard
            rank="J"
            :suit="suit"
            size="md"
          />
        </div>

        <div class="mt-7 grid w-full grid-cols-2 gap-3">
          <UButton
            size="xl"
            color="error"
            variant="solid"
            class="h-14 justify-center rounded-2xl text-lg font-black"
            @click="choose(-10)"
          >
            -10
          </UButton>

          <UButton
            size="xl"
            color="primary"
            variant="solid"
            class="h-14 justify-center rounded-2xl text-lg font-black"
            @click="choose(10)"
          >
            +10
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { CardSuit } from '~/types/cards'
import PlayingCard from '../shared/cards/PlayingCard.vue'

type JackChoice = -10 | 10

const props = withDefaults(defineProps<{
  open: boolean
  suit?: CardSuit
}>(), {
  suit: CardSuit.SPADES
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [value: JackChoice]
}>()

const {t} = useI18n();

const openModel = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const close = () => {
  emit('update:open', false)
}

const choose = (value: JackChoice) => {
  emit('confirm', value)
  emit('update:open', false)
}
</script>