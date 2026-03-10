import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ToasterToast } from "./use-toast"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        success:
          "border-success bg-success text-success-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  toast: ToasterToast
  onDismiss: (id: string) => void
}

function Toast({ className, variant, toast: t, onDismiss, ...props }: ToastProps) {
  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      data-state="open"
      {...props}
    >
      <div className="grid gap-1">
        {t.title && (
          <div className="text-sm font-semibold">{t.title}</div>
        )}
        {t.description && (
          <div className="text-sm opacity-90">{t.description}</div>
        )}
      </div>
      <button
        onClick={() => onDismiss(t.id)}
        className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:opacity-100"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export { Toast, toastVariants }
