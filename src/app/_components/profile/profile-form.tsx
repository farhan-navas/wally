import { type z } from "zod";
import { cn } from "~/lib/utils";
import { type useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";

import { type formSchema } from "../schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
  { label: "Malay", value: "ms" },
] as const;

type ProfileFormProps = {
  form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>;
  handleSubmit: (values: z.infer<typeof formSchema>) => void;
  submitLabel: string;
};

export function ProfileForm({
  form,
  handleSubmit,
  submitLabel,
}: ProfileFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-amberTheme-darker">
          Tell Me About Them
        </CardTitle>
        <CardDescription>
          Share a few details about who you’re chatting with: like their name,
          role, and more. The more I know, the more personalized my replies will
          be!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormDescription>Your partner&apos;s name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender field */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Your partner&apos;s gender</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birth Date field */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="your partner's birth date"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your partner&apos;s birth date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Relationship Field */}
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a relationship type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friendship">Friendship</SelectItem>
                      <SelectItem value="partner">Romantic Partner</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Your partner&apos;s relationship with you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Heart Level Field  */}
            <FormField
              control={form.control}
              name="heartLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heart Level</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a heart level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Your partner&apos;s heart level
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Race Field */}
            <FormField
              control={form.control}
              name="race"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Race</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a race" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="malay">Malay</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="eurasian">Eurasian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Your partner&apos;s race</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country Field */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="singapore">Singapore</SelectItem>
                      <SelectItem value="malaysia">Malaysia</SelectItem>
                      <SelectItem value="china">China</SelectItem>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Your partner&apos;s race</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language Field - small issue combobox is different color :(( */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-4">
                  <FormLabel>Language</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between rounded-md border px-3 py-2 text-left font-normal"
                        >
                          {field.value
                            ? languages.find(
                                (language) => language.value === field.value,
                              )?.label
                            : "Select language"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search language..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>Language not available.</CommandEmpty>
                          <CommandGroup>
                            {languages.map((language) => (
                              <CommandItem
                                value={language.label}
                                key={language.value}
                                onSelect={() => {
                                  form.setValue("language", language.value);
                                }}
                              >
                                {language.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    language.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Your partner&apos;s native language
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end sm:col-start-2">
              <Button type="submit" variant="main" className="w-1/2">
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
