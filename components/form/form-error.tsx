"use client";

import { useEffect, useState } from "react";
// if choose NEW YORK style in install Shadcn, then it include react-icons
// if not, then you could choose lucide-icons or install react-icons manually: npm install @radix-ui/react-icons
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface FormErrorProps {
  message?: string;
  timeout?: number;
}

export function FormError({ message, timeout = 3000 }: FormErrorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // if message is not null, then set the visible flag to true;
    if (message) {
      setVisible(true);

      // set a timeout, after it end, set visible back to unvisible;
      const timer = setTimeout(() => {
        setVisible(false);
      }, timeout);

      // when the component unmount, clear the timeout
      return () => clearTimeout(timer);
    }
  }, [message, timeout]);

  if (!message || !visible) return null;

  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
      <ExclamationTriangleIcon className="size-4" />
      <p>{message}</p>
    </div>
  );
}
