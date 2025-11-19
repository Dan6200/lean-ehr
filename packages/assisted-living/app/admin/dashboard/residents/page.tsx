import { getAllResidents } from '#lib/actions/residents/get'
import { ResidentsTable } from '#lib/components/dashboard/residents-table'

export default async function ResidentsPage() {
  const { residents } = await getAllResidents({})

  return (
    <div className="mx-auto py-10">
      <ResidentsTable data={residents} />
    </div>
  )
}
