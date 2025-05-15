//import { FieldValue } from "firebase/firestore";
export type Nullable<T> = T | null | undefined;

import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase/firestore";

export interface Residence {
  residence_id: string;
  roomNo: string;
  address: string;
}

export const isTypeResidence = (data: unknown): data is Residence =>
  !!data &&
  typeof data === "object" &&
  "residence_id" in data &&
  "roomNo" in data &&
  "address" in data;

export interface Resident {
  resident_id: string;
  residence_id: string;
  resident_name: Nullable<string>;
}

export interface ResidentData {
  resident_id: string;
  residence_id: string;
  resident_name: Nullable<string>;
  document_id?: Nullable<string>;
  emergencyContacts: Nullable<
    {
      contact_name: Nullable<string>;
      cell_phone: string;
      work_phone: Nullable<string>;
      home_phone: Nullable<string>;
      relationship: Nullable<string>;
    }[]
  >;
}

export const isTypeResidentData = (data: unknown): data is ResidentData => {
  return (
    !!data &&
    typeof data === "object" &&
    "resident_id" in data &&
    typeof data.resident_id === "string" &&
    "residence_id" in data &&
    typeof data.residence_id === "string" &&
    "document_id" in data &&
    typeof data.document_id === "string" &&
    (("resident_name" in data && typeof data.resident_name === "string") ||
      (data as any).resident_name === null) &&
    "emergencyContacts" in data &&
    ((Array.isArray(data.emergencyContacts) &&
      data.emergencyContacts.every(
        (contact: unknown) =>
          typeof (contact as any).cell_phone === "string" &&
          (typeof (contact as any).contact_name === "string" ||
            (contact as any).contact_name === null) &&
          (typeof (contact as any).work_phone === "string" ||
            (contact as any).work_phone === null) &&
          (typeof (contact as any).home_phone === "string" ||
            (contact as any).home_phone === null) &&
          (typeof (contact as any).relationship === "string" ||
            (contact as any).relationship === null)
      )) ||
      (data as any).emergencyContacts === null)
  );
};

export const isTypeResident = (data: unknown): data is Resident =>
  !!data &&
  typeof data === "object" &&
  "resident_id" in data &&
  "resident_name" in data &&
  "residence_id" in data;

export interface EmergencyContact {
  residence_id: string;
  resident_id: string;
  contact_name: Nullable<string>;
  cell_phone: string;
  work_phone: Nullable<string>;
  home_phone: Nullable<string>;
  relationship: Nullable<string>;
}

//export interface EmergencyContact {
//  residence_id: string | FieldValue;
//  resident_id: string | FieldValue;
//  contact_name?: string | FieldValue;
//  cell_phone: string | FieldValue;
//  work_phone?: string | FieldValue;
//  home_phone?: string | FieldValue;
//  relationship?: string | FieldValue;
//}

export const isTypeEmergencyContact = (
  data: unknown
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

export interface RoomData {
  document_id: string;
  residence_id: string;
  roomNo: string;
  address: string;
  residents:
    | [
        {
          document_id: string;
          resident_id: string;
          resident_name: Nullable<string>;
        }
      ]
    | null;
}

export const isTypeRoomData = (data: unknown): data is RoomData =>
  !!data &&
  typeof data === "object" &&
  "document_id" in data &&
  typeof (data as any).document_id === "string" &&
  "residence_id" in data &&
  typeof (data as any).residence_id === "string" &&
  "roomNo" in data &&
  typeof (data as any).roomNo === "string" &&
  "address" in data &&
  typeof (data as any).address === "string" &&
  "residents" in data &&
  ((data as any).residents === null ||
    (Array.isArray((data as any).residents) &&
      (data as any).residents.every(
        (resident: any) =>
          typeof resident === "object" &&
          "document_id" in data &&
          typeof (data as any).document_id === "string" &&
          "resident_id" in resident &&
          typeof resident.resident_id === "string" &&
          "resident_name" in resident &&
          (typeof resident.resident_name === "string" ||
            resident.resident_name === null)
      )));

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

export const residentConverter: FirestoreDataConverter<Resident> = {
  toFirestore(contact: Resident): DocumentData {
    return { ...contact }; // Map Resident fields to Firestore
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Resident {
    return snapshot.data() as Resident; // Map Firestore data to EmergencyContact
  },
};

export const residenceConverter: FirestoreDataConverter<Residence> = {
  toFirestore(contact: Residence): DocumentData {
    return { ...contact }; // Map Residence fields to Firestore
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Residence {
    return snapshot.data() as Residence; // Map Firestore data to EmergencyContact
  },
};
