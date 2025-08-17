"use client";
import { Edit, Trash2 } from "lucide-react";

import { EditableFormField } from "./EditableFormField";
import { Dispatch, SetStateAction } from "react";

interface EmergencyContactBlockProps {
  index: number;
  isFormEditing: boolean;
  onDelete: (index: number) => void; // Callback to remove this contact
  setIsFormEditing: Dispatch<SetStateAction<boolean>>;
}

export function EmergencyContactBlock({
  index,
  isFormEditing,
  onDelete,
  setIsFormEditing,
}: EmergencyContactBlockProps) {
  return (
    <div className="mb-8 border-b py-4">
      <h3 className="font-semibold mb-8 flex items-center justify-between">
        Emergency Contact {index > 0 ? index + 1 : ""}
        {isFormEditing && (
          <div className="flex gap-2">
            <span
              onClick={() => setIsFormEditing(!isFormEditing)}
              className="p-1 border hover:bg-primary/10 rounded-md cursor-pointer"
            >
              <Edit />
            </span>
            <span
              onClick={() => onDelete(index)}
              className="p-1 border hover:bg-primary/10 rounded-md cursor-pointer"
            >
              <Trash2 />
            </span>
          </div>
        )}
      </h3>
      <div className="space-y-6">
        <EditableFormField
          name={`emergencyContacts.${index}.contact_name`}
          label="Name"
          description="Emergency Contact's Name"
          isFormEditing={isFormEditing}
        />
        <EditableFormField
          name={`emergencyContacts.${index}.relationship`}
          label="Relationship"
          description="Emergency Contact's Relationship"
          isFormEditing={isFormEditing}
        />
        <EditableFormField
          name={`emergencyContacts.${index}.cell_phone`}
          label="Cell Phone"
          description="Emergency Contact's Cell Phone Number"
          isFormEditing={isFormEditing}
        />
        <EditableFormField
          name={`emergencyContacts.${index}.home_phone`}
          label="Home Phone"
          description="Emergency Contact's Home Phone Number"
          isFormEditing={isFormEditing}
        />
        <EditableFormField
          name={`emergencyContacts.${index}.work_phone`}
          label="Work Phone"
          description="Emergency Contact's Work Phone Number"
          isFormEditing={isFormEditing}
        />
      </div>
    </div>
  );
}
