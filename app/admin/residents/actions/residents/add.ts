"use server";
import { collectionWrapper } from "@/firebase/firestore";
import db from "@/firebase/server/config";
import { Resident, residentConverter } from "@/types/resident";

export async function addNewResident(
  residentData: Omit<Resident, "resident_id">,
) {
  try {
    await db.runTransaction(async (transaction) => {
      const metadataRef = collectionWrapper("metadata").doc("lastResidentID");
      const metadataSnap = await transaction.get(metadataRef);
      if (!metadataSnap.exists)
        throw new Error("lastResidentID metadata not found");
      const { resident_id: oldResidentId } = metadataSnap.data() as any;
      const resident_id = (parseInt(oldResidentId as any) + 1).toString();
      const { emergencyContacts, ...resident } = {
        ...residentData,
        resident_id,
      };
      // Apply the converter
      const residentRef = collectionWrapper("residents")
        .withConverter(residentConverter)
        .doc();

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
              transaction, // Pass the transaction object directly
            ),
          ),
        );
      }

      // Ensure the 'resident' object matches the 'Resident' type for the converter
      const residentToSave: Resident = {
        resident_id: resident.resident_id,
        residence_id: resident.residence_id,
        resident_name: resident.resident_name,
      };
      transaction.set(residentRef, residentToSave);
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
