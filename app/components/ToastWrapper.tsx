'use client';

import { ToastProvider } from "@zyther/react-toastify";
import "@zyther/react-toastify/styles";

interface ClientToastProps {
  children: React.ReactNode;
}

export function ClientToast({ children }: ClientToastProps) {
  return (
    <ToastProvider
      defaultPosition="bottom-right"
      defaultDuration={4000}
      maxToasts={5}
      theme="system"
    >
      {children}
    </ToastProvider>
  );
}