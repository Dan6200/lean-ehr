import { notFound, redirect } from "next/navigation";
import { getResidentData } from "@/app/admin/residents/actions/get";
import { ResidentSchema } from "@/types/resident";
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
      `Unable to pass props to Resident Component -- Tag:22.\n\t${e}`,
    );
  });
  try {
    ResidentSchema.parse(residentData);
  } catch (error: any) {
    throw new Error("Invalid Resident Data -- Tag:30: " + error.message);
  }
  return <Resident {...{ residentData, resId }} />;
}
