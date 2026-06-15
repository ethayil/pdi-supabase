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
import { useUserParams } from '@/lib/nuqs/user-params'

export default function UserTypeSelect({
  loading,
  startTransition,
}: {
  loading: boolean;
  startTransition?: React.TransitionStartFunction;
}) {
  const [{ userType }, setParams] = useUserParams({ startTransition })
  const [isTypeOpen, setIsTypeOpen] = useState(false)

  useRegisterAction({
    id: 'users-type',
    label: 'Filter by Organization',
    shortcut: 'a',
    handler: () => setIsTypeOpen(true),
    icon: SlidersHorizontalIcon,
    category: 'Users',
  })

  const userTypeWithAll = [
    { value: 'all', label: 'All' },
    { value: 'org', label: 'Organization' },
    { value: 'unlinked', label: 'Unlinked' },
    { value: 'admin', label: 'Admin' },
  ]

  if (loading) {
    return <Skeleton className="h-8 w-40 rounded-md" />
  }

  return (
    <Select
      items={userTypeWithAll}
      open={isTypeOpen}
      onOpenChange={setIsTypeOpen}
      value={userType}
      onValueChange={(value) => setParams({ userType: value })}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectLabel>Filter by type</SelectLabel>
          <SelectSeparator />
          {userTypeWithAll.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
