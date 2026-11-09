
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { sessionActions, useSession } from "@/features/auth/store";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSignedIn = mounted && !!profile;

  async function handleDemoClick() {
    try {
      if (!profile) {
        await sessionActions.signInDemo();
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Demo sign-in failed:", error);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      iconLeft={icon ? <Icon name="play" size={15} /> : undefined}
      onClick={handleDemoClick}
    >
      {isSignedIn ? signedInLabel : label}
    </Button>
  );
}
