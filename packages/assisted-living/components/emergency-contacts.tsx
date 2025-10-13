'use client'
import { EmergencyContact } from '@/types'
import { Card, CardContent, CardFooter } from './ui/card'
import { PhoneCall } from 'lucide-react'
import Link from 'next/link'

export default function EmergencyContacts({
  contacts,
}: {
  contacts: EmergencyContact[]
}) {
  const numContacts = contacts ? contacts.length : 0
  let gridColsClass = 'grid-cols-1'
  if (numContacts >= 2) {
    gridColsClass = 'grid-cols-1 md:grid-cols-2'
  }

  return (
    <section className="space-y-8">
      <h3 className="text-2xl font-bold">Emergency Contacts</h3>
      <section
        className={`grid ${gridColsClass} gap-6 w-full md:w-fit mx-auto`}
      >
        {contacts && contacts.length > 0 ? (
          contacts.map((contact, index) => (
            <Link
              key={index + (contact.contact_name?.split(' ')[0] ?? '')}
              href={`tel:${contact.cell_phone}`}
              className="w-full sm:w-fit"
            >
              <Card className="justify-between hover:bg-green-700/10 active:bg-green-700/10 flex shadow-md p-4 w-full md:p-6 items-center ">
                <CardContent className="p-0 flex flex-col gap-2 text-left ">
                  <h3 className="capitalize font-semibold md:text-base">
                    {contact.contact_name}
                  </h3>
                  {contact.relationship && (
                    <p className="capitalize text-sm text-muted-foreground">
                      {contact.relationship}
                    </p>
                  )}
                  {contact.cell_phone && (
                    <p className="text-green-700 font-semibold">
                      {contact.cell_phone}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="shrink p-2">
                  <PhoneCall className="text-green-700 font-bold mx-auto" />
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <p>No Emergency Contacts On Record</p>
        )}
      </section>
    </section>
  )
}
