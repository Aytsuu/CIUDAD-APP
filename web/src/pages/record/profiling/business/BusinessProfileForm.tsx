import React from "react";
import { z } from "zod";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Label } from "@/components/ui/label";
import { Control } from "react-hook-form";
import { businessFormSchema } from "@/form-schema/profiling-schema";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { renderActionButton } from "../profilingActionConfig";
import { Type } from "../profilingEnums";
import { ImageModal } from "@/components/image-modal";
import { ExternalLink, FileText, ImageIcon, ZoomIn } from "lucide-react";

// Media Gallery Component
const MediaGallery = ({ mediaFiles } : { mediaFiles: MediaUploadType}) => {
  const [selectedImage, setSelectedImage] = React.useState<MediaUploadType[number] | null>();

  const handleOpenDocument = (url: string) => { 
    // Open document in new tab
    window.open(url, '_blank');
  };

  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No supporting documents uploaded
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaFiles.map((media: any, index: any) => (
          <div key={index} className="group relative">
            <div
              className="relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => {
                if(media.type === 'document') handleOpenDocument(media.publicUrl)
                else setSelectedImage(media as any)
              }}
            >
              {media.type === 'document' ? (
                // Document preview
                <div className="w-full aspect-square bg-gray-100 flex flex-col items-center justify-center">
                  <FileText size={48} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-600 text-center px-2">
                    {media.name || `Document ${index + 1}`}
                  </span>
                  {media.fileExtension && (
                    <span className="text-xs text-gray-500 uppercase mt-1">
                      {media.fileExtension}
                    </span>
                  )}
                </div>
              ) : (
                // Image preview
                <img
                  src={media.publicUrl}
                  alt={`Supporting document ${index + 1}`}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              )}
              
              {/* Fallback for failed images */}
              {media.type !== 'document' && (
                <div className="w-full aspect-square bg-gray-100 flex flex-col items-center justify-center">
                  <ImageIcon size={48} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-600 text-center px-2">
                    Image preview unavailable
                  </span>
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {media.type === 'document' ? (
                    <ExternalLink size={40} className="text-white"/>
                  ) : (
                    <ZoomIn size={40} className="text-white"/>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mt-2 text-center truncate">
              {media.type === 'document' ? 
                (media.name || `Document ${index + 1}`) : 
                `Image ${index + 1}`
              }
            </p>
          </div>
        ))}
      </div>

      <ImageModal
        src={selectedImage?.publicUrl || ""}
        alt="Supporting document"
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};

export default function BusinessProfileForm({
  formType,
  sitio,
  control,
  isSubmitting,
  isReadOnly,
  mediaFiles,
  activeVideoId,
  setFormType,
  setMediaFiles,
  setActiveVideoId,
  submit
}: {
  formType: Type;
  sitio: any;
  control: Control<z.infer<typeof businessFormSchema>>;
  isSubmitting: boolean;
  isReadOnly: boolean;
  mediaFiles: MediaUploadType;
  activeVideoId: string;
  url: string;
  setFormType: React.Dispatch<React.SetStateAction<Type>>;
  setMediaFiles: React.Dispatch<React.SetStateAction<MediaUploadType>>;
  setActiveVideoId: React.Dispatch<React.SetStateAction<string>>;
  submit: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Respondent Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <Label className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            Respondent Information
          </Label>
          <p className="text-sm text-gray-600 mt-1">Please provide complete personal information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <FormInput control={control} name="bus_respondentLname" label="Last Name" placeholder="Enter last name" readOnly={isReadOnly} className="lg:col-span-1"/>
          <FormInput control={control} name="bus_respondentFname" label="First Name" placeholder="Enter first name" readOnly={isReadOnly} className="lg:col-span-1"/>
          <FormInput control={control} name="bus_respondentMname" label="Middle Name" placeholder="Enter middle name" readOnly={isReadOnly} className="lg:col-span-1"/>
          <FormSelect control={control} name="bus_respondentSex" label="Sex" options={[
              {id: "female", name: "Female"},
              {id: "male", name: "Male"}
            ]} 
            readOnly={isReadOnly}
          />
          <FormDateTimeInput control={control} name="bus_respondentDob" label="Date of Birth" type="date" readOnly={isReadOnly}/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          <FormInput control={control} name="bus_respondentContact" label="Contact Number" placeholder="Enter phone number" readOnly={isReadOnly}className="md:col-span-1"/>
          <FormInput control={control} name="bus_respondentAddress" label="Complete Address" placeholder="Enter complete address" readOnly={isReadOnly} className="md:col-span-4"/>
        </div>
      </div>

      {/* Business Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <Label className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            Business Information
          </Label>
          <p className="text-sm text-gray-600 mt-1">Provide details about your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormInput control={control} name="bus_name" label="Business Name" placeholder="Enter business name" readOnly={isReadOnly}className="lg:col-span-2"/>
          <FormInput control={control} name="bus_gross_sales" label="Gross Sales (₱)" placeholder="Enter gross sales" readOnly={isReadOnly}/>
          <FormSelect control={control} name="sitio" label="Sitio/Location" options={sitio} readOnly={isReadOnly}/>
          <FormInput control={control} name="bus_street" label="Street Address" placeholder="Enter street address" readOnly={isReadOnly}className="lg:col-span-4"/>
        </div>
      </div>

      {/* Supporting Documents Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <Label className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            Supporting Documents
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            {formType !== Type.Viewing 
              ? "Upload documents that verify your reported gross sales"
              : "Click on any file to get a full view"
            }
          </p>
        </div>

        {formType !== Type.Viewing ? (
          <MediaUpload
            title=""
            description="Acceptable files include: Official sales receipts or invoices, Bank statements showing business transactions, Tax returns, Business permits, etc."
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
            activeVideoId={activeVideoId}
            setActiveVideoId={setActiveVideoId}
          />
        ) : (
          <MediaGallery mediaFiles={mediaFiles} />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        {renderActionButton({
          formType,
          origin: 'defaultOrigin',
          isSubmitting,
          setFormType,
          submit  
        })}
      </div>
    </div>
  );
}