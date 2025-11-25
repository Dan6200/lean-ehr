import { getResidentData } from '#root/actions/residents/get'
import { AllergiesForm } from '#root/components/residents/form/allergies-form'
import { notFound } from 'next/navigation'

export default async function EditAllergiesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const residentData = await getResidentData((await params).id).catch((e) => {
    if (e.message.match(/not_found/i)) notFound()
    throw new Error(`Unable to fetch resident data for edit page: ${e.message}`)
  })

  return (
    <div className="py-8">
      <AllergiesForm residentData={residentData} />
    </div>
  )
}
