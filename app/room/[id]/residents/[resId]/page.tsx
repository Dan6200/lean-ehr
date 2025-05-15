import { notFound, redirect } from "next/navigation";
import { getResidentData } from "@/app/admin/residents/data-actions";
import { isTypeResidentData } from "@/types/resident";
import util from "node:util";
import Resident from "@/components/resident";

export default async function ResidentPage({
  params: { resId },
}: {
  params: { resId: string };
}) {
  const residentData = await getResidentData(resId).catch((e) => {
    if (e.message.match(/not_found/i)) throw notFound();
    if (e.message.match(/insufficient permissions/)) redirect("/admin/sign-in");
    throw new Error(
      `Unable to pass props to Resident Component -- Tag:22.\n\t${e}`
    );
  });
  if (!isTypeResidentData(residentData))
    throw new Error("Invalid Resident Data");
  return <Resident {...{ residentData, resId }} />;
}
