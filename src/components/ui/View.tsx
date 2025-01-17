import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { usePrefrencesStore } from "@/stores/prefrencesStore";
import { motion } from "motion/react";

interface ViewProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: boolean;
}

const View = forwardRef<HTMLDivElement, ViewProps>(
  ({ className, rounded = true, ...props }, ref) => {
    const prefrences = usePrefrencesStore((state) => state.prefrences);
    return (
      <div
        ref={ref}
        className={cn(className)}
        {...props}
        style={{
          backgroundColor: prefrences.appearance.blurEffects
            ? "hsla(var(--background) / 0.7)"
            : "hsl(var(--background))",
          backdropFilter: prefrences.appearance.blurEffects
            ? "blur(24px)"
            : "none",
          borderRadius: rounded ? "calc(var(--radius) + 0.2rem)" : "0",
        }}
      />
    );
  }
);

View.displayName = "View";

const MotionView = motion.create(View);

export { View, MotionView };
export type { ViewProps };
