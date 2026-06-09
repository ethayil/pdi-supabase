'use client'

import { useTransition } from 'react'
import type { DateRange } from 'react-day-picker'
import type { Invoice } from '@/app/generated/prisma/client'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range'
import { useInvoiceParams } from '@/lib/nuqs/invoice-params'
import { columns } from './invoice-columns'
import InvoicesTableToolbar from './invoices-table-toolbar'

type InvoiceWithOrderCount = Invoice & { orderCount: number }

interface InvoicesTableWrapperProps {
  organizationId: string
  initialData: {
    data: InvoiceWithOrderCount[]
    totalPages: number
    totalCount: number
  }
}

export const InvoicesTableWrapper = ({
  organizationId,
  initialData,
}: InvoicesTableWrapperProps) => {
  const [isPending, startTransition] = useTransition()
  const [{ start, end }, setParams] = useInvoiceParams({ startTransition })

  const invoices = initialData?.data ?? []
  const totalPages = initialData?.totalPages ?? 1
  const totalCount = initialData?.totalCount ?? 0

  return (
    <DataTable
      columns={columns}
      data={invoices}
      loading={isPending}
      headerComponent={
        <InvoicesTableToolbar 
          loading={isPending} 
          startTransition={startTransition}
        />
      }
      paginationComponent={
        <DataTablePagination
          totalPages={totalPages}
          totalCount={totalCount}
          startTransition={startTransition}
        >
          <DatePickerWithRange
            date={{
              from: start ? new Date(parseInt(start, 10)) : undefined,
              to: end ? new Date(parseInt(end, 10)) : undefined,
            }}
            setDate={(range: DateRange | undefined) => {
              setParams({
                start: range?.from ? range.from.getTime().toString() : null,
                end: range?.to ? range.to.getTime().toString() : null,
              })
            }}
          />
        </DataTablePagination>
      }
    />
  )
}

