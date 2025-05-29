import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { Plus } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import TemplateCreateForm from "./template-create";

export type Template = {
    fileName: string;
};

export const templateRecord: Template[] = [
    { fileName: "Barangay-Clearance.pdf" },
    { fileName: "Business-Permit.pdf" },
    { fileName: "Official.pdf" },
    { fileName: "Emergency-Help.pdf" },      
];

function TemplateMainPage() {
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
                    className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                    title="Create New Template"
                    description="Add new certification template."
                    mainContent={
                        <div className="w-full h-full">
                            <TemplateCreateForm/>
                        </div>
                    }
                />
            </div>

            {/* Document Cards */}
            {templateRecord.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {templateRecord.map((template, index) => (
                        <CardLayout
                            key={index}
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
                                    {template.fileName}
                                </div>
                                </div>
                            }
                            cardClassName="p-0 shadow hover:shadow-lg transition-shadow rounded-xl"
                        />
                    ))}
                </div>
            ) : (
                <div className="p-6 text-center text-gray-500">
                    No templates available
                </div>
            )}
        </div>
    );
}

export default TemplateMainPage;
