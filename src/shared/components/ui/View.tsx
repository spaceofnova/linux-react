import { forwardRef, HTMLAttributes } from "react";
import { cn } from "shared/utils/cn";
import { usePrefrencesStore } from "shared/hooks/prefrencesStore";
import * as m from "motion/react-m"

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
          borderRadius: rounded ? "calc(var(--radius) * 1.1)" : "0",
        }}
      />
    );

  }
);

View.displayName = "View";

const MotionView = m.create(View);

export { View, MotionView };
export type { ViewProps };
