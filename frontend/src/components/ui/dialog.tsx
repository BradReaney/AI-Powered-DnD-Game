import * as React from "react"
import { cn } from "@/lib/utils"

export interface DialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}

export interface DialogContentProps
    extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export interface DialogHeaderProps
    extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export interface DialogTitleProps
    extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode
}

export interface DialogDescriptionProps
    extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange?.(false)}
            />
            <div className="relative z-50">
                {children}
            </div>
        </div>
    )
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative w-full max-w-lg rounded-lg bg-background p-6 shadow-lg",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <h2
                ref={ref}
                className={cn("text-lg font-semibold leading-none tracking-tight", className)}
                {...props}
            >
                {children}
            </h2>
        )
    }
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn("text-sm text-muted-foreground", className)}
                {...props}
            >
                {children}
            </p>
        )
    }
)
DialogDescription.displayName = "DialogDescription"

const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)}
                {...props}
            >
                {children}
            </button>
        )
    }
)
DialogTrigger.displayName = "DialogTrigger"

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger }
