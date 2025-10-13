'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Edit } from 'lucide-react'
import { getAuth, onAuthStateChanged } from 'firebase/auth' // Added imports

import { toast } from '@/components/ui/use-toast'
import { isError } from '@/app/utils'
import { updateResident } from '@/actions/residents/update'
import { ResidentFormBase } from './ResidentFormBase'
import {
  type Resident,
  type Nullable,
  type ResidentData,
  ResidentDataSchema,
} from '@/types'

export function ResidentFormEdit({
  ...residentData
}: Omit<ResidentData, 'address'>) {
  const { resident_name, id, facility_id, emergency_contacts } = residentData
  const router = useRouter()
  const [idToken, setIdToken] = useState<string | null>(null) // State to hold idToken

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken()
        setIdToken(token)
      } else {
        setIdToken(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const form = useForm<ResidentData>({
    resolver: zodResolver(ResidentDataSchema),
    defaultValues: {
      resident_name: resident_name ?? undefined,
      emergency_contacts:
        emergency_contacts?.map(
          ({
            contact_name,
            cell_phone,
            home_phone,
            work_phone,
            relationship,
          }) => ({
            contact_name: contact_name ?? undefined,
            cell_phone,
            home_phone: home_phone ?? undefined,
            work_phone: work_phone ?? undefined,
            relationship: relationship ?? undefined,
          }),
        ) ?? [],
    },
  })
  const originalNoOfEmContacts = useRef(emergency_contacts?.length ?? 0)

  async function onSubmit(data: z.infer<typeof ResidentDataSchema>) {
    if (!idToken) {
      toast({
        title: 'Authentication Error',
        description: 'User not authenticated. Please log in again.',
        variant: 'destructive',
      })
      return
    }

    let residentData: ResidentData = {} as ResidentData
    residentData.resident_name = data.resident_name ?? null
    residentData.facility_id = facility_id

    if (data.emergency_contacts) {
      residentData.emergency_contacts = data.emergency_contacts.map(
        (contact) => ({
          work_phone: contact.work_phone ?? null,
          home_phone: contact.home_phone ?? null,
          contact_name: contact.contact_name ?? null,
          relationship: contact.relationship ?? null,
          cell_phone: contact.cell_phone,
        }),
      )
    } else {
      residentData.emergency_contacts = null
    }

    try {
      if (!id) throw new Error("Can't find the resource to edit")
      const { message, success } = await updateResident(residentData, id)
      toast({
        title: message,
        variant: success ? 'default' : 'destructive',
      })
      router.back()
    } catch (err) {
      if (isError(err)) toast({ title: err.message, variant: 'destructive' })
    }
  }

  return (
    <ResidentFormBase
      form={form}
      onSubmit={onSubmit}
      formTitle="Edit Resident Information"
      isResidentNameEditableByDefault={false}
      originalNoOfEmContacts={originalNoOfEmContacts.current}
    />
  )
}
