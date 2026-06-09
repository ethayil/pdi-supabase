'use client'

import { FilterIcon, FilterXIcon, SlidersHorizontalIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { useLogParams } from '@/lib/nuqs/log-params'

export default function LogsTableToolbar({
  loading,
  startTransition,
}: {
  loading: boolean
  startTransition: React.TransitionStartFunction
}) {
  const [{ user, message, entityType }, setParams] = useLogParams({
    startTransition,
  })

  const [isTypeOpen, setIsTypeOpen] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  useRegisterAction({
    id: 'logs-type',
    label: 'Filter by Type',
    shortcut: 'a',
    handler: () => setIsTypeOpen(true),
    icon: SlidersHorizontalIcon,
    category: 'Logs',
  })

  useRegisterAction({
    id: 'logs-advanced',
    label: 'Advanced Filters',
    shortcut: 'f',
    handler: () => setIsAdvancedOpen(true),
    icon: FilterIcon,
    category: 'Logs',
  })

  useRegisterAction({
    id: 'logs-clear-advanced',
    label: 'Clear Advanced Filters',
    shortcut: 'c',
    handler: () => clearAdvancedFilters(),
    icon: FilterXIcon,
    category: 'Logs',
  })

  const clearAdvancedFilters = () => {
    setParams({
      user: null,
      message: null,
      entityType: null,
      currentPage: 1,
    })
  }

  const entityTypes = [
    { label: 'All', value: 'all' },
    { label: 'Address', value: 'address' },
    { label: 'Category', value: 'category' },
    { label: 'Invoice', value: 'invoice' },
    { label: 'Invoice Charge', value: 'invoiceCharge' },
    { label: 'Order', value: 'order' },
    { label: 'Order Status', value: 'order_status' },
    { label: 'Organization', value: 'organization' },
    { label: 'Product', value: 'product' },
    { label: 'Product Stock', value: 'product_stock' },
    { label: 'User', value: 'user' },
  ]

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap items-center gap-2">
        {loading ? (
          <Skeleton className="h-8 flex-1 sm:w-40 rounded-md" />
        ) : (
          <Select
            items={entityTypes}
            open={isTypeOpen}
            onOpenChange={setIsTypeOpen}
            onValueChange={(value) => {
              setParams({
                entityType: value === 'all' ? null : value,
                currentPage: 1,
              })
            }}
            value={entityType || 'all'}
          >
            <SelectTrigger className="flex-1 sm:w-40">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                <SelectLabel>Log Type</SelectLabel>
                <SelectSeparator />

                {entityTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger
            render={<Button variant="outline" disabled={loading} />}
          >
            <FilterIcon className="mr-2 size-4" />
            Advanced
            {(user || message) && (
              <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                !
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Advanced Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Refine your log search.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <div className="flex flex-col gap-2">
                    <Label className="block space-y-2">
                      <p>Search User</p>

                      <Input
                        placeholder="Search User..."
                        value={user || ''}
                        onChange={(e) => {
                          setParams({
                            user: e.target.value || null,
                            currentPage: 1,
                          })
                        }}
                        className="h-8 text-xs"
                      />
                    </Label>

                    <Label className="block space-y-2">
                      <p>Search Description</p>
                      <Input
                        placeholder="Search Description..."
                        value={message || ''}
                        onChange={(e) => {
                          setParams({
                            message: e.target.value || null,
                            currentPage: 1,
                          })
                        }}
                        className="h-8 text-xs"
                      />
                    </Label>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => clearAdvancedFilters()}
                >
                  Clear Advanced Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
