// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { ChevronLeft, Sparkles, Wand2, FileText } from 'lucide-react';
// import { Link, useSearchParams } from 'react-router';
// import { toast } from 'sonner';
// import { createTemplate, updateTemplate, getTemplateById } from './restful-api/TemplateAPI';
// import { uploadPDFToSupabase } from '@/services/supabaseStorage';
// import headerImage from '@/assets/images/SanRoqueHeader.png';

// interface TemplateData {
//     title: string;
//     templateBody: string;
//     withSeal: boolean;
//     withSignature: boolean;
//     headerMedia?: File;
// }

// interface AISuggestion {
//     title: string;
//     content: string;
//     type: 'barangay' | 'city' | 'municipal';
// }

// const AI_SUGGESTIONS: AISuggestion[] = [
//     {
//         title: "Barangay Tax Ordinance",
//         type: "barangay",
//         content: `BARANGAY ORDINANCE NO. [NUMBER] SERIES OF [YEAR]

// AN ORDINANCE ADOPTING THE OMNIBUS BARANGAY TAX ORDINANCE OF BARANGAY [BARANGAY_NAME] AND OTHER RELATED FEES IMPOSED FOR BARANGAY CLEARANCES, CERTIFICATIONS AND FOR SERVICES RENDERED.

// WHEREAS, Republic Act No. 7160, otherwise known as the Local Government Code of 1991, provides that the Sangguniang Barangay shall have the power to enact ordinances as may be necessary to discharge the responsibilities conferred upon it by law or ordinance and to promote the general welfare of the inhabitants therein;

// WHEREAS, Section 152 of RA 7160 provides that the Sangguniang Barangay may levy taxes, fees, and charges within its territorial jurisdiction;

// WHEREAS, the Barangay Council of [BARANGAY_NAME] deems it necessary to impose reasonable fees for services rendered and certifications issued;

// NOW THEREFORE, be it ordained by the Sangguniang Barangay of [BARANGAY_NAME], [CITY/MUNICIPALITY], [PROVINCE], in session assembled, that:

// SECTION 1. TITLE. This ordinance shall be known as the "OMNIBUS BARANGAY TAX ORDINANCE OF BARANGAY [BARANGAY_NAME]."

// SECTION 2. FEES AND CHARGES. The following fees shall be imposed:

// 1. Barangay Clearance - P [AMOUNT]
// 2. Barangay Certification - P [AMOUNT]
// 3. Business Permit - P [AMOUNT]
// 4. Birth Certificate - P [AMOUNT]
// 5. Medical Assistance - P [AMOUNT]

// SECTION 3. EFFECTIVITY. This ordinance shall take effect upon approval.`
//     },
//     {
//         title: "Municipal Celebration Ordinance",
//         type: "municipal",
//         content: `ORDINANCE NUMBER [NUMBER] SERIES OF [YEAR]

// AN ORDINANCE DECLARING [DATE] AND EVERY YEAR THEREAFTER AS THE [CELEBRATION_NAME] IN [LOCATION] AND PROVIDING FUNDS FOR THIS PURPOSE.

// WHEREAS, Proclamation Number [NUMBER] by President [PRESIDENT_NAME] ([DATE]) established [CELEBRATION_NAME] and encourages civic activities led by local leaders;

// WHEREAS, the Sangguniang [LEVEL] of [LOCATION] requested [DATE] to commemorate its institution and creation as per Presidential Decree Number [NUMBER] ([DATE]);

// WHEREAS, [LOCATION] as basic political units serve as effective agents of reform and vital forces in national development;

// WHEREAS, there is a need for nationwide awareness of [LOCATION] activities to highlight citizens' roles;

// WHEREAS, dedicating a day for citizens to commit to [LOCATION] ideals is fitting and proper;

// NOW THEREFORE, be it ordained by the Sangguniang [LEVEL] of [LOCATION], [PROVINCE], in session assembled, that:

// SECTION 1. DECLARATION. [DATE] and every year thereafter is hereby declared as [CELEBRATION_NAME] in [LOCATION].

// SECTION 2. ACTIVITIES. The celebration shall include civic activities, cultural presentations, and community service programs.

// SECTION 3. FUNDING. An amount of P [AMOUNT] is hereby appropriated for the celebration activities.

// SECTION 4. EFFECTIVITY. This ordinance shall take effect upon approval.`
//     },
//     {
//         title: "City Resolution Template",
//         type: "city",
//         content: `RESOLUTION NO. [NUMBER]-[NUMBER]-[YEAR]

// A RESOLUTION [ACTION_DESCRIPTION]

// WHEREAS, [LEGAL_BASIS] provides that [AUTHORITY_DESCRIPTION];

// WHEREAS, [CONTEXT_OR_BACKGROUND];

// WHEREAS, [JUSTIFICATION_OR_REASONING];

// WHEREAS, [ADDITIONAL_JUSTIFICATION_IF_NEEDED];

// NOW THEREFORE, be it resolved by the Sangguniang Panlungsod of [CITY_NAME], in session assembled, that:

// RESOLVED, to [PRIMARY_ACTION];

// RESOLVED FURTHER, to [SECONDARY_ACTION];

// RESOLVED FINALLY, that copies of this resolution be furnished to [RECIPIENTS] for their information and guidance.

// APPROVED this [DATE] at [LOCATION].`
//     }
// ];

function TemplateMaker() {
    // const [templateData, setTemplateData] = useState<TemplateData>({
    //     title: '',
    //     templateBody: '',
    //     withSeal: true, // Always include seal for official documents
    //     withSignature: false, // Remove signature requirement
    // });
    // const [isSubmitting, setIsSubmitting] = useState(false);
    // const [_headerMedia, setHeaderMedia] = useState<File | null>(null);
    // const [showAISuggestions, setShowAISuggestions] = useState(false);
    // const [_selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
    // const [_showPDFPreview, _setShowPDFPreview] = useState(false);

    // const [searchParams, _setSearchParams] = useSearchParams();
    // const templateId = searchParams.get('id');

    // useEffect(() => {
    //     const loadTemplate = async () => {
    //         if (templateId) {
    //             try {
    //                 const template = await getTemplateById(parseInt(templateId));
    //                 if (template) {
    //                     setTemplateData({
    //                         title: template.title,
    //                         templateBody: template.template_body,
    //                         withSeal: true, // Always include seal for official documents
    //                         withSignature: false, // Remove signature requirement
    //                         headerMedia: undefined
    //                     });
    //                 } else {
    //                     toast.error("Template not found.");
    //                     // Optionally redirect or show a message
    //                 }
    //             } catch (error) {
    //                 console.error("Error loading template:", error);
    //                 toast.error("Failed to load template. Please try again.");
    //             }
    //         }
    //     };
    //     loadTemplate();
    // }, [templateId]);

    // // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // //     const file = event.target.files?.[0];
    // //     if (file) {
    // //         setHeaderMedia(file);
    // //         setTemplateData(prev => ({ ...prev, headerMedia: file }));
    // //     }
    // // };

    // const handleAISuggestion = (suggestion: AISuggestion) => {
    //     setSelectedSuggestion(suggestion);
    //     setTemplateData(prev => ({
    //         ...prev,
    //         title: suggestion.title,
    //         templateBody: suggestion.content
    //     }));
    //     setShowAISuggestions(false);
    //     toast.success("AI template applied! Customize the content as needed.");
    // };

    // const handleSmartFill = () => {
    //     // Auto-fill common fields based on current date and context
    //     const currentYear = new Date().getFullYear();
    //     const currentDate = new Date().toLocaleDateString('en-US', {
    //         year: 'numeric',
    //         month: 'long',
    //         day: 'numeric'
    //     });

    //     const replacements: { [key: string]: string } = {
    //         '[YEAR]': currentYear.toString(),
    //         '[DATE]': currentDate,
    //         '[NUMBER]': '01',
    //         '[AMOUNT]': '150.00',
    //         '[BARANGAY_NAME]': 'Barangay',
    //         '[CITY/MUNICIPALITY]': 'City',
    //         '[PROVINCE]': 'Province',
    //         '[LOCATION]': 'Location',
    //         '[CELEBRATION_NAME]': 'Annual Celebration',
    //         '[LEVEL]': 'Barangay',
    //         '[CITY_NAME]': 'City',
    //         '[ACTION_DESCRIPTION]': 'Declaring Annual Celebration Day',
    //         '[LEGAL_BASIS]': 'Republic Act No. 7160',
    //         '[AUTHORITY_DESCRIPTION]': 'Local Government Code of 1991',
    //         '[CONTEXT_OR_BACKGROUND]': 'The community recognizes the importance of celebrating local heritage and culture',
    //         '[JUSTIFICATION_OR_REASONING]': 'It is necessary to establish an annual celebration to promote community unity',
    //         '[ADDITIONAL_JUSTIFICATION_IF_NEEDED]': 'This celebration will strengthen community bonds and cultural awareness',
    //         '[PRIMARY_ACTION]': 'Declare the annual celebration day',
    //         '[SECONDARY_ACTION]': 'Allocate funds for celebration activities',
    //         '[RECIPIENTS]': 'All concerned government agencies and community members',
    //         '[PRESIDENT_NAME]': 'President of the Philippines'
    //     };

    //     let smartContent = templateData.templateBody;
        
    //     // Replace all placeholders with actual values
    //     Object.entries(replacements).forEach(([placeholder, value]) => {
    //         const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    //         smartContent = smartContent.replace(regex, value);
    //     });

    //     setTemplateData(prev => ({
    //         ...prev,
    //         templateBody: smartContent
    //     }));
    //     toast.success("Smart fill applied! Review and customize the content.");
    // };

    // const handleGeneratePDF = async () => {
    //     if (!templateData.title.trim() || !templateData.templateBody.trim()) {
    //         toast.error("Please fill in the title and template body first");
    //         return;
    //     }

    //     try {
    //         // Generate PDF as Blob
    //         // const pdfBlob = await generateOrdinancePDFAsBlob(
    //         //     templateData,
    //         //     {
    //         //         ordinanceNumber: '01',
    //         //         category: 'Barangay',
    //         //         dateCreated: new Date().toLocaleDateString()
    //         //     }
    //         // );

    //         // Upload to Supabase
    //         const filename = `${templateData.title.replace(/\s+/g, '_')}.pdf`;
    //         const uploadResult = await uploadPDFToSupabase(pdfBlob, filename);

    //         if (uploadResult.success && uploadResult.url) {
    //             toast.success("PDF generated and uploaded to Supabase successfully!");
    //             console.log("PDF URL:", uploadResult.url);
    //         } else {
    //             toast.error("Failed to upload PDF to Supabase");
    //             console.error("Upload error:", uploadResult.error);
    //         }
    //     } catch (error) {
    //         console.error("Error generating PDF:", error);
    //         toast.error("Failed to generate PDF. Please try again.");
    //     }
    // };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
        
    //     if (!templateData.title.trim()) {
    //         toast.error("Template title is required");
    //         return;
    //     }
        
    //     if (!templateData.templateBody.trim()) {
    //         toast.error("Template body is required");
    //         return;
    //     }

    //     try {
    //         setIsSubmitting(true);
            
    //         // Generate PDF as Blob
    //         // const pdfBlob = await generateOrdinancePDFAsBlob(
    //         //     templateData,
    //         //     {
    //         //         ordinanceNumber: '01',
    //         //         category: 'Barangay',
    //         //         dateCreated: new Date().toLocaleDateString()
    //         //     }
    //         // );

    //         // Upload PDF to Supabase
    //         const filename = `${templateData.title.replace(/\s+/g, '_')}.pdf`;
    //         // const uploadResult = await uploadPDFToSupabase(pdfBlob, filename);

    //         if (!uploadResult.success) {
    //             toast.error("Failed to upload PDF to Supabase");
    //             return;
    //         }

    //         // Create FormData for template creation
    //         const formData = new FormData();
    //         formData.append('title', templateData.title);
    //         formData.append('template_body', templateData.templateBody);
    //         formData.append('with_seal', 'true'); // Always include seal for official documents
    //         formData.append('with_signature', 'false'); // Remove signature requirement
    //         formData.append('pdf_url', uploadResult.url || '');

    //         if (templateId) {
    //             await updateTemplate(parseInt(templateId), formData);
    //             toast.success("Template updated successfully!");
    //         } else {
    //             await createTemplate(formData);
    //             toast.success("Template created successfully!");
    //         }
            
    //         // TODO: Navigate to template list or close modal
            
    //     } catch (error) {
    //         console.error("Error creating template:", error);
    //         toast.error("Failed to create template. Please try again.");
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    // return (
    //     <div className="flex p-5 w-full mx-auto h-full justify-center">
    //         <div className="w-full max-w-6xl">
    //             <div className="text-[#394360] pb-2">
    //                 <Link to="/ord-page">
    //                     <Button 
    //                         className="text-black p-2 self-start"
    //                         variant={"outline"}
    //                     >
    //                         <ChevronLeft />
    //                     </Button>                        
    //                 </Link>
    //             </div>

    //             <div className="bg-white rounded-lg shadow-lg p-6">
    //                 <div className="flex justify-between items-center mb-6">
    //                     <div>
    //                         <h1 className="text-2xl font-bold text-gray-900">
    //                             {templateId ? 'Edit Ordinance Template' : 'Create New Template'}
    //                         </h1>
    //                         <p className="text-gray-600">Design and generate ordinance templates with AI assistance.</p>
    //                     </div>
    //                     <div className="flex gap-2">
    //                         <Button
    //                             onClick={() => setShowAISuggestions(!showAISuggestions)}
    //                             className="flex items-center gap-2"
    //                             variant="outline"
    //                         >
    //                             <Sparkles className="h-4 w-4" />
    //                             AI Templates
    //                         </Button>
    //                         <Button
    //                             onClick={handleSmartFill}
    //                             className="flex items-center gap-2"
    //                             variant="outline"
    //                         >
    //                             <Wand2 className="h-4 w-4" />
    //                             Smart Fill
    //                         </Button>
    //                         <Button
    //                             onClick={handleGeneratePDF}
    //                             className="flex items-center gap-2"
    //                             variant="outline"
    //                         >
    //                             <FileText className="h-4 w-4" />
    //                             Generate PDF
    //                         </Button>
    //                     </div>
    //                 </div>

    //                 {/* AI Suggestions Panel */}
    //                 {showAISuggestions && (
    //                     <div className="mb-6 p-4 bg-gray-50 rounded-lg">
    //                         <h3 className="font-semibold mb-3">AI-Powered Template Suggestions</h3>
    //                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    //                             {AI_SUGGESTIONS.map((suggestion, index) => (
    //                                 <div
    //                                     key={index}
    //                                     className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
    //                                     onClick={() => handleAISuggestion(suggestion)}
    //                                 >
    //                                     <div className="flex items-center gap-2 mb-2">
    //                                         <FileText className="h-4 w-4 text-blue-600" />
    //                                         <span className="font-medium text-sm">{suggestion.title}</span>
    //                                     </div>
    //                                     <p className="text-xs text-gray-600 capitalize">{suggestion.type} template</p>
    //                                 </div>
    //                             ))}
    //                         </div>
    //                     </div>
    //                 )}

    //                 <form onSubmit={handleSubmit} className="space-y-6">
    //                                              {/* Document Header - Official Letterhead */}
    //                      <div className="space-y-3">
    //                          <Label className="text-sm font-medium">Document Header</Label>
    //                          <div className="border-2 border-gray-300 rounded-lg p-6 bg-white">
    //                              <div className="flex items-center justify-center">
    //                                  {/* Header Image Preview */}
    //                                  <img 
    //                                      src={headerImage} 
    //                                      alt="Official Letterhead"
    //                                      className="max-w-full h-auto max-h-32 object-contain"
    //                                  />
    //                              </div>
                                 
    //                              <div className="mt-4 text-xs text-gray-500 text-center">
    //                                  Official letterhead will be automatically included in all generated ordinances
    //                              </div>
    //                          </div>
    //                      </div>

    //                     {/* Title */}
    //                     <div className="space-y-3">
    //                         <Label htmlFor="title" className="text-sm font-medium">Title</Label>
    //                         <Input
    //                             id="title"
    //                             placeholder="Enter template title"
    //                             value={templateData.title}
    //                             onChange={(e) => setTemplateData(prev => ({ ...prev, title: e.target.value }))}
    //                             className="w-full"
    //                         />
    //                     </div>

    //                     {/* Template Body */}
    //                     <div className="space-y-3">
    //                         <div className="flex justify-between items-center">
    //                             <Label htmlFor="template-body" className="text-sm font-medium">Template Body</Label>
    //                             <div className="text-xs text-gray-500">
    //                                 Use [PLACEHOLDER] for dynamic content
    //                             </div>
    //                         </div>
    //                         <Textarea
    //                             id="template-body"
    //                             placeholder="Enter template content... Use [PLACEHOLDER] for dynamic content that will be filled automatically."
    //                             value={templateData.templateBody}
    //                             onChange={(e) => setTemplateData(prev => ({ ...prev, templateBody: e.target.value }))}
    //                             className="w-full min-h-[300px] resize-none font-mono text-sm"
    //                         />
    //                     </div>

    //                     {/* Submit Button */}
    //                     <div className="flex justify-end pt-4">
    //                         <Button 
    //                             type="submit" 
    //                             className="w-[100px]"
    //                             disabled={isSubmitting}
    //                         >
    //                             {isSubmitting 
    //                                 ? (templateId ? "Updating..." : "Creating...") 
    //                                 : (templateId ? "Update" : "Create")
    //                             }
    //                         </Button>
    //                     </div>
    //                 </form>
    //             </div>
    //         </div>
    //     </div>
    // );
}

export default TemplateMaker; 