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
import { X } from "lucide-react";

// Image Modal Component
const ImageModal = ({ src, alt, isOpen, onClose }: {
  src: string,
  alt: string,
  isOpen: boolean,
  onClose: () => void
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close button - always visible */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-200"
        >
          <X size={20}/>
        </button>
        
        {/* Image container - fully responsive */}
        <div className="relative w-full h-full">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain bg-black/30 py-16"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};

// Media Gallery Component
const MediaGallery = ({ mediaFiles } : { mediaFiles: MediaUploadType}) => {
  const [selectedImage, setSelectedImage] = React.useState<MediaUploadType[number] | null>();

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
              onClick={() => setSelectedImage(media as any)}
            >
              <img 
                src={media.publicUrl} 
                alt={`Supporting document ${index + 1}`}
                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center truncate">
              Document {index + 1}
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
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
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
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
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
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Supporting Documents
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            {formType !== Type.Viewing 
              ? "Upload documents that verify your reported gross sales"
              : "Click on any image to view in full size"
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