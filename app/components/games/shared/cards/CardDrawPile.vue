<template>
    <div class="card-take">
        <PlayingCard :face-down="true" size="md" />

        <Transition name="draw-card">
            <div
                v-if="drawnCardAnimation"
                :key="`${drawnCardAnimation.rank}-${drawnCardAnimation.suit}-${drawAnimationKey}`"
                class="drawn-card-animation"
            >
                <PlayingCard
                    :rank="drawnCardAnimation.rank"
                    :suit="drawnCardAnimation.suit"
                    size="lg"
                />
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import type { Card } from '~/types/cards';
import PlayingCard from './PlayingCard.vue';

const DRAW_DURATION = 520

const drawnCardAnimation = ref<Card | null>(null)
const drawAnimationKey = ref(0)

const emit = defineEmits(["onDrawFinished"]);

let drawTimeout: ReturnType<typeof setTimeout> | null = null

const triggerDrawAnimation = (card: Card, callback: () => void) => {
  if (drawTimeout) {
    clearTimeout(drawTimeout)
  }

  drawnCardAnimation.value = null
  drawAnimationKey.value++

  requestAnimationFrame(() => {
    drawnCardAnimation.value = card;
    drawTimeout = setTimeout(() => {
      callback()
      drawnCardAnimation.value = null
    }, DRAW_DURATION - 40)
  })
}

defineExpose({
    triggerDrawAnimation
})
</script>

<style scoped>
.card-take {
  position: relative;
}

.drawn-card-animation {
  position: fixed;
  left: calc(50% + 112px);
  top: 50%;
  z-index: 999;
  pointer-events: none;
}

.draw-card-enter-active {
  animation: draw-to-hand 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.draw-card-leave-active {
  display: none;
}

.draw-card-leave-to {
  opacity: 0;
}

@keyframes draw-to-hand {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.78) rotate(8deg);
    filter: blur(2px);
  }

  18% {
    opacity: 1;
    transform: translate(-50%, -72%) scale(1.05) rotate(-4deg);
    filter: blur(0);
  }

  72% {
    opacity: 1;
    transform: translate(-50%, 32vh) scale(0.92) rotate(8deg);
    filter: blur(0);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, 40vh) scale(0.82) rotate(12deg);
    filter: blur(1px);
  }
}
</style>