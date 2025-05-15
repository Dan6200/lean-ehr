import { getAllRooms } from "./admin/residents/data-actions";
import { redirect } from "next/navigation";
import RoomList from "@/components/room-list";

export const revalidate = 60;

export default async function Home() {
  const rooms = await getAllRooms().catch((e) => {
    if (e.message.match(/insufficient permissions/)) redirect("/admin/sign-in");
  });
  if (!rooms) throw new Error("Unable To Fetch Rooms");
  return (
    <main className="sm:container bg-background text-center mx-auto py-32 md:py-24">
      <RoomList {...{ rooms }} />
    </main>
  );
}
