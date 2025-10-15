import { redirect } from 'next/navigation'

export default function ResidentPage({ params }: { params: { id: string } }) {
  redirect(`/admin/dashboard/residents/${params.id}/information`)
}
