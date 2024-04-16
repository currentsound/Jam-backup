import {onMount} from "svelte";

export const useWakeLock = () => {
    onMount(() => {
        if (!navigator.wakeLock) return;
        let wakeLock: WakeLockSentinel | null = null;
        const acquireWakeLock = () => navigator.wakeLock.request('screen').then(wl => wakeLock = wl).catch(err => console.warn('acquiring wake lock failed', err));
        acquireWakeLock().then();
        let onVisibilityChange = () => {
            if (document.visibilityState === 'visible') acquireWakeLock().then();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return async () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            await wakeLock?.release();
            wakeLock = null;
        }
    });
}
