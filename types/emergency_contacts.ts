// Use types from the Admin SDK for server-side code compatibility
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

type Nullable<T> = T | null;

export interface EmergencyContact {
  residence_id: string;
  resident_id: string;
  contact_name?: Nullable<string>;
  cell_phone: string;
  work_phone?: Nullable<string>;
  home_phone?: Nullable<string>;
  relationship?: Nullable<string>;
}

/*
 *
    "emergencyContacts" in data &&
    ((Array.isArray(data.emergencyContacts) &&
      data.emergencyContacts.every(
        (contact: unknown) =>
          typeof (contact as any).cell_phone === "string" &&
          (typeof (contact as any).contact_name === "string" ||
            (contact as any).contact_name == null) &&
          (typeof (contact as any).work_phone === "string" ||
            (contact as any).work_phone == null) &&
          (typeof (contact as any).home_phone === "string" ||
            (contact as any).home_phone == null) &&
          (typeof (contact as any).relationship === "string" ||
            (contact as any).relationship == null),
      )) ||
      (data as any).emergencyContacts == null)
  );
 *
 */

export const isTypeEmergencyContact = (
  data: unknown,
): data is EmergencyContact =>
  !!data &&
  typeof data === "object" &&
  typeof (data as any).residence_id === "string" &&
  typeof (data as any).resident_id === "string" &&
  typeof (data as any).cell_phone === "string" &&
  (typeof (data as any).contact_name === "string" ||
    (data as any).contact_name === null) &&
  (typeof (data as any).work_phone === "string" ||
    (data as any).work_phone === null) &&
  (typeof (data as any).home_phone === "string" ||
    (data as any).home_phone === null) &&
  (typeof (data as any).relationship === "string" ||
    (data as any).relationship === null);

// Converters...
export const emergencyContactConverter: FirestoreDataConverter<EmergencyContact> =
  {
    toFirestore(contact: EmergencyContact): DocumentData {
      return { ...contact }; // Map EmergencyContact fields to Firestore
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): EmergencyContact {
      return snapshot.data() as EmergencyContact; // Map Firestore data to EmergencyContact
    },
  };
