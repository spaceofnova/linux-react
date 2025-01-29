import { useNotificationStore } from "src/shared/hooks/notifications";
import { Notif } from "./notif";
import { NotificationType } from "src/shared/types/storeTypes";
import { AnimatePresence } from "motion/react";
import { useMemo, memo } from "react";

const CONTAINER_CLASS = "fixed top-2 right-2 flex flex-col gap-2";

const isActiveNotification = (notif: NotificationType) =>
  notif.duration && notif.remainingDuration && notif.remainingDuration > 0;

// Notif display
const RealNotifications = () => {
  const { notifications } = useNotificationStore();

  const activeNotifications = useMemo(
    () => notifications.filter(isActiveNotification),
    [notifications]
  );

  return (
    <div className={CONTAINER_CLASS}>
      <AnimatePresence initial={false}>
        {activeNotifications.map((notif: NotificationType) => (
          <Notif key={notif.id} id={notif.id} notification={notif} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const Notifications = memo(RealNotifications);
