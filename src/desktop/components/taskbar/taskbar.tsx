import { View } from "shared/components/ui/View";
import { useAppStore } from "shared/hooks/appstore";
import { cn } from "shared/utils/cn";
import { AppIcon } from "shared/components/AppIcon";
import { useWindowStore } from "src/shared/hooks/windowStore";
import { useRegistryStore } from "shared/hooks/registry.ts";
import { useState } from "react";
import { LucideLayoutGrid, LucidePin, LucidePinOff } from "lucide-react";

// type ContextMenuState = {
//   x: number;
//   y: number;
//   isOpen: boolean;
//   type: "app" | "general";
//   appId?: string;
// };

// const ContextMenu = ({
//   x,
//   y,
//   type,
//   appId,
//   onClose,
// }: {
//   x: number;
//   y: number;
//   type: "app" | "general";
//   appId?: string;
//   onClose: () => void;
// }) => {
//   const menuRef = useRef<HTMLDivElement>(null);

//   const handleAction = (action: string) => {
//     const appStore = useAppStore.getState();
//     switch (action) {
//       case "close":
//         if (appId) useWindowStore.getState().closeWindow(appId);
//         break;
//       case "cascade":
//         // Implement window cascade
//         break;
//       case "stack":
//         // Implement window stacking
//         break;
//       case "settings":
//         appStore.launchApp("settings");
//         break;
//     }
//     onClose();
//   };

//   return (
//     <View
//       ref={menuRef}
//       className="absolute bg-gray-800 text-white shadow-lg py-1 min-w-[200px] z-50"
//       style={{
//         left: `${x}px`,
//         bottom: `${y}px`,
//       }}
//     >
//       {type === "app" ? (
//         <>
//           <div
//             className="px-4 py-2 hover:bg-blue-600 cursor-pointer"
//             onClick={() => handleAction("close")}
//           >
//             Close window
//           </div>
//           <div
//             className="px-4 py-2 hover:bg-blue-600 cursor-pointer"
//             onClick={() => handleAction("pin")}
//           >
//             Pin to taskbar
//           </div>
//           <div className="h-px bg-gray-600 my-1" />
//         </>
//       ) : null}
//       <div
//         className="px-4 py-2 hover:bg-blue-600 cursor-pointer"
//         onClick={() => handleAction("cascade")}
//       >
//         Cascade windows
//       </div>
//       <div
//         className="px-4 py-2 hover:bg-blue-600 cursor-pointer"
//         onClick={() => handleAction("stack")}
//       >
//         Show windows stacked
//       </div>
//       <div
//         className="px-4 py-2 hover:bg-blue-600 cursor-pointer"
//         onClick={() => handleAction("side")}
//       >
//         Show windows side by side
//       </div>
//       <div className="h-px bg-gray-600 my-1" />
//       <div
//         className="px-4 py-2 hover:bg-blue-600 cursor-pointer"
//         onClick={() => handleAction("desktop")}
//       >
//         Show the desktop
//       </div>
//       <div
//         className="px-4 py-2 hover:bg-blue-600 cursor-pointer"
//         onClick={() => handleAction("settings")}
//       >
//         Taskbar settings
//       </div>
//     </View>
//   );
// };

const StartMenu = ({
  open,
  pinnedApps,
}: {
  open: boolean;
  pinnedApps: string[];
}) => {
  const apps = useAppStore.getState().getApps();
  const { setKey, getKey } = useRegistryStore();

  const handlePinUnpin = (appId: string) => {
    const pinnedApps = getKey("/user/taskbar/pinnedApps") || [];
    if (pinnedApps.includes(appId)) {
      setKey(
        "/user/taskbar/pinnedApps",
        pinnedApps.filter((id: string) => id !== appId)
      );
    } else {
      setKey("/user/taskbar/pinnedApps", [...pinnedApps, appId]);
    }
  };
  return (
    open && (
      <View
        className="flex flex-col absolute bottom-12 left-0 w-48"
        rounded={false}
      >
        {apps.map((app) => {
          const isPinned = pinnedApps.includes(app.id);
          return (
            <div key={app.id} className="flex">
              <div
                key={app.id}
                className="p-2 px-3 hover:bg-white/10 cursor-pointer h-14 aspect-square flex items-center w-full"
                onClick={() => useAppStore.getState().launchApp(app.id)}
              >
                <AppIcon appId={app.id} className="h-8 w-8" />
                <span className="text-sm ml-2">{app.name}</span>
              </div>
              <div
                className="z-10 hover:bg-white/10 h-14 w-14 flex items-center justify-center"
                onClick={() => handlePinUnpin(app.id)}
              >
                {isPinned ? (
                  <LucidePinOff className="h-6 w-6 text-gray-500" />
                ) : (
                  <LucidePin className="h-6 w-6 text-gray-500" />
                )}
              </div>
            </div>
          );
        })}
      </View>
    )
  );
};

const Taskbar = () => {
  const apps = useAppStore.getState().getApps();
  const activeWindowId = useWindowStore((state) => state.activeWindowId);

  const [startMenuOpen, setStartMenuOpen] = useState(false);

  const { getKey, setKey } = useRegistryStore();
  const smallIcons = getKey("/user/taskbar/smallIcons");
  const pinnedApps = getKey("/user/taskbar/pinnedApps") || [
    "com.system.settings",
    "com.system.welcome",
    "com.system.store",
    "com.system.terminal",
  ];

  // const mainContainerRef = useRef<HTMLDivElement>(null);
  // const appIconContainerRef = useRef<HTMLDivElement[]>([]);

  // const [contextMenu, setContextMenu] = useState<ContextMenuState>({
  //   x: 0,
  //   y: 48, // Height of taskbar
  //   isOpen: false,
  //   type: "general",
  //   appId: "",
  // });

  // useEffect(() => {
  //   const handleContextMenu = (
  //     e: MouseEvent,
  //     type: "general" | "app",
  //     appId?: string
  //   ) => {
  //     e.preventDefault();
  //     const x = Math.min(Math.max(0, e.clientX - 100), window.innerWidth - 200);
  //     setContextMenu({
  //       x,
  //       y: 48,
  //       isOpen: true,
  //       type,
  //       appId,
  //     });
  //   };

  //   const mainContainer = mainContainerRef.current;
  //   if (mainContainer) {
  //     mainContainer.addEventListener("contextmenu", (e) =>
  //       handleContextMenu(e, "general")
  //     );
  //   }

  //   appIconContainerRef.current.forEach((icon, idx) => {
  //     if (icon) {
  //       icon.addEventListener("contextmenu", (e) =>
  //         handleContextMenu(e, "app", apps[idx].id)
  //       );
  //     }
  //   });

  //   const handleClickOutside = (e: MouseEvent) => {
  //     if (contextMenu.isOpen) {
  //       setContextMenu((prev) => ({ ...prev, isOpen: false }));
  //     }
  //   };

  //   window.addEventListener("click", handleClickOutside);

  //   return () => {
  //     if (mainContainer) {
  //       mainContainer.removeEventListener("contextmenu", (e) =>
  //         handleContextMenu(e, "general")
  //       );
  //     }
  //     appIconContainerRef.current.forEach((icon) => {
  //       if (icon) {
  //         icon.removeEventListener("contextmenu", (e) =>
  //           handleContextMenu(e, "app", "")
  //         );
  //       }
  //     });
  //     window.removeEventListener("click", handleClickOutside);
  //   };
  // }, [apps]);

  const handleClick = (appId: string) => {
    useAppStore.getState().launchApp(appId);
  };

  return (
    <View
      className="fixed bottom-0 left-0 w-full flex h-12 items-center z-[10000] bg-gray-900"
      rounded={false}
    >
      {/* {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          appId={contextMenu.appId}
          onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        />
      )} */}
      <div
        className="p-2 px-3 hover:bg-white/10 cursor-pointer h-full aspect-square"
        onClick={() => setStartMenuOpen(!startMenuOpen)}
      >
        <LucideLayoutGrid className="h-full w-full" />
      </div>
      {apps
        .filter((app) => pinnedApps.includes(app.id))
        .map((app) => {
          const isActive = activeWindowId === app.id;

          return (
            <div
              // ref={(el) => {
              //   if (el) appIconContainerRef.current[idx] = el;
              // }}
              key={app.id}
              onClick={() => handleClick(app.id)}
              className={cn(
                "p-2 px-3 hover:bg-white/10 cursor-pointer",
                isActive && "bg-white/20"
              )}
            >
              <AppIcon
                appId={app.id}
                className={smallIcons ? "h-7 w-7" : "h-8 w-8"}
              />
            </div>
          );
        })}
      <span className="w-full h-full" />
      <StartMenu open={startMenuOpen} pinnedApps={pinnedApps} />
    </View>
  );
};

export default Taskbar;
