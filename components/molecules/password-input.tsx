"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Icon } from "@/components/atoms/icon";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

export function PasswordInput({ className, invalid, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...rest}
        invalid={invalid}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[5px] text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
      >
        <Icon name={visible ? "eyeOff" : "eye"} size={15} />
      </button>
    </div>
  );
}
