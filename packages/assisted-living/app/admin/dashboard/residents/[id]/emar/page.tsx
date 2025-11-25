import { getNestedResidentData } from '#root/actions/residents/get'
import { EmarClient } from '#root/components/residents/emar-client'
import { verifySession } from '#root/auth/server/definitions'
import { Prescription, EmarRecord } from '#root/types'

type EmarPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EmarPage({ params }: EmarPageProps) {
  const { id: residentId } = await params
  const { provider_id } = await verifySession()

  // Fetch all necessary data on the server
  const [prescriptions, emarRecords] = await Promise.all([
    getNestedResidentData(provider_id, residentId, 'prescriptions'),
    getNestedResidentData(provider_id, residentId, 'emar'),
  ])

  return (
    <div className="space-y-4">
      <EmarClient
        residentId={residentId}
        prescriptions={prescriptions || []}
        emarRecords={emarRecords || []}
      />
    </div>
  )
}
