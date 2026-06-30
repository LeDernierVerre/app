<template>
    <div class="mt-6 rounded-3xl border border-white/10 bg-neutral-950/60 p-4">
        <div class="flex items-center justify-between gap-3">
        <div class="text-left">
            <p class="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {{ t('room.code.title') }}
            </p>

            <p class="mt-1 font-mono text-2xl font-black tracking-[0.25em] text-neutral-50">
            {{ code }}
            </p>
        </div>

        <div class="flex items-center gap-2">
            <UButton
                icon="i-lucide-copy"
                color="neutral"
                variant="soft"
                class="rounded-2xl"
                @click="copyCode"
            />

            <UDrawer
            v-model:open="isQrDrawerOpen"
            :handle="false"
            :ui="{
                overlay: 'bg-neutral-950/80 backdrop-blur-sm',
                content: 'bg-transparent ring-0'
            }"
            >
            <UButton
                icon="i-mdi-qrcode"
                color="neutral"
                variant="soft"
                class="rounded-2xl"
            />

            <template #content>
                <div
                class="w-full rounded-t-[36px] border-t border-neutral-700 bg-neutral-900 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl"
                >
                <div class="flex items-center gap-3">
                    <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-x"
                    class="rounded-full text-neutral-300 hover:bg-neutral-800"
                    @click="isQrDrawerOpen = false"
                    />

                    <h2 class="text-2xl font-black text-primary-400">
                        {{ t('room.code.qrcodeTitle') }}
                    </h2>
                </div>

                <div class="mt-7 grid place-items-center">
                    <div class="rounded-[32px] bg-white p-5 shadow-xl">
                    <img
                        :src="`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${code}`"
                        :alt="`QR Code salle ${code}`"
                        class="size-60"
                    >
                    </div>

                    <p class="mt-5 text-xs font-bold uppercase tracking-wider text-neutral-500">
                        {{ t('room.code.copy') }}
                    </p>

                    <p class="mt-1 font-mono text-3xl font-black tracking-[0.3em] text-neutral-50">
                    {{ code }}
                    </p>
                </div>
                </div>
            </template>
            </UDrawer>
        </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const toast = useToast()
const {t} = useI18n()

const isQrDrawerOpen = ref(false)

const p = defineProps<{
    code: string;
}>();

const copyCode = async () => {
  await navigator.clipboard.writeText(p.code)

  toast.add({
    title: t('room.code.copied'),
    description: p.code,
    icon: 'i-lucide-copy-check',
    color: 'success',
    duration: 2000
  })
}
</script>