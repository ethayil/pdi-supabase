'use client'

import { useTransition } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { createColumns } from './product-columns'
import ProductsTableToolbar from './products-table-toolbar'
import type { Category } from '@/app/generated/prisma/client'
import type { ProductWithCategory } from './product-columns'

interface ProductsTableWrapperProps {
  organizationId: string
  initialData: {
    success: boolean
    data: ProductWithCategory[]
    totalPages: number
    totalCount: number
    lowStockThreshold: number
  }
  categories: Category[]
}

export const ProductsTableWrapper = ({
  organizationId,
  initialData,
  categories,
}: ProductsTableWrapperProps) => {
  const [isPending, startTransition] = useTransition()

  const products = initialData?.data ?? []
  const lowStockThreshold = initialData?.lowStockThreshold ?? 50
  const totalPages = initialData?.totalPages ?? 1
  const totalCount = initialData?.totalCount ?? 0

  const columns = createColumns(lowStockThreshold)

  return (
    <DataTable
      columns={columns}
      data={products}
      loading={isPending}
      headerComponent={
        <ProductsTableToolbar
          organizationId={organizationId}
          loading={isPending}
          categories={categories}
          startTransition={startTransition}
        />
      }
      paginationComponent={
        <DataTablePagination
          totalPages={totalPages}
          totalCount={totalCount}
          startTransition={startTransition}
        />
      }
    />
  )
}
