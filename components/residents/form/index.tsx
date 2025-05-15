"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  EmergencyContact,
  Nullable,
  Resident,
  ResidentData,
} from "@/types/resident";
import { Minus, Plus } from "lucide-react";
import { isError } from "@/app/utils";
import { mutateResidentData } from "@/app/admin/residents/data-actions";

const emergencyContactSchema = z.object({
  contact_name: z
    .string()
    .min(3, {
      message: "contact name must be at least 3 characters.",
    })
    .nullable()
    .optional(),
  cell_phone: z.string(),
  home_phone: z.string().nullable().optional(),
  work_phone: z.string().nullable().optional(),
  relationship: z.string().nullable().optional(),
});

const ResidentFormSchema = z.object({
  resident_name: z.string().nullable(),
  emergencyContacts: z.array(emergencyContactSchema).nullable().optional(),
});

export type MutateResidents =
  | ((
      resident: Resident,
      residentId?: string
    ) => Promise<{ result?: string; success: boolean; message: string }>)
  | ((
      resident: Resident
    ) => Promise<{ result: string; success: boolean; message: string }>);

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
  const router = useRouter();
  const [noOfEmContacts, setNoOfEmContacts] = useState(
    emergencyContacts?.length ?? 0
  );
  const form = useForm<z.infer<typeof ResidentFormSchema>>({
    resolver: zodResolver(ResidentFormSchema),
    defaultValues: {
      resident_name: resident_name ?? undefined,
      emergencyContacts:
        emergencyContacts?.map(
          ({
            contact_name,
            cell_phone,
            home_phone,
            work_phone,
            relationship,
          }) => ({
            contact_name: contact_name ?? undefined,
            cell_phone,
            home_phone: home_phone ?? undefined,
            work_phone: work_phone ?? undefined,
            relationship: relationship ?? undefined,
          })
        ) ?? [],
    },
  });

  async function onSubmit(data: z.infer<typeof ResidentFormSchema>) {
    let residentData: ResidentData = {} as any;
    residentData.resident_name = null;
    if (!emergencyContacts) residentData.emergencyContacts = null;
    else
      residentData.emergencyContacts = { ...emergencyContacts } as Omit<
        EmergencyContact,
        "resident_id" | "residence_id"
      >[];
    try {
      if (document_id && resident_id) {
        // Edit Resident Information
        if (data.emergencyContacts) {
          // Initialize all values to null
          const _emergencyContacts = data.emergencyContacts.map((contact) => ({
            work_phone: contact.work_phone ?? null,
            home_phone: contact.home_phone ?? null,
            contact_name: contact.contact_name ?? null,
            relationship: contact.relationship ?? null,
            cell_phone: contact.cell_phone,
            residence_id,
          }));

          residentData = {
            ...data,
            residence_id,
            resident_id,
            emergencyContacts: [...(_emergencyContacts as any)],
          };
        }
        const { message, success } = await mutateResidentData(
          { ...residentData },
          document_id
        );
        toast({
          title: message,
          variant: success ? "default" : "destructive",
        });
        router.back();
      } else {
        // Add new residents
        residentData = { ...residentData, ...data } as any;
        if (data.emergencyContacts) {
          // Initialize all values to null
          const _emergencyContacts = data.emergencyContacts.map((contact) => ({
            work_phone: contact.work_phone ?? null,
            home_phone: contact.home_phone ?? null,
            contact_name: contact.contact_name ?? null,
            relationship: contact.relationship ?? null,
            cell_phone: contact.cell_phone,
            residence_id,
          }));

          residentData.emergencyContacts = [...(_emergencyContacts as any)];
        }
        const { message, success } = await mutateResidentData({
          ...residentData,
          residence_id,
        });
        if (!success) {
          toast({
            title: success ? "Unable to Add New Resident" : message,
            variant: "destructive",
          });
          return;
        }
        toast({ title: message });
        form.reset({ resident_name: "", emergencyContacts: [] });
      }
    } catch (err) {
      if (isError(err)) toast({ title: err.message, variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <h1 className="font-semibold mb-8 text-2xl ">
        {!document_id && !resident_id
          ? "Add A New Resident"
          : "Edit Resident Information"}
      </h1>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:w-4/5 lg:w-3/4 space-y-6"
      >
        <FormField
          control={form.control}
          name="resident_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Residents Name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end border-b w-full">
          <h4 className="gap-2 flex items-center pb-4">
            {(noOfEmContacts < 1 ? "Add " : "") + "Emergency Contacts"}
            <span
              onClick={() =>
                setNoOfEmContacts(
                  noOfEmContacts < 10 ? noOfEmContacts + 1 : noOfEmContacts
                )
              }
              className="p-1 border hover:bg-primary/10 rounded-md"
            >
              <Plus />
            </span>
            {noOfEmContacts > 0 && (
              <span
                onClick={() =>
                  setNoOfEmContacts(
                    noOfEmContacts > 0 ? noOfEmContacts - 1 : noOfEmContacts
                  )
                }
                className="p-1 border hover:bg-primary/10 rounded-md"
              >
                <Minus />
              </span>
            )}
          </h4>
        </div>
        {noOfEmContacts > 0 &&
          new Array(noOfEmContacts).fill(null).map((_, i) => (
            <div key={i} className="mb-8 border-b py-4">
              <h3 className="font-semibold mb-8">
                Emergency Contact {i > 0 ? i + 1 : ""}
              </h3>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name={`emergencyContacts.${i}.contact_name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>
                        Emergency Contact's Name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`emergencyContacts.${i}.relationship`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>
                        Emergency Contact's Relationship
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`emergencyContacts.${i}.cell_phone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cell Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Emergency Contact's Cell Phone Number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`emergencyContacts.${i}.home_phone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Phone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>
                        Emergency Contact's Home Phone Number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`emergencyContacts.${i}.work_phone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Phone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>
                        Emergency Contact's Work Phone Number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        <Button type="submit" className="w-full sm:w-[10vw]">
          Submit
        </Button>
      </form>
    </Form>
  );
}
