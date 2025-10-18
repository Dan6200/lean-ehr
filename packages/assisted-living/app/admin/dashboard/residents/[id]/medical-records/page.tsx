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
import { MedicalRecord } from '@/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function MedicalRecordsPage({
  params,
}: {
  params: { id: string }
}) {
  const residentData = await getResidentData(params.id).catch((e) => {
    if (e.message.match(/not_found/i)) notFound()
    throw new Error(
      `Unable to fetch resident data for medical records page: ${e.message}`,
    )
  })

  const { medical_records, id } = residentData

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b pb-2 mb-8">
        <h2 className="text-xl font-semibold">Medical Records</h2>
        <Button asChild>
          <Link href={`/admin/dashboard/residents/${id}/medical-records/edit`}>
            Edit Medical Records
          </Link>
        </Button>
      </div>
      {medical_records && medical_records.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type (SNOMED)</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medical_records.map((record: MedicalRecord, index: number) => (
              <TableRow key={index}>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.title}</TableCell>
                <TableCell>{record.snomed_code}</TableCell>
                <TableCell>{record.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No medical records found for this resident.</p>
      )}
    </div>
  )
}
