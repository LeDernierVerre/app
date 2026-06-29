<template>
  <div class="w-full max-w-md rounded-[32px] border border-white/10 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur">
    <div class="flex flex-col items-center">
      <div class="sk h-8 w-36 rounded-xl bg-primary-500/30" />
      <div class="sk mt-3 h-7 w-24 rounded-full bg-primary-500/20" />
    </div>

    <div class="mt-6 rounded-3xl border border-white/10 bg-neutral-950/60 p-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex-1">
          <div class="sk h-3 w-28 rounded-full bg-primary-500/15" />
          <div class="sk mt-3 h-8 w-44 rounded-xl bg-primary-500/25" />
        </div>

        <div class="sk size-10 rounded-2xl bg-primary-500/25" />
      </div>
    </div>

    <div class="mt-6">
      <div class="sk mb-3 h-4 w-20 rounded-full bg-primary-500/15" />

      <div class="grid gap-2">
        <div
          v-for="idx in 3"
          :key="idx"
          class="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/50 p-3"
        >
          <div class="sk size-10 rounded-full bg-primary-500/25" />

          <div class="min-w-0 flex-1">
            <div
              class="sk h-4 rounded-full bg-primary-500/20"
              :class="[
                idx === 1 && 'w-32',
                idx === 2 && 'w-24',
                idx === 3 && 'w-36'
              ]"
            />
          </div>

          <div
            class="sk h-6 rounded-full bg-primary-500/20"
            :class="[
              idx === 1 && 'w-14',
              idx === 2 && 'w-12',
              idx === 3 && 'w-16'
            ]"
          />
        </div>
      </div>
    </div>

    <div class="sk mt-6 h-13 w-full rounded-2xl bg-primary-500/25" />
    <div class="sk mt-3 h-13 w-full rounded-2xl bg-primary-500/15" />
  </div>
</template>

<style scoped>
.sk {
  animation: skeleton-pulse 1.15s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 1;
  }
}
</style>