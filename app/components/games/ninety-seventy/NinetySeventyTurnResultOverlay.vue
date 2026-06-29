<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        :class="requiresAck
          ? 'pointer-events-auto bg-neutral-950/60 backdrop-blur-sm'
          : 'pointer-events-none bg-neutral-950/25 backdrop-blur-[2px]'
        "
      >
        <div class="pointer-events-auto w-full max-w-[22rem] rounded-3xl border border-white/10 bg-neutral-900 p-5 text-center shadow-xl sm:p-6">
          <div
            class="mx-auto grid size-14 place-items-center rounded-2xl sm:size-16"
            :class="isCorrect ? 'bg-success-500/10 text-success-500' : 'bg-error-500/10 text-error-500'"
          >
            <UIcon
              :name="isCorrect ? 'i-lucide-check' : 'i-lucide-x'"
              class="size-8 sm:size-9"
            />
          </div>

          <h2 class="mt-4 text-xl font-black text-neutral-50 sm:text-2xl">
            {{ title }}
          </h2>

          <p class="mt-2 text-sm text-neutral-300 sm:text-base">
            {{ message }}
          </p>

          <div
            v-if="penalty > 0"
            class="mt-4 text-3xl font-black text-error-500"
          >
            +{{ penalty }} pénalité{{ penalty > 1 ? 's' : '' }}
          </div>

          <UButton
            v-if="requiresAck"
            block
            size="xl"
            color="primary"
            class="mt-6 h-12 rounded-2xl font-semibold sm:h-13"
            @click="acknowledge"
          >
            {{ t('games.ninetySeventy.turnResult.confirm') }}
          </UButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  isSelf: boolean
  playerName: string
  announcedTotal: number
  realTotal: number
  penalty: number
  isCorrect: boolean
  duration?: number
}>(), {
  duration: 1_000
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  acknowledge: []
}>()

let timeout: ReturnType<typeof setTimeout> | null = null

const {t} = useI18n();
const progressKey = ref(0)

const requiresAck = computed(() => {
  return props.isSelf && !props.isCorrect && props.penalty > 0
})

const title = computed(() => {
  if (props.isSelf) {
    return props.isCorrect
      ? t('games.ninetySeventy.turnResult.title.correct.self')
      : t('games.ninetySeventy.turnResult.title.incorrect.self')
  }

  return props.isCorrect
    ? t('games.ninetySeventy.turnResult.title.correct.other', {player: props.playerName})
    : t('games.ninetySeventy.turnResult.title.incorrect.other', {player: props.playerName})
})

const message = computed(() => {
  if (props.isCorrect) {
    return props.isSelf
      ? t('games.ninetySeventy.turnResult.subtitle.correct.self', {
        total: props.announcedTotal
      })
      : t('games.ninetySeventy.turnResult.subtitle.correct.other', {
        player: props.playerName,
        total: props.announcedTotal
      })
  }

  return props.isSelf
    ? t('games.ninetySeventy.turnResult.subtitle.incorrect.self', {
        total: props.announcedTotal,
        realTotal: props.realTotal
      })
    : t('games.ninetySeventy.turnResult.subtitle.incorrect.other', {
        player: props.playerName,
        total: props.announcedTotal,
        realTotal: props.realTotal
      })
})

const clearTimer = () => {
  if (!timeout) {
    return
  }

  clearTimeout(timeout)
  timeout = null
}

const startTimer = () => {
  clearTimer()

  if (!props.open) {
    return
  }

  progressKey.value++

  if (requiresAck.value) {
    return
  }

  timeout = setTimeout(() => {
    emit('update:open', false)
  }, props.duration)
}

const acknowledge = () => {
  emit('acknowledge')
  emit('update:open', false)
}

watch(
  () => [props.open, requiresAck.value, props.duration],
  startTimer,
  { immediate: true }
)

onBeforeUnmount(clearTimer)
</script>

<style scoped>
@keyframes turn-result-progress {
  from {
    width: 100%;
  }

  to {
    width: 0%;
  }
}
</style>