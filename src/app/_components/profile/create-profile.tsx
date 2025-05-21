"use client";

import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { ProfileForm } from "./profile-form";
import { formSchema } from "../schema";

export default function CreateProfile() {
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "",
      birthDate: "",
      relationship: "",
      heartLevel: 1,
      race: "",
      country: "",
      language: "",
    },
  });

  const createChatMutation = api.chat.createChat.useMutation({
    onSuccess: (data) => {
      toast.success(`Profile for ${data.name} created successfully!`);
      void utils.chat.getAllChatHeaders.invalidate();
      router.push(`/chats/${data.id}`);
    },
    onError: () => {
      toast.error(`Failed to create profile!`);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Removes empty values and replaces them with undefined
    const cleanedValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) =>
        value !== "" ? [key, value] : [key, undefined],
      ),
    ) as z.infer<typeof formSchema>;

    createChatMutation.mutate({
      chatHeader: values.name,
      ...cleanedValues,
    });
  }

  return (
    <div className="mx-auto mt-16 max-w-3xl p-4">
      <ProfileForm
        form={form}
        handleSubmit={onSubmit}
        submitLabel="Create Profile"
      />
    </div>
  );
}
