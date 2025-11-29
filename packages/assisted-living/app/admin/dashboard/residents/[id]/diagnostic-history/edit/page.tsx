import { getNestedResidentData } from '#root/actions/residents/get/subcollections'
import { DiagnosticHistoryForm } from '#root/components/residents/form/diagnostic-history-form'
import { notFound } from 'next/navigation'
import { verifySession } from '#root/auth/server/definitions'

export default async function EditDiagnosticHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: residentId } = await params
  const { provider_id } = await verifySession()

  const diagnosticHistory = await getNestedResidentData(
    provider_id,
    residentId,
    'diagnostic_history',
  ).catch((e) => {
    if (e.message.match(/not_found/i)) notFound()
    throw new Error(`Unable to fetch resident data for edit page: ${e.message}`)
  })

  return (
    <div className="py-8">
      <DiagnosticHistoryForm
        diagnosticHistory={diagnosticHistory || []}
        residentId={residentId}
      />
    </div>
  )
}
