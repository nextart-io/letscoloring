"use client";

import * as RadixToast from "@radix-ui/react-toast";
import {
  ElementRef,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useState,
} from "react";

const ToastContext = createContext<{
  showToast: (text: string) => void;
}>({
  showToast: () => {
    throw new Error(
      "You can't call showToast() outside of a <ToastProvider> – add it to your tree."
    );
  },
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<{ id: string; text: string }[]>([]);

  function showToast(text: string) {
    setMessages((toasts) => [
      ...toasts,
      {
        id: window.crypto.randomUUID(),
        text,
      },
    ]);
  }

  return (
    <RadixToast.Provider>
      <ToastContext.Provider value={{ showToast }}>
        {children}
      </ToastContext.Provider>

      {messages.map((toast) => (
        <Toast
          key={toast.id}
          text={toast.text}
          onClose={() =>
            setMessages((toasts) => toasts.filter((t) => t.id !== toast.id))
          }
        />
      ))}

      <RadixToast.Viewport className="max-sm:top-20 fixed top-4 right-4 flex w-80 flex-col-reverse gap-3" />
    </RadixToast.Provider>
  );
}

const Toast = forwardRef<
  ElementRef<typeof RadixToast.Root>,
  {
    onClose: () => void;
    text: string;
  }
>(function Toast({ onClose, text }, forwardedRef) {
  return (
    <RadixToast.Root
      ref={forwardedRef}
      asChild
      forceMount
      onOpenChange={onClose}
      duration={2500}
    >
      <div className="flex items-center justify-between overflow-hidden whitespace-nowrap rounded-lg text-sm text-gray-500 shadow-sm backdrop-blur">
        <RadixToast.Description className="truncate p-4">
          {text}
        </RadixToast.Description>
        <RadixToast.Close className="border-l p-4 text-gray-500 transition hover:bg-gray-300/30 active:text-white">
          <span aria-hidden>×</span>
        </RadixToast.Close>
      </div>
    </RadixToast.Root>
  );
});
