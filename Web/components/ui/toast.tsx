"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";
import * as RadixToast from "@radix-ui/react-toast";
import { AnimatePresence, motion } from "framer-motion";
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

      <AnimatePresence mode="popLayout">
        {messages.map((toast) => (
          <Toast
            key={toast.id}
            text={toast.text}
            onClose={() =>
              setMessages((toasts) => toasts.filter((t) => t.id !== toast.id))
            }
          />
        ))}
      </AnimatePresence>

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
  let width = 320;
  let margin = 16;

  return (
    <RadixToast.Root
      ref={forwardedRef}
      asChild
      forceMount
      onOpenChange={onClose}
      duration={2500}
    >
      <motion.li
        layout
        initial={{ x: width + margin }}
        animate={{ x: 0 }}
        exit={{
          opacity: 0,
          zIndex: -1,
          transition: {
            opacity: {
              duration: 0.2,
            },
          },
        }}
        transition={{
          type: "spring",
          mass: 1,
          damping: 30,
          stiffness: 200,
        }}
        style={{ width, WebkitTapHighlightColor: "transparent" }}
      >
        <div className="flex items-center justify-between overflow-hidden whitespace-nowrap rounded-lg border border-gray-600 bg-gray-700 text-sm text-white shadow-sm backdrop-blur">
          <RadixToast.Description className="truncate p-4">
            {text}
          </RadixToast.Description>
          <RadixToast.Close className="border-l border-gray-600/50 p-4 text-gray-500 transition hover:bg-gray-600/30 hover:text-gray-300 active:text-white">
            <XMarkIcon className="h-5 w-5" />
          </RadixToast.Close>
        </div>
      </motion.li>
    </RadixToast.Root>
  );
});
