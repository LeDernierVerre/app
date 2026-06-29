<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="!hasUsername"
        class="fixed inset-0 z-[9999] grid place-items-center bg-neutral-950/70 p-4 backdrop-blur-sm"
      >
        <form
          class="w-full max-w-sm rounded-3xl border border-white/10 bg-neutral-900 p-6 text-center shadow-2xl"
          @submit.prevent="submit"
        >
          <h2 class="mt-5 text-2xl font-black text-neutral-50">
            {{ t('userGate.title') }}
          </h2>

          <p class="mt-2 text-sm text-neutral-300">
            {{ t('userGate.message') }}
          </p>

          <div class="mt-6 text-left">
            <label class="mb-2 block text-sm font-semibold text-neutral-200">
              {{ t('userGate.placeholder') }}
            </label>

            <UInput
              v-model="input"
              icon="i-lucide-user"
              size="xl"
              placeholder="Ex: bluntwise"
              autofocus
              :disabled="loading"
              :ui="{
                root: 'w-full',
                base: 'h-13 rounded-2xl bg-neutral-950/60 text-neutral-50 ring-white/10 placeholder:text-neutral-500 focus:ring-primary-400'
              }"
            />
          </div>

          <p
            v-if="error"
            class="mt-3 text-sm font-medium text-error-500"
          >
            {{ error }}
          </p>

          <UButton
            type="submit"
            block
            size="xl"
            color="primary"
            :loading="loading"
            :disabled="!canSubmit"
            class="mt-6 h-13 rounded-2xl font-bold"
          >
            {{ t('userGate.confirm') }}
          </UButton>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/core/useAuth'

const { loginAsGuest, hasUsername } = useAuth()
const {t} = useI18n();

const input = ref('')
const loading = ref(false)
const error = ref('')

const canSubmit = computed(() => {
  return input.value.trim().length >= 2 && !loading.value
})

const submit = async () => {
  const username = input.value.trim()

  if (username.length < 2) {
    error.value = t('userGate.errors.tooFewCharacters')
    return
  }

  try {
    loading.value = true
    error.value = ''

    await loginAsGuest(username)
  } catch {
    error.value = t('userGate.errors.internalError')
  } finally {
    loading.value = false
  }
}
</script>