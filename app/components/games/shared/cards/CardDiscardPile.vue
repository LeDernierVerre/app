<template>
  <div
    class="card-placement"
    :class="{
      'can-drop': canDrop,
      'is-dropping': isDropping
    }"
    @click="emit('onDrop')"
  >
    <Transition name="discard-pop" mode="out-in">
      <div
        v-if="lastDiscardedCard"
        :key="`${lastDiscardedCard.rank}-${lastDiscardedCard.suit}-${props.discardPile?.length}`"
        class="stack"
      >
        <PlayingCard
          :rank="lastDiscardedCard.rank"
          :suit="lastDiscardedCard.suit"
          size="md"
        />
      </div>
    </Transition>

    <div class="empty-card">
      <UIcon
        name="i-mdi-cards-playing"
        class="size-20 text-neutral-100"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Card } from '~/types/cards';
import PlayingCard from './PlayingCard.vue';

const emit = defineEmits(["onDrop"]);

const props = defineProps<{
  canDrop: boolean;
  discardPile?: Card[];
}>();

const isDropping = ref(false);
const lastDiscardedCard = ref<Card | null>(null);

let dropTimeout: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.discardPile,
  (value) => {
    lastDiscardedCard.value = value?.at(-1) ?? null;
  },
  {
    deep: true,
    immediate: true,
  }
);

const triggerDropAnimation = () => {
  if (dropTimeout) {
    clearTimeout(dropTimeout);
  }

  isDropping.value = false;

  requestAnimationFrame(() => {
    isDropping.value = true;

    dropTimeout = setTimeout(() => {
      isDropping.value = false;
    }, 420);
  });
};

defineExpose({
  triggerDropAnimation
});
</script>

<style scoped>
.card-placement {
  width: 140px;
  aspect-ratio: 5 / 7;
  border: 5px dotted var(--color-primary-50);
  color: var(--color-primary-50);
  background-color: rgba(20, 117, 225, 0.08);
  border-radius: 18px;
  position: relative;
  cursor: pointer;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.card-placement.can-drop {
  border-color: var(--color-primary-300);
  background-color: rgba(20, 117, 225, 0.16);
  box-shadow:
    0 0 0 1px rgba(115, 191, 255, 0.18),
    0 0 32px rgba(20, 117, 225, 0.24);
}

.card-placement.is-dropping {
  animation: placement-pulse 420ms ease;
}

.card-placement > .stack {
  position: relative;
  top: .2em;
  z-index: 2;
}

.card-placement > .empty-card {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  z-index: 1;
  opacity: 0.38;
  pointer-events: none;
}

.discard-pop-enter-active {
  animation: card-drop-in 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.discard-pop-leave-active {
  position: absolute;
  inset: 0;
  animation: card-drop-out 160ms ease forwards;
}

@keyframes card-drop-in {
  0% {
    opacity: 0;
    transform: translateY(-92px) scale(0.82) rotate(-12deg);
    filter: blur(2px);
  }

  58% {
    opacity: 1;
    transform: translateY(10px) scale(1.05) rotate(2deg);
    filter: blur(0);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
    filter: blur(0);
  }
}

@keyframes card-drop-out {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(0.92);
  }
}

@keyframes placement-pulse {
  0% {
    transform: scale(1);
    box-shadow:
      0 0 0 0 rgba(115, 191, 255, 0.35),
      0 0 24px rgba(20, 117, 225, 0.18);
  }

  55% {
    transform: scale(1.035);
    box-shadow:
      0 0 0 10px rgba(115, 191, 255, 0),
      0 0 44px rgba(20, 117, 225, 0.32);
  }

  100% {
    transform: scale(1);
    box-shadow:
      0 0 0 0 rgba(115, 191, 255, 0),
      0 0 24px rgba(20, 117, 225, 0.18);
  }
}
</style>