'use client'
import { getResidentData } from '@/actions/residents/get'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Medication } from '@/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function MedicationsPage({
  params,
}: {
  params: { id: string }
}) {
  const residentData = await getResidentData(params.id).catch((e) => {
    if (e.message.match(/not_found/i)) notFound()
    throw new Error(
      `Unable to fetch resident data for medications page: ${e.message}`,
    )
  })

  const { medications, id } = residentData

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b pb-2 mb-8">
        <h2 className="text-xl font-semibold">Medications</h2>
        <Button asChild>
          <Link href={`/admin/dashboard/residents/${id}/medications/edit`}>
            Edit Medications
          </Link>
        </Button>
      </div>
      {medications && medications.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>RxNorm Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((med: Medication, index: number) => (
              <TableRow key={index}>
                <TableCell>{med.name}</TableCell>
                <TableCell>{med.dosage || 'N/A'}</TableCell>
                <TableCell>{med.frequency || 'N/A'}</TableCell>
                <TableCell>{med.rxnorm_code || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No medications recorded for this resident.</p>
      )}
    </div>
  )
}
