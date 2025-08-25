import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, onValueChange, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (onValueChange) {
                onValueChange(e.target.value)
            }
            if (onChange) {
                onChange(e)
            }
        }

        return (
            <select
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                onChange={handleChange}
                {...props}
            >
                {children}
            </select>
        )
    }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <select
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>
        )
    }
)
SelectTrigger.displayName = "SelectTrigger"

export interface SelectValueProps extends React.HTMLAttributes<HTMLDivElement> {
    placeholder?: string
}

const SelectValue = React.forwardRef<HTMLDivElement, SelectValueProps>(
    ({ className, children, placeholder, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("text-sm", className)}
                {...props}
            >
                {children || placeholder}
            </div>
        )
    }
)
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md", className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <option
                ref={ref}
                className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)}
                {...props}
            >
                {children}
            </option>
        )
    }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
