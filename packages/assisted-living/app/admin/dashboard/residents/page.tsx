import { getAllResidentsData } from '@/actions/residents/get'
import { DataTable } from '@/components/dashboard/data-table'
import { Resident } from '@/types'
import { ColumnDef } from '@tanstack/react-table'

export default async function ResidentsPage() {
  const { residents } = await getAllResidentsData({})

  const columns: ColumnDef<Resident>[] = [
    {
      accessorKey: 'resident_name',
      header: 'Name',
    },
    {
      accessorKey: 'facility_id',
      header: 'Facility ID',
    },
    {
      accessorKey: 'room_no',
      header: 'Room No.',
    },
    {
      accessorKey: 'dob',
      header: 'Date of Birth',
    },
    {
      accessorKey: 'pcp',
      header: 'PCP',
    },
    {
      accessorKey: 'address',
      header: 'Address',
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={residents} />
    </div>
  )
}
