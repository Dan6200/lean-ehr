"use server";
import { collectionWrapper } from "@/firebase/firestore";
import {
  Resident,
  Facility,
  RoomData,
  ResidentSchema,
  FacilitySchema,
  RoomDataSchema,
} from "@/types";
import { notFound } from "next/navigation";
import { z } from "zod";

export async function getResidentData(
  documentId: string,
): Promise<z.infer<typeof ResidentSchema>> {
  try {
    const residentsColRef = collectionWrapper("residents");
    const residentsSnap = await residentsColRef.doc(documentId).get();
    if (!residentsSnap.exists) throw notFound();
    const resident = residentsSnap.data();
    let validatedResident: Resident;
    try {
      validatedResident = ResidentSchema.parse(resident);
    } catch (error: any) {
      throw new Error(
        "Object is not of type Resident  -- Tag:16: " + error.message,
      );
    }

    return { ...validatedResident, document_id: residentsSnap.id };
  } catch (error) {
    throw new Error("Failed to fetch resident.\n\t\t" + error);
  }
}

export async function getResidents() {
  try {
    const residentsCollection = collectionWrapper("residents");
    const residentsSnap = await residentsCollection.get();
    return residentsSnap.docs.map((doc) => {
      const resident = doc.data();
      let validatedResident: Resident;
      try {
        validatedResident = ResidentSchema.parse(resident);
      } catch (error: any) {
        throw new Error(
          "Object is not of type Resident  -- Tag:20: " + error.message,
        );
      }
      return validatedResident;
    });
  } catch (error) {
    throw new Error("Failed to fetch All Residents Data.\n\t\t" + error);
  }
}

export async function getAllRooms() {
  try {
    const roomsCollection = collectionWrapper("providers/GYRHOME/facilities");
    const roomsSnap = await roomsCollection.get();
    if (!roomsSnap.size) throw notFound();
    return roomsSnap.docs.map((doc) => {
      const facility = { document_id: doc.id, ...doc.data() };
      let validatedFacility: Facility;
      try {
        validatedFacility = FacilitySchema.parse(facility);
      } catch (error: any) {
        console.log(facility);
        throw new Error(
          "Object is not of type Facility  -- Tag:19: " + error.message,
        );
      }
      return validatedFacility;
    });
  } catch (error) {
    throw new Error("Failed to fetch All Room Data.\n\t\t" + error);
  }
}

export async function getRoomData(facilityDocId: string) {
  /******************************************
   * Creates a Join Between Facility,
   * Emergency Contacts and Resident documents on facilityId
   * *********************************************************/

  try {
    const addressCollection = collectionWrapper("providers/GYRHOME/facilities");
    const addressSnap = await addressCollection.doc(facilityDocId).get();
    const residents_map: { [key: string]: Omit<Resident, "facility_id"> } = {};
    const room_map: { [key: string]: RoomData } = {};
    if (!addressSnap.exists) throw notFound();
    const address = {
      ...(addressSnap.data() as Facility),
      document_id: addressSnap.id,
    };
    let validatedAddress: Facility;
    try {
      validatedAddress = FacilitySchema.parse(address);
    } catch (error: any) {
      throw new Error(
        "Object is not of type Facility -- Tag:10: " + error.message,
      );
    }
    room_map[validatedAddress.facility_id] = {
      ...room_map[validatedAddress.facility_id],
      ...validatedAddress,
      residents: null,
    };

    // Fetch and join resident data...
    const residentsCollection = collectionWrapper("residents");
    const resQ = residentsCollection.where(
      "facility_id",
      "==",
      address.facility_id,
    );
    const residentsData = await resQ.get();
    for (const doc of residentsData.docs) {
      if (!doc.exists) throw notFound();
      let resident = doc.data(),
        validatedResident: Resident;
      try {
        validatedResident = ResidentSchema.parse(resident);
      } catch (error: any) {
        throw new Error(
          "Object is not of type Resident -- Tag:9: " + error.message,
        );
      }

      // Add each resident to the residents map
      // Handle duplicates
      if (residents_map[validatedResident.resident_id])
        throw new Error("Duplicate Resident Data! -- Tag:28");
      const { facility_id, ...newResident } = validatedResident;
      residents_map[validatedResident.resident_id] = {
        ...newResident,
        document_id: doc.id,
      };

      // Add all residents in the resident map to the room map
      room_map[resident.facility_id] = {
        ...room_map[resident.facility_id],
        residents: [
          ...(room_map[resident.facility_id].residents ?? []),
          residents_map[resident.resident_id],
        ] as any,
      };
    }

    if (Object.values(room_map).length > 1)
      throw new Error("Duplicate Room Data! -- Tag:28");
    const roomData = Object.values(room_map)[0];
    let validatedRoomData: RoomData;
    try {
      validatedRoomData = RoomDataSchema.parse(roomData);
    } catch (error: any) {
      throw new Error(
        "Object is not of type RoomData -- Tag:29: " + error.message,
      );
    }
    return validatedRoomData;
  } catch (error) {
    throw new Error("Failed to fetch All Residents Data:\n\t\t" + error);
  }
}
