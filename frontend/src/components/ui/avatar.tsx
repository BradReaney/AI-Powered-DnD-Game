import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps
    extends React.HTMLAttributes<HTMLDivElement> {
    src?: string
    alt?: string
    fallback?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt, fallback, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
                    className
                )}
                {...props}
            >
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        className="aspect-square h-full w-full"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                        <span className="text-sm font-medium text-muted-foreground">
                            {fallback || "U"}
                        </span>
                    </div>
                )}
            </div>
        )
    }
)
Avatar.displayName = "Avatar"

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex h-full w-full items-center justify-center rounded-full bg-muted",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarFallback }
