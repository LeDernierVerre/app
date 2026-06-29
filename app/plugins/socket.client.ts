import { io } from "socket.io-client";

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    const socket = io(String(config.public.socketUrl), {
        autoConnect: true
    });

    return {
        provide: { socket }
    }
});