"use client";

import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { sessionActions, useSession } from "@/lib/session";

interface DemoButtonProps {
  label?: string;
  signedInLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  icon?: boolean;
}

export function DemoButton({
  label = "Explore live demo",
  signedInLabel = "Open demo workspace",
  variant = "secondary",
  size = "lg",
  className,
  icon = true,
}: DemoButtonProps) {
  const { profile } = useSession();
  const router = useRouter();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      iconLeft={icon ? <Icon name="play" size={15} /> : undefined}
      onClick={() => {
        if (!profile) sessionActions.signInDemo();
        router.push("/dashboard");
      }}
    >
      {profile ? signedInLabel : label}
    </Button>
  );
}
