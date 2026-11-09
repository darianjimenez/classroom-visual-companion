import type * as React from "react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

// A side sheet on larger screens, a bottom drawer you can swipe away on phones.
export function Panel({
  open, onClose, title, description, wide, children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  wide?: boolean
  children: React.ReactNode
}) {
  const desktop = useMediaQuery("(min-width: 768px)")
  const onOpenChange = (o: boolean) => { if (!o) onClose() }
  if (desktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className={cn("w-full gap-0 p-0 data-[side=right]:sm:max-w-md", wide && "data-[side=right]:sm:max-w-2xl")}>
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90svh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto px-4 pb-8">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
