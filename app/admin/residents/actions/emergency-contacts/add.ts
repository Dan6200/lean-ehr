"use server";
import { collectionWrapper } from "@/firebase/firestore";
import {
  EmergencyContact,
  emergencyContactConverter,
  // isTypeEmergencyContact,
} from "@/types/emergency_contacts";
import { Transaction } from "firebase-admin/firestore";

export async function addNewEmergencyContact(
  contact: EmergencyContact,
  transaction: Transaction,
) {
  try {
    // Apply the converter
    const contactRef = collectionWrapper("emergency_contacts")
      .withConverter(emergencyContactConverter)
      .doc();
    // The transaction methods should infer the type from the converted collection reference
    transaction.set(contactRef, contact);
    return true;
  } catch (error) {
    return false;
  }
}
