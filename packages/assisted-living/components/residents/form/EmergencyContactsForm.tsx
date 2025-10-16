'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { isError } from '@/app/utils'
import { ResidentFormBase } from './ResidentFormBase'
import { EmergencyContact, ResidentDataSchema } from '@/types'
import { updateEmergencyContacts } from '@/actions/residents/update-emergency-contacts'
import { useRef } from 'react'

// Create a schema that only validates the emergency_contacts array
const EmergencyContactsFormSchema = z.object({
  emergency_contacts: z.array(
    ResidentDataSchema.shape.emergency_contacts.unwrap().element,
  ),
})

export function EmergencyContactsForm({
  documentId,
  initialContacts,
  onFinished,
}: {
  documentId: string
  initialContacts: EmergencyContact[]
  onFinished: () => void
}) {
  const router = useRouter()
  const form = useForm<z.infer<typeof EmergencyContactsFormSchema>>({
    resolver: zodResolver(EmergencyContactsFormSchema),
    defaultValues: {
      emergency_contacts: initialContacts || [],
    },
  })

  const originalNoOfEmContacts = useRef(initialContacts?.length ?? 0)

  async function onSubmit(data: z.infer<typeof EmergencyContactsFormSchema>) {
    try {
      const { message, success } = await updateEmergencyContacts(
        data.emergency_contacts,
        documentId,
      )
      toast({
        title: message,
        variant: success ? 'default' : 'destructive',
      })
      if (success) {
        router.refresh()
        onFinished()
      }
    } catch (err) {
      if (isError(err)) toast({ title: err.message, variant: 'destructive' })
    }
  }

  return (
    <ResidentFormBase
      form={form}
      onSubmit={onSubmit}
      formTitle="Edit Emergency Contacts"
      isResidentNameEditableByDefault={false} // This will hide the name field
      originalNoOfEmContacts={originalNoOfEmContacts.current}
    />
  )
}
