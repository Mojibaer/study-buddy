"use client"

import * as React from "react"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    indeterminate?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, indeterminate = false, checked, ...props }, ref) => {
        const internalRef = React.useRef<HTMLInputElement | null>(null)

        React.useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
            ref,
            () => internalRef.current,
        )

        React.useEffect(() => {
            if (internalRef.current) {
                internalRef.current.indeterminate = indeterminate
            }
        }, [indeterminate])

        return (
            <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
                <input
                    ref={internalRef}
                    type="checkbox"
                    checked={checked}
                    className={cn(
                        "peer size-4 cursor-pointer appearance-none rounded-[4px] border border-input bg-background shadow-xs transition-colors",
                        "checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        className,
                    )}
                    {...props}
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-primary-foreground opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0">
                    <Check className="size-3" strokeWidth={3} />
                </span>
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-primary-foreground opacity-0 peer-indeterminate:opacity-100">
                    <Minus className="size-3" strokeWidth={3} />
                </span>
            </span>
        )
    },
)
Checkbox.displayName = "Checkbox"

export { Checkbox }