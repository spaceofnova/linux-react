import { useAppStore } from "@/stores/appstore";
import { Button, ButtonProps } from "./button";
import { Slot } from "@radix-ui/react-slot";

export const Link = ({
  href,
  children,
  buttonProps,
  asChild,
}: {
  href: string;
  children: React.ReactNode;
  buttonProps?: ButtonProps;
  asChild?: boolean;
}) => {
  const Comp = asChild ? Slot : Button;
  
  return (
    <Comp
      onClick={() => useAppStore.getState().launchDeepLink(href)}
      {...buttonProps}
    >
      {children}
    </Comp>
  );
};
