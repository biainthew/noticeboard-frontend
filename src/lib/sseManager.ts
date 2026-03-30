import { fetchEventSource } from '@microsoft/fetch-event-source';
import { NotificationDetail } from './api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let controller: AbortController | null = null;

export const sseManager = {
    connect: (token: string, onMessage: (data: NotificationDetail) => void) => {
        if (controller) return; // 이미 연결 중이면 무시

        controller = new AbortController();

        fetchEventSource(`${BASE_URL}/api/notifications/subscribe`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: controller.signal,
            onmessage(event) {
                if (event.event === 'connect') return;
                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                } catch { /* empty */ }
            },
            onerror(err) {
                console.error('SSE 연결 오류:', err);
            },
        });
    },

    disconnect: () => {
        if (controller) {
            controller.abort();
            controller = null;
        }
    },

    isConnected: () => controller !== null,
};