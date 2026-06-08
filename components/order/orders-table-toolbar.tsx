'use client'

import {
  FilterIcon,
  FilterXIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XCircleIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { couriersData } from '@/data/couriers-data'
import { useRegisterAction } from '@/hooks/use-command-actions'
import { useOrderParams } from '@/lib/nuqs/order-params'
import { orderStatuses } from '@/types/globals'

export default function OrdersTableToolbar({
  loading,
  startTransition,
}: {
  loading: boolean
  startTransition: React.TransitionStartFunction
}) {
  const [{ status, query, courier, ref, name, post }, setParams] =
    useOrderParams({ startTransition })

  const [localSearch, setLocalSearch] = useState(query)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Register shortcuts
  useRegisterAction({
    id: 'orders-search',
    label: 'Search Orders',
    shortcut: '/',
    handler: () => searchInputRef.current?.focus(),
    icon: SearchIcon,
    category: 'Orders',
  })

  useRegisterAction({
    id: 'orders-status',
    label: 'Filter by Status',
    shortcut: 'a',
    handler: () => setIsStatusOpen(true),
    icon: SlidersHorizontalIcon,
    category: 'Orders',
  })

  useRegisterAction({
    id: 'orders-filters',
    label: 'Advanced Filters',
    shortcut: 'f',
    handler: () => setIsAdvancedOpen(true),
    icon: SlidersHorizontalIcon,
    category: 'Orders',
  })

  useRegisterAction({
    id: 'clear-filters',
    label: 'Clear Advanced Filters',
    shortcut: 'c',
    handler: () => clearAdvancedFilters(),
    icon: FilterXIcon,
    category: 'Orders',
  })

  // Keep existing effects
  useEffect(() => {
    setLocalSearch(query)
  }, [query])

  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault()
    setParams({ query: localSearch || null, currentPage: 1 })
  }

  const clearSearch = () => {
    setLocalSearch('')
    setParams({ query: null, currentPage: 1 })
  }

  const clearAdvancedFilters = () => {
    setParams({
      courier: null,
      status: null,
      currentPage: 1,
      ref: null,
      name: null,
      post: null,
    })
  }

  const orderStatusOptions = [
    { label: 'All Statuses', value: 'all' },
    ...orderStatuses.map((s) => ({
      label:
        s.replace(/_/g, ' ').charAt(0).toUpperCase() +
        s.replace(/_/g, ' ').slice(1),
      value: s,
    })),
  ]

  const couriers = [...couriersData, { label: 'All', value: 'all' }]
  const hasFilters =
    courier || ref || name || post || (status && status !== 'all')

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <ButtonGroup className="w-full">
            <InputGroup>
              <InputGroupInput
                ref={searchInputRef}
                className="w-full"
                placeholder="Search reference, name..."
                value={localSearch}
                disabled={loading}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.currentTarget.blur()
                  }
                }}
              />
              {localSearch && (
                <InputGroupButton
                  variant="secondary"
                  size="icon-xs"
                  type="button"
                  className="mr-2"
                  disabled={loading}
                  onClick={clearSearch}
                >
                  <XCircleIcon className="size-3" />
                </InputGroupButton>
              )}
            </InputGroup>
            <Button type="submit" variant="outline" disabled={loading}>
              <SearchIcon className="size-4" />
            </Button>
          </ButtonGroup>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {loading ? (
            <Skeleton className="h-8 flex-1 sm:w-40 rounded-md" />
          ) : (
            <Select
              items={orderStatusOptions}
              open={isStatusOpen}
              onOpenChange={setIsStatusOpen}
              onValueChange={(value) => {
                setParams({
                  status: value === 'all' ? null : value,
                  currentPage: 1,
                })
              }}
              value={status || 'all'}
            >
              <SelectTrigger className="h-8 flex-1 sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatusOptions.map((stat) => (
                  <SelectItem key={stat.value} value={stat.value}>
                    {stat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {loading ? (
            <Skeleton className="h-8 flex-1 sm:w-40 rounded-md" />
          ) : (
            <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    disabled={loading}
                    className="h-8 flex-1 sm:w-40"
                  />
                }
              >
                <FilterIcon />
                Advanced
                {hasFilters && (
                  <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    !
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Advanced Filters
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Refine your order search.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <div className="flex flex-col gap-2">
                        <Label className="block space-y-2">
                          <p>Reference</p>
                          <Input
                            placeholder="Reference (#ORD-12345)"
                            value={ref}
                            onChange={(e) => setParams({ ref: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </Label>

                        <Label className="block space-y-2">
                          <p>Customer Name</p>
                          <Input
                            placeholder="Customer Name..."
                            value={name ?? ''}
                            onChange={(e) =>
                              setParams({ name: e.target.value })
                            }
                            className="h-8 text-xs"
                          />
                        </Label>

                        <Label className="block space-y-2">
                          <p>Postcode</p>
                          <Input
                            placeholder="Postcode..."
                            value={post}
                            onChange={(e) =>
                              setParams({ post: e.target.value })
                            }
                            className="h-8 text-xs"
                          />
                        </Label>
                      </div>
                    </div>

                    <div className="grid gap-1">
                      <span className="text-xs font-medium">Courier</span>
                      <Select
                        items={couriers}
                        onValueChange={(v) => {
                          setParams({
                            courier: v === 'all' ? null : v,
                            currentPage: 1,
                          })
                        }}
                        value={courier || 'All'}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder="Select Courier" />
                        </SelectTrigger>
                        <SelectContent>
                          {couriers.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
          )}
        </div>
      </div>
    </div>
  )
}
