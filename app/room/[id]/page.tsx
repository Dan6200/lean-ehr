import { notFound, redirect } from "next/navigation";
import Room from "@/components/room";
import { isTypeRoomData } from "@/types/resident";
import util from "node:util";
import { addNewResident } from "@/app/admin/residents/actions/add";
import { getRoomData } from "@/app/admin/residents/actions/get";

export default async function RoomPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const roomData = await getRoomData(id).catch((e) => {
    if (e.message.match(/not_found/i)) throw notFound();
    if (e.message.match(/insufficient permissions/)) redirect("/admin/sign-in");
    throw new Error(
      `Unable to pass props to Resident Component -- Tag:22.\n\t${e}`
    );
  });
  if (!isTypeRoomData(roomData)) throw new Error("Invalid Room Data");
  return <Room {...{ roomData }}></Room>;
}
