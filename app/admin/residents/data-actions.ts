"use server";
import { collectionWrapper } from "@/firebase/firestore";
import db from "@/firebase/server/config";
import {
  EmergencyContact,
  emergencyContactConverter,
  isTypeEmergencyContact,
  isTypeResidence,
  isTypeResident,
  ResidentData,
} from "@/types/resident";
import { Transaction } from "firebase/firestore";
import { notFound } from "next/navigation";

/** TODO: Replace all Fetching with Real-Time listeners **/

export async function addNewEmergencyContact(
  contact: EmergencyContact,
  transaction: Transaction
) {
  try {
    const residentRef = collectionWrapper("emergency_contacts")
      .withConverter(emergencyContactConverter as any) // TODO: Fix type issues here...
      .doc();
    transaction.set(residentRef as any, contact); // TODO: And here...
    return true;
  } catch (error) {
    return false;
  }
}

export async function addNewResident(
  residentData: Omit<ResidentData, "resident_id">
) {
  try {
    await db.runTransaction(async (transaction) => {
      const metadataRef = collectionWrapper("metadata").doc("lastResidentID");
      const metadataSnap = await transaction.get(metadataRef);
      if (!metadataSnap.exists)
        throw new Error("lastResidentID metadata not found");
      const { resident_id: oldResidentId } = <any>metadataSnap.data();
      const resident_id = (parseInt(oldResidentId as any) + 1).toString();
      const { emergencyContacts, ...resident } = {
        ...residentData,
        resident_id,
      };
      const residentRef = collectionWrapper("residents").doc();

      if (emergencyContacts && emergencyContacts.length) {
        const { residence_id } = resident;
        await Promise.all(
          emergencyContacts.map((contact) =>
            addNewEmergencyContact(
              {
                ...contact,
                residence_id,
                resident_id,
              },
              transaction as any // TODO: fix type issues
            )
          )
        );
      }
      transaction.set(residentRef, resident);
      transaction.update(metadataRef, { resident_id });
    });
    return {
      message: "Successfully Added a New Resident",
      success: true,
    };
  } catch (error) {
    console.error("Failed to Add a New Resident.", error);
    return {
      success: false,
      message: "Failed to Add a New Resident",
    };
  }
}

export async function updateResident(
  newResidentData: ResidentData,
  documentId: string
) {
  try {
    await db.runTransaction(async (transaction) => {
      const residentRef = collectionWrapper("residents").doc(documentId);
      const resSnap = await transaction.get(residentRef);
      if (!resSnap.exists) throw notFound();
      const { emergencyContacts } = newResidentData;
      if (emergencyContacts && emergencyContacts.length) {
        const newContactsMap = new Map(
          emergencyContacts.map((contact) => [contact.cell_phone, contact])
        );
        const emContactsCollection = collectionWrapper("emergency_contacts");
        const existingContactsSnap = await emContactsCollection
          .where("resident_id", "==", newResidentData.resident_id)
          .get();
        existingContactsSnap.forEach((doc) => {
          const existingContact = doc.data();
          const existingCellPhone = existingContact.cell_phone;
          if (newContactsMap.has(existingCellPhone))
            transaction.delete(doc.ref);
        });

        emergencyContacts.forEach((contact) => {
          const newDocRef = emContactsCollection.doc();
          transaction.set(newDocRef, {
            ...contact,
            resident_id: newResidentData.resident_id,
          });
        });
      }
      transaction.update(residentRef, <any>newResidentData);
    });
    return {
      success: true,
      message: "Successfully Updated Resident Information",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to Update the Resident",
    };
  }
}

export async function mutateResidentData(
  resident: Omit<ResidentData, "resident_id">
): Promise<
  { message: string; success: boolean } | { message: string; success: boolean }
>;
export async function mutateResidentData(
  resident: ResidentData,
  residentId: string
): Promise<
  { message: string; success: boolean } | { message: string; success: boolean }
>;
export async function mutateResidentData(
  resident: ResidentData | Omit<ResidentData, "resident_id">,
  residentId?: string
) {
  if (residentId && "resident_id" in resident)
    return updateResident(resident, residentId);
  return addNewResident(resident);
}

export async function getResidentData(residentId: string) {
  try {
    const residentsColRef = collectionWrapper("residents");
    const residentsSnap = await residentsColRef.doc(residentId).get();
    if (!residentsSnap.exists) throw notFound();
    const resident = residentsSnap.data();
    if (!isTypeResident(resident))
      throw new Error("Object is not of type Resident  -- Tag:16");

    //Fetch and join contact data...
    let emergencyContacts: EmergencyContact[] | null = [];
    const emContactsCollection = collectionWrapper("emergency_contacts");
    const contQ = emContactsCollection.where(
      "resident_id",
      "==",
      resident.resident_id
    );
    const contactData = await contQ.get();
    if (contactData.empty) emergencyContacts = null;
    else {
      for (const doc of contactData.docs) {
        if (!isTypeEmergencyContact(doc.data()))
          throw new Error("Object is not of type Emergency Contacts -- Tag:29");
        const { residence_id, resident_id, ...contact } = <any>doc.data();
        emergencyContacts.push(contact);
      }
    }

    return { ...resident, document_id: residentsSnap.id, emergencyContacts };
  } catch (error) {
    throw new Error("Failed to fetch resident.\n\t\t" + error);
  }
}

export async function getResidents() {
  try {
    const residentsCollection = collectionWrapper("residents");
    const residentsSnap = await residentsCollection.get();
    return residentsSnap.docs.map((doc: any) => {
      const resident = doc.data();
      if (!isTypeResident(resident))
        throw new Error("Object is not of type Resident  -- Tag:19");
      return resident;
    });
  } catch (error) {
    throw new Error("Failed to fetch All Residents Data.\n\t\t" + error);
  }
}

export async function getAllRooms() {
  try {
    const roomsCollection = collectionWrapper("residence");
    const roomsSnap = await roomsCollection.get();
    if (!roomsSnap.size) throw notFound();
    return roomsSnap.docs.map((doc) => {
      const residence = doc.data();
      if (!isTypeResidence(residence))
        throw new Error("Object is not of type Residence  -- Tag:19");
      return { document_id: doc.id, ...residence };
    });
  } catch (error) {
    throw new Error("Failed to fetch All Room Data.\n\t\t" + error);
  }
}

export async function getRoomData(residenceId: string) {
  /******************************************
   * Creates a Join Between Residence,
   * Emergency Contacts and Resident documents on residenceId
   * *********************************************************/

  try {
    const addressCollection = collectionWrapper("residence");
    const addressSnap = await addressCollection.doc(residenceId).get();
    const residents_map: any = {};
    const room_map: any = {};
    if (!addressSnap.exists) throw notFound();
    const address = {
      ...(addressSnap.data() as any),
      document_id: addressSnap.id,
    };
    if (!isTypeResidence(address))
      throw new Error("Object is not of type Residence -- Tag:10");
    room_map[address.residence_id] = {
      ...room_map[address.residence_id],
      ...address,
      residents: null,
    };

    // Fetch and join resident data...
    const residentsCollection = collectionWrapper("residents");
    const resQ = residentsCollection.where(
      "residence_id",
      "==",
      address.residence_id
    );
    const residentsData = await resQ.get();
    for (const doc of residentsData.docs) {
      if (!doc.exists) throw notFound();
      let resident = doc.data();
      if (!isTypeResident(resident))
        throw new Error("Object is not of type Resident -- Tag:9");

      // Add each resident to the residents map
      // Handle duplicates
      if (residents_map[resident.resident_id])
        throw new Error("Duplicate Resident Data! -- Tag:28");
      const { residence_id, ...newResident } = resident;
      residents_map[resident.resident_id] = {
        ...newResident,
        document_id: doc.id,
      };

      // Add all residents in the resident map to the room map
      room_map[resident.residence_id] = {
        ...room_map[resident.residence_id],
        residents: [
          ...(room_map[resident.residence_id].residents ?? []),
          residents_map[resident.resident_id],
        ],
      };
    }

    if (Object.values(room_map).length > 1)
      throw new Error("Duplicate Room Data! -- Tag:28");
    const roomData = Object.values(room_map)[0];
    return roomData;
  } catch (error) {
    throw new Error("Failed to fetch All Residents Data:\n\t\t" + error);
  }
}

export async function deleteResidentData(documentId: string) {
  try {
    await db.runTransaction(async (transaction) => {
      const residentDocRef = collectionWrapper("residents").doc(documentId);
      const contactColRef = collectionWrapper("emergency_contacts");

      const resSnap = await transaction.get(residentDocRef);
      if (!resSnap.exists) throw notFound();

      const contactQuery = contactColRef.where(
        "resident_id",
        "==",
        resSnap.data()?.resident_id
      );
      const contactSnap = await contactQuery.get();

      transaction.delete(resSnap.ref);
      contactSnap.forEach((doc) => transaction.delete(doc.ref));
    });
    return { success: true, message: "Successfully Deleted Resident" };
  } catch (error) {
    console.error("Failed to Delete the Resident.", error);
    return {
      success: false,
      message: "Failed to Delete the Resident.",
    };
  }
}
