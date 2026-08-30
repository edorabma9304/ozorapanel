/** Pembungkus tipis Radix: dialog, dropdown, tooltip, popover, tab, akordeon. */
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { ChevronDown, X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ------------------------------------------------------------------- Pemisah
export function Pemisah({
  className,
  orientation = 'horizontal',
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}

// -------------------------------------------------------------------- Dialog
export const Dialog = DialogPrimitive.Root
export const PemicuDialog = DialogPrimitive.Trigger
export const TutupDialog = DialogPrimitive.Close

const lebarDialog = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const

export function IsiDialog({
  className,
  children,
  judul,
  deskripsi,
  lebar = 'md',
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  judul: string
  deskripsi?: string
  lebar?: keyof typeof lebarDialog
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-card border border-border bg-card p-6 shadow-raised duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          lebarDialog[lebar],
          className,
        )}
        {...props}
      >
        <div className="space-y-1 pr-8">
          <DialogPrimitive.Title className="text-lg font-bold">{judul}</DialogPrimitive.Title>
          {deskripsi ? (
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {deskripsi}
            </DialogPrimitive.Description>
          ) : (
            <DialogPrimitive.Description className="sr-only">{judul}</DialogPrimitive.Description>
          )}
        </div>
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Tutup"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function KakiDialog({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex justify-end gap-2 pt-2', className)} {...props} />
}

// ------------------------------------------------------------ Panel geser
export function PanelGeser({
  className,
  children,
  judul,
  deskripsi,
  sisi = 'kanan',
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  judul: string
  deskripsi?: string
  sisi?: 'kanan' | 'kiri'
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex w-full max-w-md flex-col gap-4 border-border bg-card p-6 shadow-raised transition ease-out-soft data-[state=open]:animate-in data-[state=closed]:animate-out',
          sisi === 'kanan'
            ? 'right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
            : 'left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          className,
        )}
        {...props}
      >
        <div className="space-y-1 pr-8">
          <DialogPrimitive.Title className="text-lg font-bold">{judul}</DialogPrimitive.Title>
          <DialogPrimitive.Description className={cn('text-sm text-muted-foreground', !deskripsi && 'sr-only')}>
            {deskripsi ?? judul}
          </DialogPrimitive.Description>
        </div>
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Tutup"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

// ------------------------------------------------------------------ Dropdown
export const Dropdown = DropdownPrimitive.Root
export const PemicuDropdown = DropdownPrimitive.Trigger

export function IsiDropdown({
  className,
  align = 'end',
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-48 overflow-hidden rounded-card border border-border bg-popover p-1.5 text-popover-foreground shadow-raised data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  )
}

export function ItemDropdown({
  className,
  bahaya,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Item> & { bahaya?: boolean }) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
        bahaya
          ? 'text-danger-kuat data-[highlighted]:bg-danger-soft'
          : 'data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function LabelDropdown({ className, ...props }: ComponentProps<typeof DropdownPrimitive.Label>) {
  return (
    <DropdownPrimitive.Label
      className={cn('px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground', className)}
      {...props}
    />
  )
}

export function PemisahDropdown({ className, ...props }: ComponentProps<typeof DropdownPrimitive.Separator>) {
  return <DropdownPrimitive.Separator className={cn('-mx-1.5 my-1.5 h-px bg-border', className)} {...props} />
}

// ------------------------------------------------------------------- Tooltip
export const PenyediaTooltip = TooltipPrimitive.Provider

export function Tooltip({ isi, children, sisi = 'top' }: { isi: ReactNode; children: ReactNode; sisi?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={sisi}
          sideOffset={6}
          className="z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-raised data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95"
        >
          {isi}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

// ------------------------------------------------------------------- Popover
export const Popover = PopoverPrimitive.Root
export const PemicuPopover = PopoverPrimitive.Trigger

export function IsiPopover({ className, align = 'start', sideOffset = 6, ...props }: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-card border border-border bg-popover p-4 text-popover-foreground shadow-raised data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

// ---------------------------------------------------------------------- Tab
export const Tab = TabsPrimitive.Root

export function DaftarTab({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex items-center gap-1 border-b border-border', className)}
      {...props}
    />
  )
}

export function PemicuTab({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        '-mb-px inline-flex items-center gap-2 border-b-2 border-transparent px-3.5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary-kuat [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  )
}

export function IsiTab({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('pt-5 outline-none', className)} {...props} />
}

// ------------------------------------------------------------------ Akordeon
export const Akordeon = AccordionPrimitive.Root

export function ItemAkordeon({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn('border-b border-border', className)} {...props} />
}

export function PemicuAkordeon({ className, children, ...props }: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'flex flex-1 items-center justify-between gap-4 py-4 text-left text-sm font-semibold transition-colors hover:text-primary-kuat [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function IsiAkordeon({ className, children, ...props }: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden text-sm text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pb-4 pr-8 leading-relaxed', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}
