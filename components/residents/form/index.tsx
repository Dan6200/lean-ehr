"use client";
import { ResidentFormAdd } from "./ResidentFormAdd";
import { ResidentFormEdit } from "./ResidentFormEdit";
import type { Nullable } from "@/types/resident";

interface ResidentFormProps {
  resident_name?: Nullable<string>;
  document_id?: Nullable<string>;
  resident_id?: Nullable<string>;
  residence_id: string;
  emergencyContacts?: Nullable<
    {
      contact_name?: Nullable<string>;
      cell_phone: string;
      home_phone?: Nullable<string>;
      work_phone?: Nullable<string>;
      relationship?: Nullable<string>;
    }[]
  >;
}

export function ResidentForm({
  resident_name,
  document_id,
  resident_id,
  residence_id,
  emergencyContacts,
}: ResidentFormProps) {
  if (document_id && resident_id) {
    return (
      <ResidentFormEdit
        resident_name={resident_name}
        document_id={document_id}
        resident_id={resident_id}
        residence_id={residence_id}
        emergencyContacts={emergencyContacts}
      />
    );
  } else {
    return <ResidentFormAdd residence_id={residence_id} />;
  }
}