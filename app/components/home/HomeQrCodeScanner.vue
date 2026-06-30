<template>
  <UDrawer
    v-model:open="isQrDrawerOpen"
    :handle="false"
    :ui="{
      overlay: 'bg-neutral-950/80 backdrop-blur-sm',
      content: 'bg-transparent ring-0'
    }"
  >
    <UButton
      type="button"
      size="xl"
      color="primary"
      variant="soft"
      icon="i-mdi-qrcode-scan"
      :disabled="isBusy"
      class="flex h-13 w-13 items-center justify-center rounded-2xl p-0"
      :ui="{
        leadingIcon: 'mx-auto size-6'
      }"
      aria-label="Scanner un QRCode"
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
            {{ t('home.qrCodeScanner.title') }}
          </h2>
        </div>

        <div class="mt-8 overflow-hidden rounded-[28px] border border-neutral-700 bg-neutral-950">
          <div class="relative aspect-square w-full">
            <video
              ref="qrVideo"
              class="size-full object-cover"
              autoplay
              muted
              playsinline
            />

            <div
              v-if="isScanningQr"
              class="absolute inset-0 grid place-items-center bg-neutral-950 text-white"
            >
              <div class="text-center">
                <UIcon
                  name="i-lucide-loader-circle"
                  class="mx-auto size-12 animate-spin text-primary-400"
                />

                <p class="mt-6 text-lg font-medium">
                  {{ t('home.qrCodeScanner.openingCamera') }}
                </p>
              </div>
            </div>

            <div
              v-if="qrScannerError"
              class="absolute inset-0 grid place-items-center bg-neutral-950 px-6 text-center text-white"
            >
              <div>
                <UIcon
                  name="i-lucide-camera-off"
                  class="mx-auto size-12 text-primary-400"
                />

                <p class="mt-5 text-lg font-bold">
                  {{ t('home.qrCodeScanner.openingError') }}
                </p>

                <p class="mt-2 text-sm text-neutral-300">
                  {{ qrScannerError }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
const isQrDrawerOpen = ref(false)
const isScanningQr = ref(false)
const qrScannerError = ref<string | null>(null)
const qrVideo = ref<HTMLVideoElement | null>(null)
    
const toast = useToast()
const {t} = useI18n()

const props = defineProps<{
    isBusy: boolean;
    joinCode: (code: string) => Promise<void>;
}>();
const emit = defineEmits(["onValue"]);

let qrReader: any = null
let qrControls: { stop: () => void } | null = null
let hasScannedQr = false

const extractRoomCodeFromQr = (text: string) => {
  const trimmed = text.trim()

  try {
    const url = new URL(trimmed, window.location.origin)
    const parts = url.pathname.split('/').filter(Boolean)
    const roomIndex = parts.indexOf('rooms')

    if (roomIndex !== -1 && parts[roomIndex + 1]) {
      return parts[roomIndex + 1]!.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    }
  } catch {}

  const match = trimmed.toUpperCase().match(/[A-Z0-9]{6}/)

  return match?.[0] ?? ''
}

const startQrScanner = async () => {
  if (!qrVideo.value) {
    return
  }

  stopQrScanner()

  try {
    isScanningQr.value = true
    qrScannerError.value = null

    const { BrowserQRCodeReader } = await import('@zxing/browser')

    qrReader ??= new BrowserQRCodeReader()

    qrControls = await qrReader.decodeFromVideoDevice(
      undefined,
      qrVideo.value,
      async (result: any) => {
        if (!result || hasScannedQr) {
          return
        }

        hasScannedQr = true

        const scannedCode = extractRoomCodeFromQr(result.getText())

        if (!scannedCode) {
          toast.add({
            title: t('home.errors.qrCode.invalidQrCode'),
            icon: 'i-lucide-qr-code',
            color: 'error'
          })

          hasScannedQr = false

          return
        }

        emit('onValue', scannedCode.split(' '))
        isQrDrawerOpen.value = false
        stopQrScanner()

        await props.joinCode(scannedCode)
      }
    )

    isScanningQr.value = false
  } catch (error) {
    qrScannerError.value = error instanceof Error ? error.message : 'Autorise l’accès à la caméra puis réessaie.'
    isScanningQr.value = false
  }
}
const stopQrScanner = () => {
  qrControls?.stop()
  qrControls = null
  isScanningQr.value = false
  hasScannedQr = false
}

watch(isQrDrawerOpen, async isOpen => {
  if (isOpen) {
    await nextTick()
    await startQrScanner()

    return
  }

  stopQrScanner()
})

onBeforeUnmount(() => {
  stopQrScanner()
})
</script>