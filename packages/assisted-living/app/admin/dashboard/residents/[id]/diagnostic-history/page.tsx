import { getNestedResidentData } from '#root/actions/residents/get/subcollections'
import { verifySession } from '#root/auth/server/definitions'
import { Button } from '#root/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#root/components/ui/table'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function DiagnosticHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: residentId } = await params
  const { provider_id } = await verifySession()

  const diagnostic_history = await getNestedResidentData(
    provider_id,
    residentId,
    'diagnostic_history',
  ).catch((e) => {
    if (e.message.match(/not_found/i)) notFound()
    throw new Error(
      `Unable to fetch resident data for diagnostic history page: ${e.message}`,
    )
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b pb-2 mb-8">
        <h2 className="text-xl font-semibold">Diagnostic History</h2>
        <Button asChild>
          <Link
            href={`/admin/dashboard/residents/${residentId}/diagnostic-history/edit`}
          >
            Edit Diagnostic History
          </Link>
        </Button>
      </div>
      {diagnostic_history && diagnostic_history.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Onset</TableHead>
              <TableHead>Abatement</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type (SNOMED)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recorded Date</TableHead>
              <TableHead>Recorded By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diagnostic_history.map((record, index: number) =>
              record ? (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.onset_datetime
                      ? new Date(record.onset_datetime).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {record.abatement_datetime
                      ? new Date(record.abatement_datetime).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{record.title ?? 'N/A'}</TableCell>
                  <TableCell>
                    {record.code?.text ||
                      record.code?.coding?.[0]?.display ||
                      'N/A'}
                  </TableCell>
                  <TableCell>{record.clinical_status}</TableCell>
                  <TableCell>
                    {record.recorded_date
                      ? new Date(record.recorded_date).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{record.recorder_id}</TableCell>
                </TableRow>
              ) : (
                <TableRow key={index}>
                  <TableCell colSpan={7}>Record Does Not Exist</TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      ) : (
        <p>No diagnostic history found for this resident.</p>
      )}
    </div>
  )
}
