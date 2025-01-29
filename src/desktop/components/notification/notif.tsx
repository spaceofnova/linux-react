import { LucideX } from "lucide-react";
import { useNotificationStore } from "src/shared/hooks/notifications";
import { NotificationType } from "src/shared/types/storeTypes";
import { useCallback, memo } from "react";
import { MotionView } from "src/shared/components/ui/View";

const variants = {
  initial: { x: 500, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 500, opacity: 0 },
};

interface NotifProps {
  id: string;
  notification: NotificationType;
}

const RealNotif = ({ id, notification }: NotifProps) => {
  const { removeNotification } = useNotificationStore();

  const handleClose = useCallback(() => {
    removeNotification(id);
  }, [removeNotification, id]);

  return (
    <MotionView
      className="p-2 border-white border rounded flex flex-col gap-2"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div>{notification.message}</div>
          <div>{notification.description}</div>
        </div>
        <LucideX onClick={handleClose} className="cursor-pointer" />
      </div>
    </MotionView>
  );
};

export const Notif = memo(RealNotif);
