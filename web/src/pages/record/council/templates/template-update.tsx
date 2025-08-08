import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from '@/components/ui/textarea';
import { TextareaTab } from "@/components/ui/textarea-tab";
import { FormInput } from "@/components/ui/form/form-input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import { FormSelect } from "@/components/ui/form/form-select";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { getTextareaWidth } from "./width";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema";
import TemplatePreview from "./template-preview";
import { useUpdateTemplate } from "./queries/template-UpdateQueries";
import { useGetPurposeRates } from "./queries/template-FetchQueries";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";


interface TemplateUpdateFormProps{
    temp_id: number;
    temp_header: string;
    temp_below_headerContent: string;
    temp_title: string;
    temp_subtitle: string;
    temp_paperSize: string;
    temp_margin: string;
    temp_filename: string;
    temp_w_sign: boolean;
    temp_w_seal: boolean;
    temp_w_summon: boolean;
    temp_body: string;
    pr_id: number;
    onSuccess?: () => void;
    onClose?: () => void; 
}



function TemplateUpdateForm({ 
    temp_id, 
    temp_header, 
    temp_below_headerContent, 
    temp_title, 
    temp_subtitle, 
    temp_paperSize,  
    temp_margin,
    temp_filename,
    temp_w_sign,
    temp_w_seal,
    temp_w_summon,
    temp_body,
    pr_id,
    onSuccess,
    onClose 
  } : TemplateUpdateFormProps) {

  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [_isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [_formValues, setFormValues] = useState<z.infer<typeof documentTemplateFormSchema>>();


  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => {
    // Initialize with existing image if available
    if (temp_header && temp_header !== 'no-image-url-fetched') {
      return [{
        id: `header-${temp_id}`,
        type: "image" as const,
        file: new File([], `header-${temp_id}.jpg`), // Dummy file
        publicUrl: temp_header,
        status: "uploaded" as const,
        previewUrl: temp_header,
        storagePath: ""
      }];
    }
    return [];
  });

  const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
    resolver: zodResolver(documentTemplateFormSchema),
    defaultValues: {
      temp_header: temp_header,
      temp_below_headerContent: temp_below_headerContent,
      temp_title: temp_title,
      temp_subtitle: temp_subtitle,
      temp_paperSize: temp_paperSize,
      temp_margin: temp_margin,
      temp_filename: temp_filename,
      temp_w_sign: temp_w_sign,
      temp_w_seal: temp_w_seal,
      temp_w_summon: temp_w_summon,
      temp_body: temp_body,
      selectedPurposeRates: [String(pr_id)]
    },
  });


  const isSummonChecked = form.watch('temp_w_summon');

  useEffect(() => {
    if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
      form.setValue('temp_header', mediaFiles[0].publicUrl);
    } else {
      form.setValue('temp_header', 'no-image-url-fetched');
    }
  }, [mediaFiles, form]);


  // const { mutate: updateTemplateRecord } = useUpdateTemplate(temp_id, onSuccess);

  //Update mutation
  const { mutate: updateTemplateRecord } = useUpdateTemplate(temp_id, () => {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
  });

  //Fetch mutation
  const { data: purposeRatesList = [] } = useGetPurposeRates();

  const purposeRatesOptions = purposeRatesList.filter(purpose => purpose.pr_is_archive == false).map(purpose => ({
      id: String(purpose.pr_id),  
      name: purpose.pr_purpose 
  }));


  function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
    form.clearErrors("selectedPurposeRates");

    console.log("LENGTH: ", values.selectedPurposeRates.length)
    if (values.selectedPurposeRates.length !== 1) {
      setTimeout(() => {
        form.setError("selectedPurposeRates", {
          type: "manual",
          message: "Please select exactly one purpose",
        });
      }, 0);
      return;
    }

    const selectedId = values.selectedPurposeRates[0];
    const selectedPurpose = purposeRatesOptions.find(p => p.id === selectedId);

    const updatedValues = {
      ...values,
      temp_filename: selectedPurpose?.name || values.temp_filename,
      pr_id: Number(selectedId),
    };

    updateTemplateRecord(updatedValues);
    console.log("VALUESSSS UPDATED: ", updatedValues)
  }


  const handleSaveClick = () => {
      setFormValues(form.getValues()); // Store current form values
      setIsConfirmOpen(true); // Open confirmation modal
  };

  const handleConfirmSave = () => {
      setIsConfirmOpen(false); // Close confirmation modal
      form.handleSubmit(onSubmit)(); // Call the submit function
  };


  return (
    <>
        <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

              {/*Purpose and Rates field*/}
                  <FormComboCheckbox
                    control={form.control}
                    name="selectedPurposeRates"
                    label="Select Purpose"
                    options={purposeRatesOptions}
                  />

                 {/* Filename field*/}               
                {/* <FormInput
                  className="hidden"
                  control={form.control}
                  name="temp_filename"
                  label="Filename"
                  placeholder="Enter Filename"
                  readOnly={false}
                />                 */}
                            
                {/* Header + Footer Container */}
                <div className="flex flex-row gap-10 items-stretch">
                  {/* Document Header */}
                  <div className="flex flex-col gap-2 w-3/5">
                    <Label className="mb-1">Document Header</Label>
                    <MediaUpload
                      title=""
                      description=""
                      mediaFiles={mediaFiles}
                      activeVideoId={activeVideoId}
                      setMediaFiles={setMediaFiles}
                      setActiveVideoId={setActiveVideoId}
                    />
                  </div>                  

                  {/* Document Footer */}
                  <div className="flex flex-col gap-2 h-80%">
                      <Label className="mb-1">Document Footer</Label>
                      <div className="flex flex-col gap-5 p-4 border border-gray-300 rounded-md h-full justify-center">
                        <FormField
                            control={form.control}
                            name="temp_w_seal"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                      id="w_seal"
                                      checked={!!field.value}
                                      onCheckedChange={(checked) => field.onChange(checked)}
                                      disabled={isSummonChecked}
                                  />
                                </FormControl>
                                <FormLabel htmlFor="w_seal" className="leading-none">
                                  With Seal
                                </FormLabel>
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="temp_w_sign"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                      id="w_sign"
                                      checked={!!field.value}
                                      onCheckedChange={(checked) => field.onChange(checked)}
                                      disabled={isSummonChecked}
                                  />
                                </FormControl>
                                <FormLabel htmlFor="w_sign" className="leading-none">
                                  With Applicant Signature
                                </FormLabel>
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="temp_w_summon"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                      id="w_summon"
                                      checked={!!field.value}
                                      onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      // If summon is checked, uncheck the other two
                                      if (checked) {
                                        form.setValue('temp_w_seal', false);
                                        form.setValue('temp_w_sign', false);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel htmlFor="w_summon" className="leading-none">
                                  With Summon details
                                </FormLabel>
                            </FormItem>
                            )}
                        />
                      
                      </div>
                  </div>
                </div>


                <FormField
                  control={form.control}
                  name="temp_below_headerContent"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Additional Details</FormLabel>
                      <FormControl>
                        <TextareaTab
                          className="p-2 shadow-sm h-44 mt-[12px] rounded-[5px] resize-none"
                          style={{ 
                            width: `${getTextareaWidth(form.watch('temp_paperSize'), form.watch('temp_margin'))}px`,
                            fontFamily: form.watch('temp_w_summon') ? 'VeraMono' : 'Times New Roman',
                            fontSize: '10pt' 
                          }}
                          placeholder="Enter additional details above the title"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              const start = e.currentTarget.selectionStart;
                              const end = e.currentTarget.selectionEnd;
                              const value = field.value;
                              field.onChange(value.substring(0, start) + '    ' + value.substring(end));
                              setTimeout(() => {
                                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                              }, 0);
                            }
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />

                {/* Title and Paper Size in same row */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row gap-2">
                    <div className="flex-1">
                      <FormInput
                        control={form.control}
                        name="temp_title"
                        label="Title"
                        placeholder="Enter Template Title"
                        readOnly={false}
                      />
                    </div>

                    <div className="flex-1">
                      <FormSelect
                        control={form.control}
                        name="temp_paperSize"
                        label="Paper Size"
                        options={[
                          { id: "a4", name: "A4" },
                          { id: "letter", name: "Letter" },
                          { id: "legal", name: "Legal" },
                        ]}
                        readOnly={false}
                      />
                    </div>
                  </div>
                  

                  <div className="flex flex-row gap-2">
                    <div className="flex-1">
                      <FormInput
                        control={form.control}
                        name="temp_subtitle"
                        label="Subtitle"
                        placeholder="Enter Subtitle (optional)"
                        readOnly={false}
                      />
                    </div>
                    <div className="flex-1">
                      <FormSelect
                        control={form.control}
                        name="temp_margin"
                        label="Margin"
                        options={[
                          { id: "normal", name: "Normal" },
                          { id: "narrow", name: "Narrow" },
                        ]}
                        readOnly={false}
                      />
                    </div>
                  </div>
                </div>


                {/* Template Body */}
                <FormField
                  control={form.control}
                  name="temp_body"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Template Body</FormLabel>
                      <FormControl>
                          <TextareaTab
                            className="p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
                            style={{ 
                              width: `${getTextareaWidth(form.watch('temp_paperSize'), form.watch('temp_margin'))}px`,
                              fontFamily: form.watch('temp_w_summon') ? 'VeraMono' : 'Times New Roman',
                              fontSize: '10pt' 
                            }}
                            placeholder="Enter body"
                            onKeyDown={(e) => {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                const start = e.currentTarget.selectionStart;
                                const end = e.currentTarget.selectionEnd;
                                const value = field.value;
                                field.onChange(value.substring(0, start) + '    ' + value.substring(end));
                                setTimeout(() => {
                                  e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                                }, 0);
                              }
                            }}
                            {...field}
                          />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />

                {/* Buttons */}
                <div className="flex justify-end pb-6 pt-6 gap-2">
                <DialogLayout
                  trigger={
                    <Button variant="outline" className="flex items-center gap-2">
                      Preview
                    </Button>
                  }
                  className="max-w-full h-full flex flex-col overflow-auto scrollbar-custom"
                  title=""
                  description=""
                  mainContent={
                    <div className="w-full h-full">
                      <TemplatePreview
                        headerImage={form.watch('temp_header')}
                        belowHeaderContent={form.watch('temp_below_headerContent')}
                        title={form.watch('temp_title')}
                        subtitle={form.watch('temp_subtitle')}
                        body={form.watch('temp_body')}
                        withSeal={form.watch('temp_w_seal')}
                        withSignature={form.watch('temp_w_sign')}
                        withSummon={form.watch('temp_w_summon')} 
                        paperSize={form.watch('temp_paperSize')} 
                        margin={form.watch('temp_margin')}
                      />
                    </div>
                  }
                />
                {/* <Button className="flex items-center gap-2">Save</Button> */}
                  <ConfirmationModal
                      trigger={
                          <Button onClick={handleSaveClick}>Save</Button>
                      }
                      title="Confirm Save"
                      description="Are you sure you want to save the changes?"
                      actionLabel="Confirm"
                      onClick={handleConfirmSave} // This will be called when the user confirms
                  />  
                </div>
            </form>
            </Form>
        </div>
    </>  
  );
}

export default TemplateUpdateForm;