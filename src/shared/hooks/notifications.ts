import {
  NotificationStoreType,
  NotificationType,
} from "shared/types/storeTypes";
import { create } from "zustand";
import { nanoid } from "nanoid";

type NotificationInput = Omit<NotificationType, "id">;

export const useNotificationStore = create<NotificationStoreType>()(
  (set, get) => ({
    notifications: [],
    notify: (notification: NotificationInput) => {
      const id = nanoid();
      const startTime = Date.now();

      // Store notification if it should be kept
      if (notification.store !== false) {
        const newNotification = {
          ...notification,
          id,
          startTime,
          remainingDuration: notification.duration ?? 0,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Set up interval to update remaining duration
        if (notification.duration && notification.duration > 0) {
          const interval = setInterval(() => {
            const currentState = get();
            const notif = currentState.notifications.find((n) => n.id === id);

            if (notif) {
              const elapsed = Date.now() - startTime;
              const remaining = Math.max(0, notification.duration! - elapsed);
              const roundedRemaining = remaining < 10 ? 0 : Math.floor(remaining / 10) * 10;

              // Update remaining duration
              const notificationToUpdate = currentState.notifications.find((n) => n.id === id);
              if (notificationToUpdate && notificationToUpdate.remainingDuration !== roundedRemaining) {
                set((state) => ({
                  notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, remainingDuration: roundedRemaining } : n
                  ),
                }));
              }

              // Clear interval when duration reaches 0
              if (remaining <= 0) {
                clearInterval(interval);
              }
            } else {
              clearInterval(interval);
            }
          }, 100); // Update every 100ms for smooth countdown
        }
      }
    },
    removeNotification: (id: string) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
    clearNotifications: () => set({ notifications: [] }),
    updateNotification: (id: string, updates: Partial<NotificationType>) =>
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, ...updates } : n
        ),
      })),
  })
);
