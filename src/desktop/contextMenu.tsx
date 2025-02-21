import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "shared/components/ui/context-menu";
import { useCallback, memo } from "react";
import { useAppStore } from "shared/hooks/appstore";

// Memoized ContextMenu component
export const DesktopContextMenu = memo(
  ({ children }: { children: React.ReactNode }) => {
    const launchSettings = useCallback((): void => {
      useAppStore.getState().launchDeepLink("settings:appearance");
    }, []);

    return (
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem className="cursor-pointer" onClick={launchSettings}>
            <p>Change Wallpaper</p>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }
);

DesktopContextMenu.displayName = "DesktopContextMenu";
