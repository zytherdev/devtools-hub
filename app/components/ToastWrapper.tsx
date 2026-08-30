/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { ToastProvider } from "@zyther/react-toastify";
import "@zyther/react-toastify/styles";
import { getStoredTheme } from "../lib/utils/thm";
import { useEffect, useState } from "react";

interface ClientToastProps {
  children: React.ReactNode;
}

export function ClientToast({ children }: ClientToastProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
  }, []);
  
  return (
    <ToastProvider
      defaultPosition="bottom-right"
      defaultDuration={4000}
      maxToasts={5}
      theme={theme}
    >
      {children}
    </ToastProvider>
  );
}