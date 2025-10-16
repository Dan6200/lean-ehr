'use client'
import { EmergencyContact } from '@/types'
import { Card, CardContent, CardFooter } from './ui/card'
import { PhoneCall } from 'lucide-react'
import Link from 'next/link'

export default function EmergencyContacts({
  contacts,
}: {
  contacts?: EmergencyContact[] | null
}) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {contacts && contacts.length > 0 ? (
        contacts.map((contact, index) => (
          <Link
            key={index + (contact.contact_name?.split(' ')[0] ?? '')}
            href={`tel:${contact.cell_phone}`}
            className="w-full"
          >
            <Card className="h-full hover:bg-green-700/10 active:bg-green-700/10 shadow-md w-full">
              <CardContent className="p-4 md:p-6 flex flex-col gap-2 text-left">
                <h3 className="capitalize font-semibold md:text-base">
                  {contact.contact_name}
                </h3>
                {contact.relationship && (
                  <p className="capitalize text-sm text-muted-foreground">
                    {contact.relationship.join(', ')}
                  </p>
                )}
                {contact.cell_phone && (
                  <p className="text-green-700 font-semibold flex items-center gap-2 pt-2">
                    <PhoneCall className="h-4 w-4" />
                    {contact.cell_phone}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))
      ) : (
        <p>No Emergency Contacts On Record</p>
      )}
    </section>
  )
}
