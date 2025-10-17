import { getResidentData } from '@/actions/residents/get'
import { ResidentFormEdit } from '@/components/residents/form/ResidentFormEdit'
import { notFound } from 'next/navigation'

export default async function ResidentEditPage({
  params,
}: {
  params: { id: string }
}) {
  const residentData = await getResidentData(params.id).catch((e) => {
    if (e.message.match(/not_found/i)) notFound()
    throw new Error(`Unable to fetch resident data for edit page: ${e.message}`)
  })

  // The onFinished prop is no longer needed as we navigate away
  const { address, ...dataToEdit } = residentData

  return (
    <div className="py-8">
      <ResidentFormEdit {...dataToEdit} />
    </div>
  )
}
