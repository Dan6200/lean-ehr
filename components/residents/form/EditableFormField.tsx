"use client";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Nullable } from "@/types/resident";

interface EditableFormFieldProps {
  name: string;
  label: string;
  description: string;
  onDelete?: () => void; // Optional delete handler for the field
  renderInput?: (field: any, disabled: boolean) => React.ReactNode; // Custom input render
}

export function EditableFormField({
  name,
  label,
  description,
  onDelete,
  renderInput,
}: EditableFormFieldProps) {
  const { control, getValues, setValue } = useFormContext();
  const [isFieldEditing, setIsFieldEditing] = useState(false);

  const fieldValue = getValues(name);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>{label}</FormLabel>
            <div className="flex gap-2">
              <span
                onClick={() => setIsFieldEditing(!isFieldEditing)}
                className="p-1 border hover:bg-primary/10 rounded-md cursor-pointer"
              >
                <Edit />
              </span>
              {onDelete && (
                <span
                  onClick={() => {
                    setValue(name, ""); // Clear field value on delete
                    onDelete(); // Call optional delete handler
                  }}
                  className="p-1 border hover:bg-primary/10 rounded-md cursor-pointer"
                >
                  <Trash2 />
                </span>
              )}
            </div>
          </div>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              className={field.value ? "border-2 border-blue-500" : ""}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
