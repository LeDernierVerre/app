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
          <UIcon
            name="i-mdi-counter"
            class="size-9"
          />
        </div>

        <h2 class="mt-4 text-xl font-black text-neutral-50">
          {{ $t('games.ninetySeventy.totalGuess.title') }}
        </h2>

        <span class="mt-2 text-center text-sm font-normal text-neutral-300">
          {{ $t('games.ninetySeventy.totalGuess.subtitle') }}
        </span>

        <div class="mt-6">
          <UInputNumber
            v-model="value"
            :min="min"
            :max="max"
            :step="1"
            :placeholder="String(min)"
            size="xl"
            color="primary"
            variant="outline"
            autofocus
            :ui="{
              root: 'w-36',
              base: 'h-16 rounded-2xl text-center text-3xl font-black text-neutral-50 bg-neutral-950/70 ring-white/10 focus:ring-primary-300 placeholder:text-neutral-500',
              increment: 'text-neutral-50',
              decrement: 'text-neutral-50'
            }"
            @keydown.enter="confirm"
          />
        </div>

        <UButton
          block
          size="xl"
          color="primary"
          :disabled="!canConfirm"
          class="mt-6 h-13 rounded-2xl font-semibold"
          @click="confirm"
        >
          {{ $t('games.ninetySeventy.totalGuess.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  modelValue: number | null
  min: number
  max: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:modelValue': [value: number | null]
  confirm: [value: number]
}>()

const localValue = ref<number | null>(null)

const openModel = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const clamp = (value: number) => {
  return Math.min(props.max, Math.max(props.min, value))
}

const value = computed<number | null>({
  get: () => localValue.value,
  set: newValue => {
    if (
      newValue === null ||
      newValue === undefined ||
      Number.isNaN(newValue)
    ) {
      localValue.value = null
      emit('update:modelValue', null)
      return
    }

    const clampedValue = clamp(Number(newValue))

    localValue.value = clampedValue
    emit('update:modelValue', clampedValue)
  }
})

const canConfirm = computed(() => {
  return (
    localValue.value !== null &&
    localValue.value !== undefined &&
    !Number.isNaN(localValue.value)
  )
})

watch(
  () => props.open,
  open => {
    if (!open) {
      return
    }

    localValue.value = props.modelValue
  }
)

watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue
  }
)

const close = () => {
  emit('update:open', false)
}

const confirm = () => {
  if (!canConfirm.value || localValue.value === null) {
    return
  }

  const finalValue = clamp(localValue.value)

  localValue.value = finalValue

  emit('update:modelValue', finalValue)
  emit('confirm', finalValue)
  emit('update:open', false)
}
</script>