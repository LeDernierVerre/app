<template>
    <div class="mt-6 text-left">
        <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-black uppercase tracking-wider text-neutral-400">
            {{ t('room.playersTitle') }}
        </h2>
        </div>

        <div class="grid gap-2">
        <div
            v-for="player in players"
            :key="player.id"
            class="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/50 p-3"
        >
            <div class="relative shrink-0">
            <UAvatar
                :alt="player.username"
                size="lg"
            />

            <div
                v-if="player.isHost"
                class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-warning-400 text-neutral-950 ring-2 ring-neutral-950"
            >
                <UIcon
                name="i-lucide-crown"
                class="size-3.5"
                />
            </div>
            </div>

            <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-black text-neutral-50">
                    {{ player.username }}
                </p>
            </div>

            <!-- <UBadge
            v-if="player.isReady"
            color="success"
            variant="soft"
            class="rounded-full"
            >
            Prêt
            </UBadge> -->
        </div>

        <div
            v-if="!players.length"
            class="rounded-2xl border border-white/10 bg-neutral-950/50 p-4 text-center text-sm text-neutral-400"
        >
            {{ t("room.noPlayerFound") }}
        </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { RoomPlayer } from '~/types/rooms';

const {t} = useI18n()

defineProps<{
    players: RoomPlayer[];
}>();
</script>