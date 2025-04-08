import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button/button";

// Define the messsage schema
const NotifyResidentSchema = z.object({
  messsage: z.string().nonempty("messsage is required"),
});

export default function NotifyResident() {
  type messsageSchemaType = z.infer<typeof NotifyResidentSchema>;

  // Form handling
  const form = useForm<messsageSchemaType>({
    resolver: zodResolver(NotifyResidentSchema),
    defaultValues: {
      messsage: "Kindly mark as received after receiving the requested medicine",
    },
  });

  // State for dialog and confirmation modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessfulModal, setShowSuccessfulModal] = useState(false);

  const saveData = async (data: messsageSchemaType) => {
    console.log("Form submitted", data);
    setShowSuccessfulModal(true);
    form.reset();
    setIsDialogOpen(false);
    setTimeout(() => {
      setShowSuccessfulModal(false);
    }, 800);
  };

  const handleConfirmationClose = () => {
    setShowConfirmationModal(false);
  };

  const handleSuccessfulShow = () => {
    // Submit the form data
    saveData(form.getValues());
    setShowConfirmationModal(false);
  };

  return (
    <>
      {/* Main Form Dialog */}
      <DialogLayout
        trigger={
            <div className="bg-white hover:bg-[#f3f2f2]  text-red-600 border border-red-700 px-4 py-2 rounded cursor-pointer">
       Notify
          </div>
        }
        className=""
        title="Notify Resident"
        description=""
        mainContent={
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(() => {
                  setShowConfirmationModal(true);
                  setIsDialogOpen(false);
                })}
                className="space-y-6"
              >
                {/* messsage Field */}
                <FormField
                  control={form.control}
                  name="messsage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={String(field.value)}
                          placeholder="Enter your messsage"
                          className="h-24 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                  <Button type="submit" className="w-[120px]">
                    Notify
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        }
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <DialogLayout
          trigger={<div />}
          isOpen={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
          mainContent={
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold">Confirmation</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to proceed?
              </p>
              <div className="flex  gap-2 justify-center">
                <Button
                  variant={"outline"}
                  onClick={handleConfirmationClose}
                  className="mt-6 w-[120px]"
                >
                  No
                </Button>
                <Button
                  onClick={handleSuccessfulShow}
                  className="mt-6 w-[120px]"
                >
                  Yes
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* Success Modal as a Div at the Top */}
      {showSuccessfulModal && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 transition-all duration-300 ease-out transform translate-y-0 opacity-100">
          <div className="bg-snow border border-blue p-6 rounded-lg text-center mx-auto">
            <h3 className="text-lg font-semibold">messsage Saved</h3>
            <p className="mt-2 text-gray-600">
              Your messsage has been successfully saved.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
