import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import addImage from "/src/assets/images/addimage.png";
import { announcementFormSchema } from "../../form-schema/AnnouncementSchema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const options = {
  modes: ["ALL", "SMS", "EMAIL", "APP"],
  recipients: ["STAFF", "RESIDENTS"],
};

export default function CreateAnnouncement() {
  const form = useForm({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: { header: "", details: "", image: "", modes: [], recipients: [] },
  });

  return (
    <div className="max-w-[600px] mx-auto p-4 mb-4">
      <h2 className="font-bold text-[#263D67] text-2xl mb-4 text-center">Create Announcement</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => console.log("Announcement Data:", data))} className="space-y-4 flex flex-col">
          <FormField control={form.control} name="header" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-sm">Announcement Header</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Header" className="border-[#2e2e2e] p-2 rounded-md w-full text-sm h-12" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="details" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-sm">Announcement Details</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Announcement details..." className="border border-[#2e2e2e] p-2 rounded-md w-full text-sm h-48" maxLength={200} onChange={(e) => field.onChange(e.target.value.slice(0, 200))} />
              </FormControl>
              <FormMessage />
              <p className="text-right text-gray-500 text-xs mt-1">{field.value.length}/200</p>
            </FormItem>
          )} />

          <FormField control={form.control} name="image" render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-sm">Add Image</FormLabel>
              <div className="w-full border border-[#2e2e2e] p-2 rounded-md h-48 flex items-center justify-center cursor-pointer relative bg-white">
                {field.value ? <img src={field.value} alt="Preview" className="h-full w-full object-cover" /> : (
                  <div className="flex flex-col items-center justify-center">
                    <img src={addImage} alt="Upload" className="w-10 h-10" />
                    <p className="text-gray-500 text-xs">Upload Image</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : "")} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <FormMessage />
            </FormItem>
          )} />

          {Object.entries(options).map(([key, values]) => (
            <FormField key={key} control={form.control} name={key as "modes" | "recipients"} render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-sm">{key.toUpperCase()}</FormLabel>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {values.map((value) => (
                    <label key={value} className="flex items-center space-x-1 border border-[#cccbcb] p-2 rounded-md text-sm w-full">
                      <Checkbox checked={field.value.includes(value)} onCheckedChange={(checked) => field.onChange(checked ? [...field.value, value] : field.value.filter((v: string) => v !== value))} />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />
          ))}

          <div className="mt-4 flex justify-end">
            <Button type="submit" className="text-sm px-6 py-2">POST</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
