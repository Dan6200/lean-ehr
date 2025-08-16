"use client";
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
import { Minus, Plus } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import type { Nullable } from "@/types/resident";

interface ResidentFormBaseProps {
  form: ReturnType<typeof useForm<any>>;
  noOfEmContacts: number;
  setNoOfEmContacts: Dispatch<SetStateAction<number>>;
  onSubmit: (data: any) => Promise<void>;
  formTitle: string;
}

export function ResidentFormBase({
  form,
  noOfEmContacts,
  setNoOfEmContacts,
  onSubmit,
  formTitle,
}: ResidentFormBaseProps) {
  return (
    <Form {...form}>
      <h1 className="font-semibold mb-8 text-2xl ">
        {formTitle}
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