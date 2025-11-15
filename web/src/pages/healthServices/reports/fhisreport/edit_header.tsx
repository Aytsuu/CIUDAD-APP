// components/edit-header-dialog.tsx
import { useState, useEffect } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Edit, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateHeaderReport } from "./queries/update";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/form/form-input";
import { z } from "zod";

export const HeaderReportSchema = z.object({
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  health_facility: z.string().min(1, "Health facility is required"),
});

export type HeaderReportType = z.infer<typeof HeaderReportSchema>;

interface EditHeaderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  headerData: any;
}

export function EditHeaderDialog({ isOpen, onClose, headerData }: EditHeaderDialogProps) {
  const { mutate: updateHeaderReport, isPending: isSubmitting } = useUpdateHeaderReport();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [hasLogoChanged, setHasLogoChanged] = useState(false);
  const [logoRemoved, setLogoRemoved] = useState(false);

  // Initialize form with react-hook-form and Zod schema
  const form = useForm<HeaderReportType>({
    resolver: zodResolver(HeaderReportSchema),
    defaultValues: {
      province: "",
      city: "",
      health_facility: "",
    },
    mode: "onChange",
  });

  // Auto-fill form with header data
  useEffect(() => {
    if (headerData) {
      form.reset({
        province: headerData.province || "",
        city: headerData.city || "",
        health_facility: headerData.health_facility || "",
      });

      // Set initial logo preview
      if (headerData.doh_logo) {
        setLogoPreview(headerData.doh_logo);
      }
    }
  }, [headerData, form]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setLogoFile(file);
      setHasLogoChanged(true);
      setLogoRemoved(false); // Reset remove flag when uploading new file

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);

      event.target.value = "";
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setHasLogoChanged(true);
    setLogoRemoved(true); // Set flag that logo was removed
  };

  const handleSubmit = async (data: HeaderReportType) => {
    if (!headerData?.rcpheader_id) {
      toast.error("Invalid header data");
      return;
    }

    const payload: any = {
      province: data.province,
      city: data.city,
      health_facility: data.health_facility,
    };

    // Only include logo data if it has actually changed
    if (hasLogoChanged) {
      if (logoFile && logoPreview) {
        // New logo uploaded
        payload.doh_logo = {
          file: logoPreview,
          name: logoFile.name,
          type: logoFile.type,
        };
      } else if (logoRemoved) {
        // Logo was removed - send empty string to clear it
        payload.doh_logo = "";
      }
    }
    // If hasLogoChanged is false, no logo data is sent to the backend

    console.log("Submitting payload:", payload); // Debug log

    updateHeaderReport(
      {
        rcpheader_id: headerData.rcpheader_id,
        data: payload,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <DialogLayout
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Edit Report Header"
      className="max-w-4xl"
      mainContent={
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload Section */}
              <div className="md:col-span-2">
                <Label className="block mb-3 font-semibold">Department Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg relative flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                    {logoPreview ? (
                      <div className="relative w-full h-full group">
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                            <label htmlFor="logo-upload" className="cursor-pointer">
                              <Button type="button" variant="secondary" size="sm" className="text-xs bg-white text-black hover:bg-gray-100" disabled={isSubmitting}>
                                Change
                              </Button>
                            </label>
                            <Button type="button" variant="destructive" size="sm" onClick={removeLogo} className="text-xs" disabled={isSubmitting}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="logo-upload" className="cursor-pointer w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Edit className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                          <span className="text-xs text-gray-500 block">Upload Logo</span>
                        </div>
                      </label>
                    )}
                    <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isSubmitting} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Upload your department logo. Recommended size: 100x100 pixels</p>
                    {!hasLogoChanged && <p className="text-xs text-blue-600 mt-1">Current logo will be preserved</p>}
                    {logoRemoved && <p className="text-xs text-orange-600 mt-1">Logo will be removed</p>}
                  </div>
                </div>
              </div>

              {/* Form Fields using FormInput */}
              <div className="space-y-4">
                <FormInput control={form.control} name="province" label="Province" placeholder="Enter province" />
                <FormInput control={form.control} name="city" label="City" placeholder="Enter city" />
              </div>

              <div className="space-y-4">
                <FormInput control={form.control} name="health_facility" label="Health Facility" placeholder="Enter health facility" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
           
              <Button type="submit" className="px-8 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      }
    />
  );
}