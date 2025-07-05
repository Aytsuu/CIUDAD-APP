import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { postComplaint } from "./restful-api/complaint-api";
import { toast } from "sonner";
import { MediaUpload } from "@/components/ui/media-upload";
import { MediaFile } from "./complaint-type";
import { useMutation } from "@tanstack/react-query";
import { FormInput } from "@/components/ui/form/form-input";
import { Plus, Users, X, User2, AlertTriangle, FolderOpen, FileText, Calendar, MapPin, Send, UserCog2Icon} from "lucide-react";
import { User } from "@/context/auth-types";

// Form-specific interfaces
interface FormAddress {
  street: string;
  barangay: string;
  city: string;
  province: string;
}

interface FormComplainant {
  lastname: string;
  firstname: string;
  middlename: string;
  suffix: string;
  address: FormAddress;
}

interface FormAccused {
  id: string;
  lastname: string;
  firstname: string;
  middlename: string;
  suffix: string;
  address: FormAddress;
}

interface FormValues {
  complainant: FormComplainant;
  incident_type: string;
  other_incident_type?: string;
  comp_category?: string;
  datetime: string;
  allegation: string;
}

// Constants
const INCIDENT_TYPES = [
  { id: "Theft", name: "Theft" },
  { id: "Assault", name: "Assault" },
  { id: "Noise Complaint", name: "Noise Complaint" },
  { id: "Property Damage", name: "Property Damage" },
  { id: "Other", name: "Other" },
] as const;

const EMPTY_ADDRESS: FormAddress = {
  street: "",
  barangay: "",
  city: "",
  province: ""
};

const EMPTY_COMPLAINANT: FormComplainant = {
  lastname: "",
  firstname: "",
  middlename: "",
  suffix: "",
  address: { ...EMPTY_ADDRESS }
};

const DEFAULT_FORM_VALUES: FormValues = {
  complainant: { ...EMPTY_COMPLAINANT },
  incident_type: "",
  datetime: "",
  allegation: ""
};

// Helper functions
const createEmptyAccused = (): FormAccused => ({
  id: crypto.randomUUID(),
  lastname: "",
  firstname: "",
  middlename: "",
  suffix: "",
  address: { ...EMPTY_ADDRESS }
});

const formatPersonName = (person: { firstname: string; lastname: string }) => 
  `${person.firstname} ${person.lastname}`.trim();

// Custom hooks
const useAccusedPersons = () => {
  const [accusedPersons, setAccusedPersons] = useState<FormAccused[]>([createEmptyAccused()]);
  const [activeTab, setActiveTab] = useState(0);

  const addPerson = useCallback(() => {
    setAccusedPersons(prev => [...prev, createEmptyAccused()]);
    setActiveTab(accusedPersons.length);
  }, [accusedPersons.length]);

  const removePerson = useCallback((index: number) => {
    if (accusedPersons.length <= 1) return;
    
    setAccusedPersons(prev => prev.filter((_, i) => i !== index));
    setActiveTab(prev => Math.min(prev, accusedPersons.length - 2));
  }, [accusedPersons.length]);

  const updatePerson = useCallback((index: number, field: string, value: string) => {
    setAccusedPersons(prev => {
      const updated = [...prev];
      const fieldPath = field.split('.');
      
      if (fieldPath.length === 1) {
        updated[index] = { ...updated[index], [fieldPath[0]]: value };
      } else if (fieldPath[0] === 'address') {
        updated[index] = {
          ...updated[index],
          address: { ...updated[index].address, [fieldPath[1]]: value }
        };
      }
      
      return updated;
    });
  }, []);

  return {
    accusedPersons,
    activeTab,
    setActiveTab,
    addPerson,
    removePerson,
    updatePerson
  };
};

// Memoized components
const ComplainantSection = ({ form }: { form: any }) => (
  <div className="border rounded-md p-4 bg-white shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <User2 className="w-5 h-5 text-darkBlue2" />
      <h3 className="font-medium text-lg text-darkBlue2">Complainant Information</h3>
    </div>
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormInput control={form.control} name="complainant.lastname" label="Last Name" placeholder="Enter last name"/>
        <FormInput control={form.control} name="complainant.firstname" label="First Name" placeholder="Enter first name"/>
        <FormInput control={form.control} name="complainant.middlename" label="Middle Name" placeholder="Enter middle name"/>
        <FormInput control={form.control} name="complainant.suffix" label="Suffix" placeholder="Jr., Sr., etc."/>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-darkGray" />
          <label className="text-sm font-medium text-darkGray">Address Information</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormInput control={form.control} name="complainant.address.street" label="Street/House No." placeholder="Enter street address"
          />
          <FormInput control={form.control} name="complainant.address.barangay" label="Barangay" placeholder="Enter barangay"/>
          <FormInput control={form.control} name="complainant.address.city" label="City/Municipality" placeholder="Enter city"
          />
          <FormInput control={form.control} name="complainant.address.province" label="Province" placeholder="Enter province"/>
        </div>
      </div>
    </div>
  </div>
);

const AccusedPersonTab = ({ person, index, isActive, canRemove, onClick, onRemove }: {
  person: FormAccused;
  index: number;
  isActive: boolean;
  canRemove: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
}) => (
  <div
    className={`p-3 border-b cursor-pointer flex items-center justify-between transition-colors ${
      isActive 
        ? "bg-blue-50 border-blue-200 text-blue-700" 
        : "hover:bg-gray-50 text-gray-700"
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-2">
      <User2 className="w-4 h-4" />
      <span className="font-medium">Person {index + 1}</span>
    </div>
    {canRemove && (
      <button
        type="button"
        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
        onClick={onRemove}
        title="Remove person"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

const AccusedPersonForm = ({  person,  index,  total, onUpdate }: {
  person: FormAccused;
  index: number;
  total: number;
  onUpdate: (field: string, value: string) => void;
}) => (
  <div className="space-y-4">
    <div className="border-b pb-2">
      <h4 className="text-lg font-medium text-darkBlue2 flex items-center gap-2">
        <UserCog2Icon className="w-4 h-4" />
        {total > 1 ? `Person ${index + 1} Details` : "Accused Person Details"}
      </h4>
      <p className="text-sm text-gray-600 mt-1">
        Enter the complete information of the accused person
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="text-sm font-medium text-darkGray mb-1 block">Last Name *</label>
        <Input value={person.lastname} onChange={(e) => onUpdate('lastname', e.target.value)} placeholder="Enter last name" className="w-full"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-darkGray mb-1 block">First Name *</label>
        <Input value={person.firstname} onChange={(e) => onUpdate('firstname', e.target.value)} placeholder="Enter first name" className="w-full"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-darkGray mb-1 block">Middle Name</label>
        <Input value={person.middlename} onChange={(e) => onUpdate('middlename', e.target.value)} placeholder="Enter middle name" className="w-full" />
      </div>
      <div>
        <label className="text-sm font-medium text-darkGray mb-1 block">Suffix</label>
        <Input
          value={person.suffix}
          onChange={(e) => onUpdate('suffix', e.target.value)}
          placeholder="Jr., Sr., etc."
          className="w-full"
        />
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <MapPin className="w-4 h-4 text-darkGray" />
        <label className="text-sm font-medium text-darkGray">Address Information</label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-darkGray mb-1 block">Street/House No.</label>
          <Input
            value={person.address.street}
            onChange={(e) => onUpdate('address.street', e.target.value)}
            placeholder="Enter street address"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-darkGray mb-1 block">Barangay *</label>
          <Input
            value={person.address.barangay}
            onChange={(e) => onUpdate('address.barangay', e.target.value)}
            placeholder="Enter barangay"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-darkGray mb-1 block">City/Municipality *</label>
          <Input
            value={person.address.city}
            onChange={(e) => onUpdate('address.city', e.target.value)}
            placeholder="Enter city"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-darkGray mb-1 block">Province *</label>
          <Input
            value={person.address.province}
            onChange={(e) => onUpdate('address.province', e.target.value)}
            placeholder="Enter province"
            className="w-full"
          />
        </div>
      </div>
    </div>
  </div>
);

const IncidentDetailsSection = ({ form }: { form: any }) => {
  const incidentType = form.watch("incident_type");
  const showOtherInput = incidentType === "Other";

  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-darkBlue2" />
        <h2 className="font-medium text-lg text-darkBlue2">Incident Details</h2>
      </div>
      <div className="space-y-4">
        {/* Incident Type & Other Input Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Incident Type Field (takes full width if alone, half if with "Other") */}
          <div className={showOtherInput ? "" : "md:col-span-2"}>
            <FormField
              control={form.control}
              name="incident_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-darkGray">Incident Type *</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label="Select Incident Type"
                      placeholder="Select Options"
                      options={Array.from(INCIDENT_TYPES)}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Other Incident Input (shown on same row when "Other" is selected) */}
          {showOtherInput && (
            <FormField
              control={form.control}
              name="other_incident_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-darkGray">
                    Please specify *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Describe the incident type"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Priority and Date/Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="comp_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-darkGray">Priority Level</FormLabel>
                <FormControl>
                  <SelectLayout
                    label="Set Importance"
                    placeholder="Select Options"
                    options={[
                      { id: "Low", name: "Low" },
                      { id: "Normal", name: "Normal" },
                      { id: "Urgent", name: "Urgent" },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="datetime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-darkGray flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date & Time of Incident *
                </FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field} 
                    className="w-52" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Incident Description (full width) */}
        <FormField
          control={form.control}
          name="allegation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-darkGray">Incident Description *</FormLabel>
              <FormControl>
                <textarea
                  className="w-full border rounded-md p-3 min-h-32 resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide a detailed description of what happened..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export function ComplaintReport() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const { 
    accusedPersons, 
    activeTab, 
    setActiveTab, 
    addPerson, 
    removePerson, 
    updatePerson 
  } = useAccusedPersons();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    defaultValues: DEFAULT_FORM_VALUES
  });

const transformedPayload = useMemo(() => {
  const complainantData = form.watch("complainant");
  const incidentType = form.watch("incident_type");
  const otherIncidentType = form.watch("other_incident_type");
  const compCategory = form.watch("comp_category");

  return {
    // Django view expects nested complainant object
    complainant: {
      name: formatPersonName(complainantData),
      address: {
        add_province: complainantData?.address?.province || '',
        add_city: complainantData?.address?.city || '',
        add_barangay: complainantData?.address?.barangay || '',
        add_street: complainantData?.address?.street || '',
        add_external_sitio: '',
        sitio: null
      }
    },
    // Django view expects accused array with nested structure
    accused: accusedPersons.map(person => ({
      name: formatPersonName(person),
      address: {
        add_province: person?.address?.province || '',
        add_city: person?.address?.city || '',
        add_barangay: person?.address?.barangay || '',
        add_street: person?.address?.street || '',
        add_external_sitio: '',
        sitio: null
      }
    })),
    incident_type: incidentType === "Other" ? (otherIncidentType || "") : (incidentType || ""),
    category: compCategory || '', 
    datetime: form.watch("datetime") || '',
    allegation: form.watch("allegation") || '',
    media_files: mediaFiles
      .filter(file => file.file)
      .map(file => file.file!)
  };
}, [form.watch(), accusedPersons, mediaFiles]);

  const postComplaintMutation = useMutation({
    mutationFn: () => postComplaint(transformedPayload),
    onSuccess: () => {
      toast.success("Complaint submitted successfully");
      navigate("/blotter-record");
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit report: ${error.message || "Unknown error"}`);
    },
  });

  const handleSubmit = useCallback(async (data: FormValues) => {
    try {
      await postComplaintMutation.mutateAsync();
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit report");
    }
  }, [postComplaintMutation]);

  const handleTabClick = useCallback((index: number) => {
    setActiveTab(index);
  }, [setActiveTab]);

  const handleRemoveClick = useCallback((index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    removePerson(index);
  }, [removePerson]);

  const handlePersonUpdate = useCallback((field: string, value: string) => {
    updatePerson(activeTab, field, value);
  }, [updatePerson, activeTab]);

  const currentAccused = accusedPersons[activeTab];

  return (
    <div className="w-full h-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex flex-row mb-4 sm:mb-0">
            <div className="flex items-center mr-4">
              <Button className="text-black p-2 self-start" variant="outline">
                <Link to="/blotter-record">
                  <BsChevronLeft />
                </Link>
              </Button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-darkBlue2" />
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                  Barangay Complaint Report
                </h1>
              </div>
              <p className="text-sm text-darkGray mt-1">
                Report individuals involved in conflicts, disturbances, or incidents needing barangay action.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 mb-8" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Complainant Section */}
            <ComplainantSection form={form} />

            {/* Accused Persons Section */}
            <div className="bg-white rounded-md border shadow-sm overflow-hidden">
              <div className="flex flex-row justify-between items-center p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-darkBlue2" />
                  <h3 className="font-medium text-lg text-darkBlue2">Accused Persons</h3>
                  <span className="text-sm text-gray-500">({accusedPersons.length})</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                  onClick={addPerson}
                >
                  <Plus className="h-4 w-4" />
                  Add Person
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[400px]">
                {/* Sidebar */}
                <div className="lg:col-span-1 border-r bg-gray-50">
                  <div className="max-h-96 overflow-y-auto">
                    {accusedPersons.map((person, idx) => (
                      <AccusedPersonTab
                        key={person.id}
                        person={person}
                        index={idx}
                        isActive={activeTab === idx}
                        canRemove={accusedPersons.length > 1}
                        onClick={() => handleTabClick(idx)}
                        onRemove={handleRemoveClick(idx)}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 p-6 bg-white">
                  {currentAccused && (
                    <AccusedPersonForm
                      person={currentAccused}
                      index={activeTab}
                      total={accusedPersons.length}
                      onUpdate={handlePersonUpdate}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Incident Details Section */}
            <IncidentDetailsSection form={form} />

            {/* Supporting Documents */}
            <div className="border rounded-md p-4 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="w-5 h-5 text-darkBlue2" />
                <h2 className="font-medium text-lg text-darkBlue2">Supporting Documents</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <MediaUpload title="Upload Evidence" description="Upload images, videos or documents related to the incident (Optional)"
                  mediaFiles={mediaFiles}
                  setMediaFiles={setMediaFiles}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Link to="/blotter-record">
                <Button type="button" variant="outline" className="px-6">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={postComplaintMutation.isPending}
                className="px-6 flex items-center gap-2"
              >
                {postComplaintMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}