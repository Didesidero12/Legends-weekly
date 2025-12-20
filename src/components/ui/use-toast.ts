"use client"

import * as React from "react"
import { ToastActionElement, ToastProps } from "@/components/ui/toast"

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const toast = (...args: any[]) => {
  // This is a placeholder — the real implementation is in the Toaster
  // but we just need the function to exist for type safety
}

const useToast = () => {
  // This hook is usually provided by the Toaster context, but for SSR safety
  // we return a safe default
  return {
    toast,
    dismiss: (toastId?: string) => {},
    toasts: [] as ToasterToast[],
  }
}

export { useToast }