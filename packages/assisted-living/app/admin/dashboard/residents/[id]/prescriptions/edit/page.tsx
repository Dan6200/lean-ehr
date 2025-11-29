import { getNestedResidentData } from '#root/actions/residents/get/subcollections'
import { PrescriptionsForm } from '#root/components/residents/form/prescriptions-form'
import { notFound } from 'next/navigation'
import { verifySession } from '#root/auth/server/definitions'

export default async function EditPrescriptionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: residentId } = await params
  const { provider_id } = await verifySession()

  const prescriptions = await getNestedResidentData(
    provider_id,
    residentId,
    'prescriptions',
  ).catch((e) => {
    if (e.message.match(/not_found/i)) notFound()
    throw new Error(
      `Unable to fetch resident's prescription data for edit page: ${e.message}`,
    )
  })

  return (
    <div className="py-8">
      <PrescriptionsForm
        prescriptions={prescriptions || []}
        residentId={residentId}
      />
    </div>
  )
}
