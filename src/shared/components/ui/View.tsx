import { forwardRef, HTMLAttributes } from "react";
import { cn } from "shared/utils/cn";
import * as m from "motion/react-m";
import { useRegistryStore } from "shared/hooks/registry.ts";

interface ViewProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: boolean;
}

const View = forwardRef<HTMLDivElement, ViewProps>(
  ({ className, rounded = true, style, ...props }, ref) => {
    const blurEffects = useRegistryStore.getState().getKey("/system/blur");
    return (
      <div
        ref={ref}
        className={cn(className)}
        {...props}
        style={{
          ...style,
          backgroundColor: blurEffects
            ? "hsla(var(--background) / 0.7)"
            : "hsl(var(--background))",
          backdropFilter: blurEffects ? "blur(24px)" : "none",
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
