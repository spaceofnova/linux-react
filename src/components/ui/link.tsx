import { useAppStore } from "@/stores/appstore";
import { Button, ButtonProps } from "./button";

export const Link = ({
  href,
  children,
  buttonProps,
}: {
  href: string;
  children: React.ReactNode;
  buttonProps?: ButtonProps;
}) => {
  return (
    <Button
      onClick={() => useAppStore.getState().launchDeepLink(href)}
      {...buttonProps}
    >
      {children}
    </Button>
  );
};
