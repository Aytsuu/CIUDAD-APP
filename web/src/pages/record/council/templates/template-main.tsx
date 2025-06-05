// import { Link } from "react-router";
// import { useState } from "react";
// import { Button } from "@/components/ui/button/button";
// import { Plus } from "lucide-react";
// import CardLayout from "@/components/ui/card/card-layout";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import TemplateCreateForm from "./template-create";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useGetTemplateRecord } from "./queries/template-FetchQueries";


// function TemplateMainPage() {

//     const { data: templates = [], isLoading} = useGetTemplateRecord();

//     if (isLoading) {
//         return (
//             <div className="w-full h-full">
//               <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
//               <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
//               <Skeleton className="h-10 w-full mb-4 opacity-30" />
//               <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
//             </div>
//         );
//     }

//     return (
//         <div className="w-full h-full">
//             <div className="flex flex-col mb-4">
//                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Document Templates</h1>
//                 <p className="text-xs sm:text-sm text-darkGray">Manage and view document templates</p>
//             </div>
//             <hr className="border-gray mb-6 sm:mb-10" />

//             {/* Create Button */}
//             <div className="w-full flex justify-end pb-7">
//                 <DialogLayout
//                     trigger={
//                         <Button>
//                             <Plus size={20} /> Create Template
//                         </Button>
//                     }
//                     className="max-w-[60%] h-[90%] flex flex-col overflow-auto scrollbar-custom"
//                     title="Create New Template"
//                     description="Add new certification template."
//                     mainContent={
//                         <div className="w-full h-full">
//                             <TemplateCreateForm/>
//                         </div>
//                     }
//                 />
//             </div>

//             {/* Document Cards */}
//             {templates.length > 0 ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//                     {templates.map((template) => (
//                         <CardLayout
//                             key={template.temp_id}
//                             title=""
//                             description=""
//                             contentClassName="p-0"
//                             content={
//                                 <div className="relative h-40 w-full flex items-center justify-center rounded-xl overflow-hidden">
//                                 {/* Background */}
//                                 <div className="absolute inset-0 bg-gray-100" />

//                                 {/* Icon or Preview Placeholder */}
//                                 <div className="z-10 text-gray-400 text-4xl">
//                                     <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//                                     <polyline points="14 2 14 8 20 8" />
//                                     </svg>
//                                 </div>

//                                 {/* Bottom filename bar */}
//                                 <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-xs sm:text-sm text-center py-1 px-2 z-20">
//                                     {template.temp_filename}
//                                 </div>
//                                 </div>
//                             }
//                             cardClassName="p-0 shadow hover:shadow-lg transition-shadow rounded-xl"
//                         />
//                     ))}
//                 </div>
//             ) : (
//                 <div className="p-6 text-center text-gray-500">
//                     No templates available
//                 </div>
//             )}
//         </div>
//     );
// }

// export default TemplateMainPage;





//LATEST BEFORE TRASH ICON (DELETE)
// import { Link } from "react-router";
// import { useState } from "react";
// import { Button } from "@/components/ui/button/button";
// import { Plus } from "lucide-react";
// import CardLayout from "@/components/ui/card/card-layout";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import TemplateCreateForm from "./template-create";
// import TemplatePreview from "./template-preview";
// import TemplateUpdateForm from "./template-update";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useGetTemplateRecord, type TemplateRecord } from "./queries/template-FetchQueries";


// function TemplateMainPage() {

//     const [isDialogOpen, setIsDialogOpen] = useState(false); 
//     const { data: templates = [], isLoading} = useGetTemplateRecord();
//     const [previewTemplate, setPreviewTemplate] = useState<TemplateRecord | null>(null);


//     if (isLoading) {
//         return (
//             <div className="w-full h-full">
//               <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
//               <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
//               <Skeleton className="h-10 w-full mb-4 opacity-30" />
//               <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
//             </div>
//         );
//     }

//     return (
//         <div className="w-full h-full">
//             <div className="flex flex-col mb-4">
//                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Document Templates</h1>
//                 <p className="text-xs sm:text-sm text-darkGray">Manage and view document templates</p>
//             </div>
//             <hr className="border-gray mb-6 sm:mb-10" />

//             {/* Create Button */}
//             <div className="w-full flex justify-end pb-7">
//                 <DialogLayout
//                     trigger={
//                         <Button>
//                             <Plus size={20} /> Create Template
//                         </Button>
//                     }
//                     className="max-w-[60%] h-[90%] flex flex-col overflow-auto scrollbar-custom"
//                     title="Create New Template"
//                     description="Add new certification template."
//                     mainContent={
//                         <div className="w-full h-full">
//                             <TemplateCreateForm onSuccess={() => setIsDialogOpen(false)}/>
//                         </div>
//                     }
//                     isOpen={isDialogOpen}
//                     onOpenChange={setIsDialogOpen}
//                 />
//             </div>

//             {/* Document Cards */}
//             {templates.length > 0 ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//                 {templates.map((template) => (
//                     <div 
//                     key={template.temp_id} 
//                     onClick={() => setPreviewTemplate(template)}
//                     className="cursor-pointer"
//                     >
//                     <CardLayout
//                         title=""
//                         description=""
//                         contentClassName="p-0"
//                         content={
//                         <div className="relative h-40 w-full flex items-center justify-center rounded-xl overflow-hidden">
//                             {/* Background */}
//                             <div className="absolute inset-0 bg-gray-100" />

//                             {/* Icon or Preview Placeholder */}
//                             <div className="z-10 text-gray-400 text-4xl">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//                                 <polyline points="14 2 14 8 20 8" />
//                             </svg>
//                             </div>

//                             {/* Bottom filename bar */}
//                             <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-xs sm:text-sm text-center py-1 px-2 z-20">
//                             {template.temp_filename}
//                             </div>
//                         </div>
//                         }
//                         cardClassName="p-0 shadow hover:shadow-lg transition-shadow rounded-xl"
//                     />
//                     </div>
//                 ))}
//                 </div>
//             ) : (
//                 <div className="p-6 text-center text-gray-500">
//                 No templates available
//                 </div>
//             )}

//             {/* Template Preview Dialog */}
//             {previewTemplate && (
//                 <DialogLayout
//                     isOpen={!!previewTemplate}
//                     onOpenChange={(open) => !open && setPreviewTemplate(null)}
//                     className="max-w-[60%] h-[90%] flex flex-col overflow-auto scrollbar-custom"
//                     title={previewTemplate.temp_filename}
//                     description="View and update document template"
//                     mainContent={
//                         <div className="w-full h-full">
//                             {/* <TemplatePreview
//                                 headerImage={previewTemplate.temp_header}
//                                 belowHeaderContent={previewTemplate.temp_below_headerContent}
//                                 title={previewTemplate.temp_title}
//                                 subtitle={previewTemplate.temp_subtitle}
//                                 body={previewTemplate.temp_body}
//                                 withSeal={previewTemplate.temp_w_seal}
//                                 withSignature={previewTemplate.temp_w_sign}
//                                 withSummon={previewTemplate.temp_w_summon}
//                                 paperSize={previewTemplate.temp_paperSize}
//                                 margin={previewTemplate.temp_margin}
//                             /> */}
//                             <TemplateUpdateForm
//                                 temp_id = {previewTemplate.temp_id}
//                                 temp_header = {previewTemplate.temp_header}
//                                 temp_below_headerContent={previewTemplate.temp_below_headerContent}
//                                 temp_title={previewTemplate.temp_title}
//                                 temp_subtitle={previewTemplate.temp_subtitle}
//                                 temp_paperSize={previewTemplate.temp_paperSize}
//                                 temp_margin={previewTemplate.temp_margin}
//                                 temp_filename={previewTemplate.temp_filename}
//                                 temp_w_sign={previewTemplate.temp_w_sign}
//                                 temp_w_seal={previewTemplate.temp_w_seal}
//                                 temp_w_summon={previewTemplate.temp_w_summon}
//                                 temp_body={previewTemplate.temp_body}
//                                 onClose={() => setPreviewTemplate(null)}
//                             />                            
//                         </div>
//                     }
//                 />
//             )}
//         </div>
//     );
// }

// export default TemplateMainPage;





//LATEST W/ TRASH ICON BUT NO DELETE FUNCTIONALITY
// import { Link } from "react-router";
// import { useState } from "react";
// import { Button } from "@/components/ui/button/button";
// import { Plus, Trash2 } from "lucide-react";
// import CardLayout from "@/components/ui/card/card-layout";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import TemplateCreateForm from "./template-create";
// import TemplatePreview from "./template-preview";
// import TemplateUpdateForm from "./template-update";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useGetTemplateRecord, type TemplateRecord } from "./queries/template-FetchQueries";


// function TemplateMainPage() {

//     const [isDialogOpen, setIsDialogOpen] = useState(false); 
//     const { data: templates = [], isLoading} = useGetTemplateRecord();
//     const [previewTemplate, setPreviewTemplate] = useState<TemplateRecord | null>(null);


//     if (isLoading) {
//         return (
//             <div className="w-full h-full">
//               <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
//               <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
//               <Skeleton className="h-10 w-full mb-4 opacity-30" />
//               <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
//             </div>
//         );
//     }

//     return (
//         <div className="w-full h-full">
//             <div className="flex flex-col mb-4">
//                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Document Templates</h1>
//                 <p className="text-xs sm:text-sm text-darkGray">Manage and view document templates</p>
//             </div>
//             <hr className="border-gray mb-6 sm:mb-10" />

//             {/* Create Button */}
//             <div className="w-full flex justify-end pb-7">
//                 <DialogLayout
//                     trigger={
//                         <Button>
//                             <Plus size={20} /> Create Template
//                         </Button>
//                     }
//                     className="max-w-[60%] h-[90%] flex flex-col overflow-auto scrollbar-custom"
//                     title="Create New Template"
//                     description="Add new certification template."
//                     mainContent={
//                         <div className="w-full h-full">
//                             <TemplateCreateForm onSuccess={() => setIsDialogOpen(false)}/>
//                         </div>
//                     }
//                     isOpen={isDialogOpen}
//                     onOpenChange={setIsDialogOpen}
//                 />
//             </div>

//             {/* Document Cards */}
//             {templates.length > 0 ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//                 {templates.map((template) => (
//                     <div 
//                         key={template.temp_id} 
//                         onClick={() => setPreviewTemplate(template)}
//                         className="cursor-pointer relative group"
//                     >
//                         <CardLayout
//                             title=""
//                             description=""
//                             contentClassName="p-0"
//                             content={
//                             <div className="relative h-40 w-full flex items-center justify-center rounded-xl overflow-hidden">
//                                 {/* Background */}
//                                 <div className="absolute inset-0 bg-gray-100" />

//                                 {/* Icon or Preview Placeholder */}
//                                 <div className="z-10 text-gray-400 text-4xl">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//                                     <polyline points="14 2 14 8 20 8" />
//                                 </svg>
//                                 </div>

//                                 {/* Bottom filename bar */}
//                                 <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-xs sm:text-sm text-center py-1 px-2 z-20">
//                                 {template.temp_filename}
//                                 </div>
//                             </div>
//                             }
//                             cardClassName="p-0 shadow hover:shadow-lg transition-shadow rounded-xl"
//                     />
//                         <button 
//                             className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded z-30 hover:bg-red-600"
//                         >
//                             <Trash2 size={16} />
//                         </button>
//                     </div>
//                 ))}
//                 </div>
//             ) : (
//                 <div className="p-6 text-center text-gray-500">
//                 No templates available
//                 </div>
//             )}

//             {/* Template Preview Dialog */}
//             {previewTemplate && (
//                 <DialogLayout
//                     isOpen={!!previewTemplate}
//                     onOpenChange={(open) => !open && setPreviewTemplate(null)}
//                     className="max-w-[60%] h-[90%] flex flex-col overflow-auto scrollbar-custom"
//                     title={previewTemplate.temp_filename}
//                     description="View and update document template"
//                     mainContent={
//                         <div className="w-full h-full">
//                             {/* <TemplatePreview
//                                 headerImage={previewTemplate.temp_header}
//                                 belowHeaderContent={previewTemplate.temp_below_headerContent}
//                                 title={previewTemplate.temp_title}
//                                 subtitle={previewTemplate.temp_subtitle}
//                                 body={previewTemplate.temp_body}
//                                 withSeal={previewTemplate.temp_w_seal}
//                                 withSignature={previewTemplate.temp_w_sign}
//                                 withSummon={previewTemplate.temp_w_summon}
//                                 paperSize={previewTemplate.temp_paperSize}
//                                 margin={previewTemplate.temp_margin}
//                             /> */}
//                             <TemplateUpdateForm
//                                 temp_id = {previewTemplate.temp_id}
//                                 temp_header = {previewTemplate.temp_header}
//                                 temp_below_headerContent={previewTemplate.temp_below_headerContent}
//                                 temp_title={previewTemplate.temp_title}
//                                 temp_subtitle={previewTemplate.temp_subtitle}
//                                 temp_paperSize={previewTemplate.temp_paperSize}
//                                 temp_margin={previewTemplate.temp_margin}
//                                 temp_filename={previewTemplate.temp_filename}
//                                 temp_w_sign={previewTemplate.temp_w_sign}
//                                 temp_w_seal={previewTemplate.temp_w_seal}
//                                 temp_w_summon={previewTemplate.temp_w_summon}
//                                 temp_body={previewTemplate.temp_body}
//                                 onClose={() => setPreviewTemplate(null)}
//                             />                            
//                         </div>
//                     }
//                 />
//             )}
//         </div>
//     );
// }

// export default TemplateMainPage;







import { Link } from "react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Plus, Trash2 } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import TemplateCreateForm from "./template-create";
import TemplatePreview from "./template-preview";
import TemplateUpdateForm from "./template-update";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTemplateRecord, type TemplateRecord } from "./queries/template-FetchQueries";
import { useDeleteTemplate } from "./queries/template-DeleteQueries";




function TemplateMainPage() {

    const [isDialogOpen, setIsDialogOpen] = useState(false); 
    const { data: templates = [], isLoading} = useGetTemplateRecord();
    const [previewTemplate, setPreviewTemplate] = useState<TemplateRecord | null>(null);

    const { mutate: deleteTemplate } = useDeleteTemplate();

    const handleMarkAsResolved = (temp_id: number) => {
        const deleteData = {
            temp_id: temp_id,
            temp_is_archive: true,
        };
        deleteTemplate(deleteData);
    };


    if (isLoading) {
        return (
            <div className="w-full h-full">
              <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
              <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
              <Skeleton className="h-10 w-full mb-4 opacity-30" />
              <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <div className="flex flex-col mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Document Templates</h1>
                <p className="text-xs sm:text-sm text-darkGray">Manage and view document templates</p>
            </div>
            <hr className="border-gray mb-6 sm:mb-10" />

            {/* Create Button */}
            <div className="w-full flex justify-end pb-7">
                <DialogLayout
                    trigger={
                        <Button>
                            <Plus size={20} /> Create Template
                        </Button>
                    }
                    className="max-w-[60%] h-[90%] flex flex-col overflow-auto scrollbar-custom"
                    title="Create New Template"
                    description="Add new certification template."
                    mainContent={
                        <div className="w-full h-full">
                            <TemplateCreateForm onSuccess={() => setIsDialogOpen(false)}/>
                        </div>
                    }
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />
            </div>

            {/* Document Cards */}
            {templates.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {templates.map((template) => (
                    <div 
                        key={template.temp_id} 
                        onClick={() => setPreviewTemplate(template)}
                        className="cursor-pointer relative group"
                    >
                        <CardLayout
                            title=""
                            description=""
                            contentClassName="p-0"
                            content={
                            <div className="relative h-40 w-full flex items-center justify-center rounded-xl overflow-hidden">
                                {/* Background */}
                                <div className="absolute inset-0 bg-gray-100" />

                                {/* Icon or Preview Placeholder */}
                                <div className="z-10 text-gray-400 text-4xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                </div>

                                {/* Bottom filename bar */}
                                <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-xs sm:text-sm text-center py-1 px-2 z-20">
                                {template.temp_filename}
                                </div>
                            </div>
                            }
                            cardClassName="p-0 shadow hover:shadow-lg transition-shadow rounded-xl"
                    />
                        {/* <button 
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded z-30 hover:bg-red-600"
                        >
                            <Trash2 size={16} />
                        </button> */}
                        <ConfirmationModal
                            trigger={
                                <div 
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded z-30 hover:bg-red-600"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Trash2 size={16} />
                                </div>
                            }
                            title="Mark as resolved"
                            description="Are you sure you want to mark this report as resolved?"
                            actionLabel="Confirm"
                            onClick={() => handleMarkAsResolved(template.temp_id)}
                        />     
                    </div>
                ))}
                </div>
            ) : (
                <div className="p-6 text-center text-gray-500">
                No templates available
                </div>
            )}

            {/* Template Preview Dialog */}
            {previewTemplate && (
                <DialogLayout
                    isOpen={!!previewTemplate}
                    onOpenChange={(open) => !open && setPreviewTemplate(null)}
                    className="max-w-[60%] h-[90%] flex flex-col overflow-auto scrollbar-custom"
                    title={previewTemplate.temp_filename}
                    description="View and update document template"
                    mainContent={
                        <div className="w-full h-full">
                            {/* <TemplatePreview
                                headerImage={previewTemplate.temp_header}
                                belowHeaderContent={previewTemplate.temp_below_headerContent}
                                title={previewTemplate.temp_title}
                                subtitle={previewTemplate.temp_subtitle}
                                body={previewTemplate.temp_body}
                                withSeal={previewTemplate.temp_w_seal}
                                withSignature={previewTemplate.temp_w_sign}
                                withSummon={previewTemplate.temp_w_summon}
                                paperSize={previewTemplate.temp_paperSize}
                                margin={previewTemplate.temp_margin}
                            /> */}
                            <TemplateUpdateForm
                                temp_id = {previewTemplate.temp_id}
                                temp_header = {previewTemplate.temp_header}
                                temp_below_headerContent={previewTemplate.temp_below_headerContent}
                                temp_title={previewTemplate.temp_title}
                                temp_subtitle={previewTemplate.temp_subtitle}
                                temp_paperSize={previewTemplate.temp_paperSize}
                                temp_margin={previewTemplate.temp_margin}
                                temp_filename={previewTemplate.temp_filename}
                                temp_w_sign={previewTemplate.temp_w_sign}
                                temp_w_seal={previewTemplate.temp_w_seal}
                                temp_w_summon={previewTemplate.temp_w_summon}
                                temp_body={previewTemplate.temp_body}
                                onClose={() => setPreviewTemplate(null)}
                            />                            
                        </div>
                    }
                />
            )}
        </div>
    );
}

export default TemplateMainPage;