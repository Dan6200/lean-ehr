"use client";
import { useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";

import { EditableFormField } from "./EditableFormField";

interface EmergencyContactBlockProps {
  index: number;
  isFormEditing: boolean;
  onDelete: (index: number) => void; // Callback to remove this contact
}

export function EmergencyContactBlock({
  index,
  isFormEditing,
  onDelete,
}: EmergencyContactBlockProps) {
  const { control } = useFormContext();

  return (
    <div className="mb-8 border-b py-4">
      <h3 className="font-semibold mb-8 flex items-center justify-between">
        Emergency Contact {index > 0 ? index + 1 : ""}
        {isFormEditing && (
          <span
            onClick={() => onDelete(index)}
            className="p-1 border hover:bg-primary/10 rounded-md cursor-pointer"
          >
            <Trash2 />
          </span>
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
