'use client';

import { ToastProvider } from "@zyther/react-toastify";
import "@zyther/react-toastify/styles";
import { getStoredTheme } from "../lib/utils/thm";

interface ClientToastProps {
  children: React.ReactNode;
}

export function ClientToast({ children }: ClientToastProps) {
  return (
    <ToastProvider
      defaultPosition="bottom-right"
      defaultDuration={4000}
      maxToasts={5}
      theme={getStoredTheme as unknown as ("dark" | "light" ) ?? "light"}
    >
      {children}
    </ToastProvider>
  );
}