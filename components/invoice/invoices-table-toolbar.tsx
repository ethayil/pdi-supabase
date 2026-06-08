'use client'

import { SlidersHorizontalIcon } from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useRegisterAction } from '@/hooks/use-command-actions'
import { useInvoiceParams } from '@/lib/nuqs/invoice-params'

export default function InvoicesTableToolbar({
  loading,
  startTransition,
}: {
  loading: boolean
  startTransition?: React.TransitionStartFunction
}) {
  const [{ status }, setParams] = useInvoiceParams({ startTransition })

  const [isStatusOpen, setIsStatusOpen] = useState(false)

  useRegisterAction({
    id: 'invoices-status',
    label: 'Filter by Status',
    shortcut: 'a',
    handler: () => setIsStatusOpen(true),
    icon: SlidersHorizontalIcon,
    category: 'Invoices',
  })

  const statusWithAll = [
    { value: 'all', label: 'All ' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  if (loading) {
    return <Skeleton className="h-8 w-36 rounded-md" />
  }

  return (
    <Select
      items={statusWithAll}
      open={isStatusOpen}
      onOpenChange={setIsStatusOpen}
      value={status}
      onValueChange={(value) => setParams({ status: value })}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="All Statuses" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectLabel>Invoice Status</SelectLabel>
          <SelectSeparator />

          {statusWithAll.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
