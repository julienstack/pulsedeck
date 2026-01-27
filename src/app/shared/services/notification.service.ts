import { Injectable, signal, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private swPush = inject(SwPush);

    // Signals for UI state
    public permissionStatus = signal<NotificationPermission>('default');
    public isSupported = signal<boolean>(false);
    public isSubscribed = signal<boolean>(false);

    // VAPID Public Key (TODO: Generate this key on server and put in env)
    // For now we just implement the permission flow without actual subscription to server
    private readonly VAPID_PUBLIC_KEY = 'BNE...';

    constructor() {
        this.checkSupport();
        this.checkPermission();

        // Listen to subscription changes
        this.swPush.subscription.subscribe(sub => {
            this.isSubscribed.set(!!sub);
        });
    }

    private checkSupport() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            this.isSupported.set(true);
        }
    }

    private checkPermission() {
        if (!this.isSupported()) return;
        this.permissionStatus.set(Notification.permission);
    }

    /**
     * Request permission from the user
     * Designed to be called from a user gesture (button click)
     */
    async requestPermission(): Promise<boolean> {
        if (!this.isSupported()) return false;

        try {
            const permission = await Notification.requestPermission();
            this.permissionStatus.set(permission);

            if (permission === 'granted') {
                // Here we would normally subscribe to pushManager
                // await this.subscribeToPush();
                return true;
            }
        } catch (err) {
            console.error('Could not ask for notification permission', err);
        }
        return false;
    }

    /**
     * Subscribe to push notifications
     * (Placeholder for later implementation with backend)
     */
    async subscribeToPush() {
        // try {
        //   const sub = await this.swPush.requestSubscription({
        //     serverPublicKey: this.VAPID_PUBLIC_KEY
        //   });
        //   // TODO: Send sub to Supabase
        //   console.log('Push Subscription:', sub);
        // } catch (err) {
        //   console.error('Could not subscribe to push', err);
        // }
    }
}
