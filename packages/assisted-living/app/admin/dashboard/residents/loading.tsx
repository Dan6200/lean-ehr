import { DataTableSkeleton } from '#lib/components/dashboard/data-table-skeleton'

export default function ResidentsLoading() {
  return (
    <div className="mx-auto py-10">
      <DataTableSkeleton />
    </div>
  )
}
