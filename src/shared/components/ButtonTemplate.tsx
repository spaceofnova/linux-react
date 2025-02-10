import { LucideX, LucideMaximize2, LucideMinimize2 } from "lucide-react";
import { WindowType } from "shared/types/storeTypes";
import { cn } from "shared/utils/cn";

export const UIButtonTemplate = ({ window }: { window: WindowType }) => {
  const handleClose = () => {
    window.close();
  };

  const handleMaximize = () => {
      if (window.isMaximized) {
          window.restore()
      } else {
          window.maximize();
      }
  };

  const styles = {
    default: "px-4 py-2 hover:bg-gray-400/20 flex items-center gap-2 transition-colors duration-200",
    destructive: "hover:bg-red-500/70",
  };

  return (
    <div className="flex">
      <div onClick={handleMaximize} className={cn(styles.default)}>
        {window.isMaximized ? <LucideMinimize2 size={16} /> : <LucideMaximize2 size={16} />}
      </div>
      <div
        onClick={handleClose}


        className={cn(styles.default, styles.destructive)}
      >
        <LucideX size={16} />
      </div>
    </div>

  );
};
