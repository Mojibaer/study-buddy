"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

function SheetOverlay({
                          className,
                          ...props
                      }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot="sheet-overlay"
            className={cn(
                "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                className
            )}
            {...props}
        />
    )
}

const sheetVariants = cva(
    "fixed z-50 gap-4 bg-background shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300",
    {
        variants: {
            side: {
                top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
                bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
                left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
                right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
            },
        },
        defaultVariants: {
            side: "right",
        },
    }
)

interface SheetContentProps
    extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
        VariantProps<typeof sheetVariants> {
    showCloseButton?: boolean
}

function SheetContent({
                          className,
                          side = "right",
                          showCloseButton = true,
                          children,
                          ...props
                      }: SheetContentProps) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <DialogPrimitive.Content
                data-slot="sheet-content"
                className={cn(sheetVariants({ side }), className)}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
                        <XIcon className="size-4" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </SheetPortal>
    )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            data-slot="sheet-header"
            className={cn("flex flex-col gap-1.5 p-4", className)}
            {...props}
        />
    )
}

// Title row with an optional leading icon and a large, well-aligned close button,
// separated from the body by a border. Use with `SheetContent showCloseButton={false}`.
function SheetHeaderBar({
                            icon,
                            title,
                            closeLabel,
                        }: {
    icon?: React.ReactNode
    title: React.ReactNode
    closeLabel?: string
}) {
    return (
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-base">
                {icon}
                {title}
            </SheetTitle>
            <SheetClose className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <XIcon className="size-5" />
                <span className="sr-only">{closeLabel ?? "Close"}</span>
            </SheetClose>
        </div>
    )
}

function SheetTitle({
                        className,
                        ...props
                    }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="sheet-title"
            className={cn("text-foreground font-semibold", className)}
            {...props}
        />
    )
}

function SheetDescription({
                              className,
                              ...props
                          }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            data-slot="sheet-description"
            className={cn("text-muted-foreground text-sm", className)}
            {...props}
        />
    )
}

export {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetHeaderBar,
    SheetOverlay,
    SheetPortal,
    SheetTitle,
    SheetTrigger,
}