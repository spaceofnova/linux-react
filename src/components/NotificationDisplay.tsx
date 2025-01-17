import { useNotificationStore } from "@/stores/notifications";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const Notifications = () => {
  const { notifications, removeNotification, clearNotifications } = useNotificationStore();
  const storedNotifications = notifications.filter((n) => n.store !== false);

  return (
    <>
      <Toaster expand visibleToasts={storedNotifications.length} />
      {storedNotifications.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-4 right-4 h-10 w-10"
            >
              <Bell className="h-5 w-5" />
              {storedNotifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {storedNotifications.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Notifications</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearNotifications()}
                >
                  Clear all
                </Button>
              </div>
              <div className="space-y-2">
                {storedNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{n.message}</p>
                      {n.description && (
                        <p className="text-sm text-muted-foreground">
                          {n.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeNotification(n.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};