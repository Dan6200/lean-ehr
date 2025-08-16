"use client";
import userAtom from "@/atoms/user";
import { useUserSession } from "@/auth/user";
import type { Resident, ResidentData } from "@/types/resident";
import { useAtomValue } from "jotai";
import { PhoneCall } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";

export default function Resident({
  resident,
  children,
}: {
  resident: ResidentData;
  children: ReactNode;
}) {
  const emergencyContacts = resident.emergency_contacts;
  const emConIds = resident.emergency_contact_id;
  const admin = useAtomValue(userAtom),
    router = useRouter();

  return (
    <main className="bg-background flex flex-col gap-5 container md:px-16 mx-auto md:my-16 text-center py-8 h-fit">
      <section className="flex flex-col gap-2 mb-8">
        <h1 className="text-5xl mb-4 font-bold">{resident.name}</h1>
        <p className="font-semibold">Room: {resident.unit_number}</p>
        <p className="">{resident.address}</p>
      </section>
      <section className="mb-8 flex flex-col md:flex-row md:justify-center md:flex-wrap gap-6 w-full">
        {emergencyContacts &&
          emConIds &&
          emergencyContacts.map((contact, index) => (
            <Link
              href={`tel:${contact.phone_number
                .replaceAll(/\s/g, "-")
                .replaceAll(/\(|\)/g, "")}`}
              key={emConIds[index]}
              className="h-fit"
            >
              {/* className="md:basis-[40vw] md:grow md:shrink h-fit" */}
              <Card className="hover:bg-green-700/10 active:bg-green-700/10 flex shadow-md p-4 w-full md:p-6 items-center md:h-[30vh] min-w-[40vw]">
                <CardContent className="grow p-0 flex flex-col justify-between h-3/5 text-left">
                  <h3 className="capitalize font-semibold md:text-xl">
                    {contact.name}
                  </h3>
                  <p className="capitalize">{contact.relationship}</p>
                  <p className="text-green-700 font-semibold">
                    {contact.phone_number}
                  </p>
                </CardContent>
                <CardFooter className="shrink p-2">
                  <span className="border-4 border-green-700 w-16 h-16 flex items-center rounded-full">
                    <PhoneCall className="text-green-700 font-bold mx-auto" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
      </section>
      <section className="mb-8 flex flex-col md:flex-row md:justify-center md:flex-wrap gap-6 w-full md:w-4/5 lg:w-2/3 mx-auto">
        {admin && (
          <div className="flex gap-5 flex-wrap items-center justify-center md:w-2/3">
            <Button
              className="md:w-full grow shrink basis-0"
              onMouseDown={() =>
                router.push(`/admin/residents/${resident.id}/edit`)
              }
            >
              Edit Resident Information
            </Button>
            {children}
          </div>
        )}
      </section>
    </main>
  );
}
