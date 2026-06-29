<template>
  <div class="card-piles">
    <CardDiscardPile
      ref="discardPileRef"
      :discard-pile="discardPile"
      :can-drop="canDrop"
      @on-drop="$emit('onDrop')"
    />

    <CardDrawPile
      ref="drawPileRef"
      @on-draw-finished="$emit('onDrawFinished')"
    />
  </div>
</template>

<script setup lang="ts">
import type { Card } from '~/types/cards'
import CardDiscardPile from './CardDiscardPile.vue'
import CardDrawPile from './CardDrawPile.vue'

defineProps<{
  discardPile?: Card[]
  canDrop: boolean
}>()

defineEmits(["onDrop", "onDrawFinished"])

const discardPileRef = ref<InstanceType<typeof CardDiscardPile> | null>(null)
const drawPileRef = ref<InstanceType<typeof CardDrawPile> | null>(null)

const triggerDropAnimation = () => {
  discardPileRef.value?.triggerDropAnimation()
}

const toggleDrawAnimation = (card: Card, callback: () => void) => {
  drawPileRef.value?.triggerDrawAnimation(card, callback)
}

defineExpose({
  triggerDropAnimation,
  toggleDrawAnimation
})
</script>

<style scoped>
.card-piles {
  display: flex;
  flex-direction: column;
  gap: 1em;
  align-items: center;
}
</style>