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
        <h2 class="mt-5 text-3xl font-black text-neutral-50">
          {{ t('games.ninetySeventy.end.title')  }}
        </h2>

        <div class="mt-4 rounded-3xl border border-white/10 bg-neutral-950/40 p-4">
          <p class="text-xs font-black uppercase tracking-wider text-neutral-500">
            Perdant
          </p>

          <div class="mt-3 flex items-center justify-center gap-3">
            <UAvatar
              :alt="result?.loser.username"
              size="lg"
            />

            <p class="max-w-48 truncate text-lg font-black text-neutral-50">
              {{ result?.loser.username }}
            </p>
          </div>
        </div>

        <UButton
          block
          size="xl"
          color="primary"
          icon="i-lucide-home"
          class="mt-6 h-13 rounded-2xl font-bold"
          @click="emit('home')"
        >
          {{ t('games.ninetySeventy.end.backToHome') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
type GameResult = {
  loser: {
    id: string
    username: string
  }
}

const props = defineProps<{
  open: boolean
  result: GameResult | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  home: []
}>()

const openModel = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const {t} = useI18n()
</script>