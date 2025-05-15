"use client";
import { getResidentData } from "@/app/admin/residents/data-actions";
import { GoBackLink } from "@/components/go-back-link";
import { ResidentForm } from "@/components/residents/form";
import { isTypeResidentData, ResidentData } from "@/types/resident";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default async function EditResidentPage({
  params: { id, resId },
}: {
  params: { id: string; resId: string };
}) {
  const room = useSearchParams().get("room");
  const [residentData, setResidentData] = useState<ResidentData | null>(null);
  useEffect(() => {
    (async () => setResidentData(await getResidentData(resId)))();
  });
  if (!residentData && !isTypeResidentData(residentData))
    throw new Error("Invalid Data from Server");
  return (
    <main className="flex flex-col gap-5 bg-background container w-full md:w-2/3 mx-auto py-32">
      <GoBackLink
        url={`/room/${id}`}
        className="cursor-pointer text-blue-700 flex w-full sm:w-3/5 gap-2 sm:gap-5"
      >
        Go To Previous Page
      </GoBackLink>
      <ResidentForm
        {...{
          ...residentData,
        }}
      />
    </main>
  );
}
