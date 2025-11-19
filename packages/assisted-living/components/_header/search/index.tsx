'use client'
import { useState } from 'react'
import { Suggestions } from '#root/components/header/search/suggestions'
import { ResidentData } from '#root/types'
import { SearchBar } from './search-bar'
import { cn } from '#root/components/lib/utils'

interface SearchProps {
  residentsData: ResidentData[] | null
  className: string
}

export default function Search({ residentsData, className }: SearchProps) {
  const [matchingResidentsData, setMatchingResidentsData] = useState<
    null | ResidentData[]
  >(null)
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('', className)}>
      <SearchBar
        {...{
          residentsData,
          matchingResidentsData,
          setMatchingResidentsData,
          setOpen,
        }}
      />
      {matchingResidentsData && open && (
        <Suggestions {...{ matchingResidentsData, setOpen }} />
      )}
    </div>
  )
}
