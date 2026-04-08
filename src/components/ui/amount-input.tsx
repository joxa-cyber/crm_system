"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

function formatNumber(value: string): string {
  const clean = value.replace(/[^\d.]/g, "");
  const parts = clean.split(".");
  const intPart = parts[0] || "";
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  if (parts.length > 1) {
    return formatted + "." + parts[1];
  }
  return formatted;
}

function unformat(value: string): string {
  return value.replace(/\s/g, "");
}

interface AmountInputProps
  extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  name: string;
  defaultValue?: string | number;
}

function AmountInput({ name, defaultValue, ...props }: AmountInputProps) {
  const [display, setDisplay] = React.useState(() => {
    if (defaultValue != null && defaultValue !== "" && defaultValue !== "0") {
      return formatNumber(String(defaultValue));
    }
    return "";
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow only digits, spaces, and one dot
    const cleaned = raw.replace(/[^\d.\s]/g, "");
    const unformatted = unformat(cleaned);
    setDisplay(formatNumber(unformatted));
  }

  return (
    <>
      <input type="hidden" name={name} value={unformat(display)} />
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        placeholder={props.placeholder || "0"}
      />
    </>
  );
}

export { AmountInput };
