import { NotificationStoreType, NotificationType } from "@/types/storeTypes";
import { create } from "zustand";
import { toast } from "sonner";
import { nanoid } from 'nanoid';

type NotificationInput = Omit<NotificationType, 'id'>;

export const useNotificationStore = create<NotificationStoreType>()((set) => ({
  notifications: [],
  notify: (notification: NotificationInput) => {
    const id = nanoid();
    
    // Show toast notification
    if (notification.type && notification.type !== 'default') {
      toast[notification.type](notification.message, {
        id,
        description: notification.description,
        duration: notification.duration,
        action: notification.action,
      });
    } else {
      toast(notification.message, {
        id,
        description: notification.description,
        duration: notification.duration,
        action: notification.action,
      });
    }
    
    // Store notification if it should be kept
    if (notification.store !== false) {
      set((state) => ({ 
        notifications: [...state.notifications, { ...notification, id }] 
      }));
    }
  },
  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
