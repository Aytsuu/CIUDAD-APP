import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Plus, X, Wallet } from "lucide-react";
import {Dialog,DialogContent,DialogHeader,DialogTitle,} from "@/components/ui/dialog/dialog";
import {useAddProjectProposal,useAddSupportDocument,} from "./queries/addqueries";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { useGetStaffList } from "./queries/fetchqueries";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/ui/form/form-input";
import { ProjectProposalSchema, ProjectProposalFormValues } from "@/form-schema/gad-projprop-create-form-schema";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Form } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGADBudgets } from "../budget-tracker/queries/BTFetchQueries";
import { useGetGADYearBudgets } from "../budget-tracker/queries/BTYearQueries";
import { generateProposalPdf } from "./personalized-compo/pdfGenerator";
import { Signatory, ProjectProposalFormProps, ProjectProposalInput, FileInput, SupportDoc } from "./projprop-types";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export const ProjectProposalForm: React.FC<ProjectProposalFormProps> = ({ onSuccess, existingProposal }) => {
  const { user } = useAuth();
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [supportingDocs, setSupportingDocs] = useState<MediaUploadType>([]);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();
  const addMutation = useAddProjectProposal(!!existingProposal);
  const addSupportDocMutation = useAddSupportDocument();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { data: budgetEntries = [], isLoading: isBudgetLoading } = useGADBudgets(new Date().getFullYear().toString());
  const { data: yearBudgets } = useGetGADYearBudgets();
  const currentYear = new Date().getFullYear().toString();
  const currentYearBudget = yearBudgets?.find((budget) => budget.gbudy_year === currentYear)?.gbudy_budget;

  const latestExpenseWithBalance = budgetEntries
    .filter((entry) => !entry.gbud_is_archive && entry.gbud_remaining_bal != null)
    .sort((a, b) => new Date(b.gbud_datetime).getTime() - new Date(a.gbud_datetime).getTime())[0];

  const availableBudget = latestExpenseWithBalance
    ? Number(latestExpenseWithBalance.gbud_remaining_bal) === 0
      ? currentYearBudget
        ? Number(currentYearBudget)
        : 0
      : Number(latestExpenseWithBalance.gbud_remaining_bal)
    : currentYearBudget
    ? Number(currentYearBudget)
    : 0;

  const form = useForm<ProjectProposalFormValues>({
    resolver: zodResolver(ProjectProposalSchema),
    defaultValues: {
      projectTitle: "",
      background: "",
      objectives: [""],
      participants: [{ category: "", count: "0" }],
      date: "",
      venue: "",
      budgetItems: [{ name: "", pax: "", amount: "0" }],
      monitoringEvaluation: "",
      signatories: [
        { name: "", position: "", type: "prepared" },
        { name: "", position: "Treasurer", type: "approved" },
      ],
      paperSize: "letter",
      headerImage: [],
      supportingDocs: [],
      status: "Pending",
      statusReason: "",
    },
  });

  useEffect(() => {
    const userStaff = user?.staff;
    const userFullName = userStaff?.rp?.per
      ? `${userStaff.rp.per.per_fname} ${userStaff.rp.per.per_lname}`.trim()
      : user?.username || "";
    const userPosition = userStaff?.pos?.pos_title || "Staff";
    const treasurer = staffList.find((s) => s.position === "Treasurer");
    const treasurerName = treasurer?.full_name || "";

    if (!isStaffLoading && staffList.length > 0) {
      form.reset({
        projectTitle: existingProposal?.projectTitle || "",
        background: existingProposal?.background || "",
        objectives: existingProposal?.objectives?.length ? existingProposal.objectives : [""],
        participants: existingProposal?.participants?.length
          ? existingProposal.participants.map((p: { category: string; count: number }) => ({ category: p.category, count: String(p.count) }))
          : [{ category: "", count: "0" }],
        date: existingProposal?.date || "",
        venue: existingProposal?.venue || "",
        budgetItems: existingProposal?.budgetItems?.length
          ? existingProposal.budgetItems.map((b: { name: string; pax: string; amount: number }) => ({ name: b.name, pax: b.pax, amount: String(b.amount) }))
          : [{ name: "", pax: "", amount: "0" }],
        monitoringEvaluation: existingProposal?.monitoringEvaluation || "",
        signatories: existingProposal?.signatories?.length
          ? existingProposal.signatories
          : [
              { name: userFullName, position: userPosition, type: "prepared" },
              { name: treasurerName, position: "Treasurer", type: "approved" },
            ],
        paperSize: existingProposal?.paperSize || "letter",
        headerImage: existingProposal?.headerImage ? [existingProposal.headerImage] : [],
        supportingDocs: existingProposal?.supportDocs || [],
        status: existingProposal?.status || "Pending",
        statusReason: existingProposal?.statusReason || "",
      });
      setMediaFiles(
        existingProposal?.headerImage
          ? [{
              id: "existing",
              name: existingProposal.headerImage.split('/').pop() || "header-image.jpg",
              type: "image/jpeg",
              file: existingProposal.headerImage,
              url: existingProposal.headerImage,
            }]
          : []
      );
      setSupportingDocs(
        existingProposal?.supportDocs?.map((doc: SupportDoc) => ({
          id: `doc-${doc.psd_id}`,
          name: doc.psd_name,
          type: doc.psd_type,
          file: doc.psd_url,
          url: doc.psd_url,
        })) || []
      );
    }
  }, [isStaffLoading, staffList, user, existingProposal, form]);

  useEffect(() => {
    return () => {
      if (pdfPreview) URL.revokeObjectURL(pdfPreview);
    };
  }, [pdfPreview]);

  const { control, setValue, watch } = form;
  const projectTitle = watch("projectTitle");
  const background = watch("background");
  const objectives = watch("objectives");
  const participants = watch("participants");
  const date = watch("date");
  const venue = watch("venue");
  const budgetItems = watch("budgetItems");
  const monitoringEvaluation = watch("monitoringEvaluation");
  const signatories = watch("signatories");
  const paperSize = watch("paperSize");

  const proposedBudget = budgetItems.reduce((sum: number, item: { name: string; pax: string; amount: string }) => {
    const pax = parseInt(item.pax) || 1;
    return sum + (parseInt(item.amount) || 0) * pax;
  }, 0);

  const participantCategories = [
    "Women",
    "LGBTQIA+",
    "Responsible Person",
    "Senior",
    "PWD",
    "Solo Parent",
    "Erpat",
    "Children",
    "Barangay Staff",
    "GAD Staff",
  ];

  const addParticipant = () => {
    setValue("participants", [...participants, { category: "", count: "0" }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setValue("participants", participants.filter((_: { category: string; count: string }, i: number) => i !== index));
    }
  };

  const addBudgetItem = () => {
    setValue("budgetItems", [...budgetItems, { name: "", pax: "", amount: "0" }]);
  };

  const removeBudgetItem = (index: number) => {
    if (budgetItems.length > 1) {
      setValue("budgetItems", budgetItems.filter((_: { name: string; pax: string; amount: string }, i: number) => i !== index));
    }
  };

  const addObjective = () => {
    setValue("objectives", [...objectives, ""]);
  };

  const removeObjective = (index: number) => {
    if (objectives.length > 1) {
      setValue("objectives", objectives.filter((_: string, i: number) => i !== index));
    }
  };

  const addSignatory = (type: "prepared" | "approved") => {
    setValue("signatories", [...signatories, { name: "", position: "", type }]);
  };

  const removeSignatory = (index: number) => {
    if (signatories.length > 1) {
      setValue("signatories", signatories.filter((_: Signatory, i: number) => i !== index));
    }
  };

  const updateSignatory = (index: number, field: keyof Signatory, value: string, position?: string) => {
    setValue(`signatories.${index}.${field}`, value);
    if (position && field === "name") {
      setValue(`signatories.${index}.position`, position);
    }
  };

  const generatePDF = async (preview = false) => {
    try {
      const pdfUrl = await generateProposalPdf(
        {
          projectTitle,
          background,
          objectives,
          participants,
          date,
          venue,
          budgetItems,
          monitoringEvaluation,
          signatories,
          paperSize,
          headerImage: mediaFiles[0]?.url || null,
        },
        preview
      );
      if (preview && pdfUrl) {
        setPdfPreview(pdfUrl);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setErrorMessage("Failed to generate PDF preview. Please try again.");
    }
  };

  const closePreview = () => {
    if (pdfPreview) URL.revokeObjectURL(pdfPreview);
    setIsPreviewOpen(false);
  };

  const onSubmit = async (data: ProjectProposalFormValues) => {
  if (proposedBudget > availableBudget) {
    setErrorMessage(`Proposed budget (₱${proposedBudget.toLocaleString()}) exceeds available budget (₱${availableBudget.toLocaleString()})`);
    return;
  }

  try {
    setErrorMessage(null);
    let gpr_header_img: string | null = null;    
    if (mediaFiles.length > 0 && mediaFiles[0].file) {
      if (mediaFiles[0].file.startsWith('data:')) {
        gpr_header_img = mediaFiles[0].file; 
      }
      else {
        gpr_header_img = mediaFiles[0].file; 
      }
    }
    else if (existingProposal?.headerImage && mediaFiles.length === 0) {
      gpr_header_img = null; 
    }
    else if (existingProposal?.headerImage) {
      gpr_header_img = existingProposal.headerImage;
    }

    const proposalData: ProjectProposalInput = {
      gprId: existingProposal?.gprId,
      gpr_title: data.projectTitle,
      background: data.background,
      objectives: data.objectives.filter((obj: string) => obj.trim() !== ""),
      participants: data.participants.filter((p: { category: string; count: string }) => p.category.trim() !== ""),
      date: data.date,
      venue: data.venue,
      budgetItems: data.budgetItems.filter((item: { name: string; pax: string; amount: string }) => item.name.trim() !== ""),
      monitoringEvaluation: data.monitoringEvaluation,
      signatories: data.signatories.filter((s: Signatory) => s.name.trim() !== ""),
      gpr_header_img,
      staffId: user?.staff?.staff_id || null,
      // staffId: "00002250821",
      gprIsArchive: existingProposal?.gprIsArchive || false,
      supportDocs: existingProposal?.supportDocs || [],
      status: data.status || "Pending",
      statusReason: data.statusReason || null,
      gpr_page_size: data.paperSize,
    };

    console.log("Sending proposalData:", JSON.stringify(proposalData, null, 2));
    const proposalResponse = await addMutation.mutateAsync(proposalData);

    // Handle new supporting documents
    const newFiles: FileInput[] = supportingDocs
      .filter((doc): doc is { id: string; name: string; type: string; file: string; url?: string } => 
        !!doc.file && !existingProposal?.supportDocs?.some((sd: SupportDoc) => sd.psd_url === doc.url))
      .map((doc) => ({
        name: doc.name,
        type: doc.type,
        file: doc.file,
      }));

    if (newFiles.length > 0) {
      await addSupportDocMutation.mutateAsync({
        gpr_id: proposalResponse.gprId,
        files: newFiles,
      });
    }

    form.reset();
    setMediaFiles([]);
    setSupportingDocs([]);
    onSuccess();
  } catch (error: any) {
    console.error("Error in handleSave:", error);
    setErrorMessage(
      error.response?.data
        ? JSON.stringify(error.response.data)
        : "Failed to save proposal. Please check the form data and try again."
    );
  }
};

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-2xl md:max-w-3xl lg:max-w-4xl">
      {errorMessage && (
        <div className="mb-4 p-2 sm:p-4 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Paper Size</label>
        <div className="flex flex-wrap gap-4">
          {["a4", "letter", "legal"].map((size) => (
            <label key={size} className="flex items-center gap-2">
              <input
                type="radio"
                name="paperSize"
                checked={paperSize === size}
                onChange={() => setValue("paperSize", size as "a4" | "letter" | "legal")}
              />
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Header Image (optional)</label>
              <MediaUpload
                title=""
                description="Upload an image for the proposal header"
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
                activeVideoId={activeVideoId}
                setActiveVideoId={setActiveVideoId}
                maxFiles={1}
                acceptableFiles="image"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Supporting Documents (optional)</label>
              <MediaUpload
                title=""
                description="Upload any supporting documents for your proposal"
                mediaFiles={supportingDocs}
                setMediaFiles={setSupportingDocs}
                activeVideoId={activeVideoId}
                setActiveVideoId={setActiveVideoId}
                acceptableFiles="all"
              />
            </div>

            <div>
              <FormInput
                control={control}
                name="projectTitle"
                label="Project Title"
                placeholder="Enter project title"
                type="text"
              />
            </div>

            <div>
              <FormInput
                control={control}
                name="background"
                label="Background"
                placeholder="Enter project background"
                type="textarea"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Objectives</label>
              <div className="space-y-2">
                {objectives.map((_objective: string, index: number) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-center">
                    <FormInput
                      control={control}
                      name={`objectives.${index}`}
                      label=""
                      placeholder={`Objective ${index + 1}`}
                      type="textarea"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeObjective(index)}
                      disabled={objectives.length <= 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addObjective}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus size={16} />
                  Add Objective
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Participants</label>
              <div className="space-y-2">
                {participants.map((_participant: { category: string; count: string }, index: number) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <FormSelect
                      control={control}
                      name={`participants.${index}.category`}
                      label=""
                      options={participantCategories.map((cat) => ({ id: cat, name: cat }))}
                    />
                    <FormInput
                      control={control}
                      name={`participants.${index}.count`}
                      label=""
                      placeholder="Count"
                      type="number"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeParticipant(index)}
                      disabled={participants.length <= 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addParticipant}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus size={16} />
                  Add Participant Category
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormDateTimeInput
                control={control}
                name="date"
                label="Date"
                type="date"
              />
              <FormInput
                control={control}
                name="venue"
                label="Venue"
                placeholder="e.g. CEBU CITY HALL, PLAZA SUGBO"
                type="text"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">
                  Budgetary Requirements
                </label>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <span>Available Funds:</span>
                  {isBudgetLoading ? (
                    <span className="text-gray-500">Loading...</span>
                  ) : (
                    <span className="font-mono text-red-500">
                      ₱{availableBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 font-medium text-sm">
                  <span>Name</span>
                  <span>Pax</span>
                  <span>Amount</span>
                  <span>Action</span>
                </div>
                {budgetItems.map((_budgetItem: { name: string; pax: string; amount: string }, index: number) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <FormInput
                      control={control}
                      name={`budgetItems.${index}.name`}
                      label=""
                      placeholder="Item name"
                      type="text"
                    />
                    <FormInput
                      control={control}
                      name={`budgetItems.${index}.pax`}
                      label=""
                      placeholder="e.g. 73 pax"
                      type="text"
                    />
                    <FormInput
                      control={control}
                      name={`budgetItems.${index}.amount`}
                      label=""
                      placeholder="Amount"
                      type="number"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeBudgetItem(index)}
                      disabled={budgetItems.length <= 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addBudgetItem}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus size={16} />
                  Add Budget Item
                </Button>
              </div>
              {proposedBudget > 0 && (
                <div className="mt-2 flex justify-between">
                  <span className="font-medium">Proposed Budget:</span>
                  <span className={proposedBudget > availableBudget ? "text-red-500" : ""}>
                    ₱{proposedBudget.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div>
              <FormInput
                control={control}
                name="monitoringEvaluation"
                label="Monitoring Evaluation"
                placeholder="Enter monitoring evaluation"
                type="textarea"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prepared by</label>
                <div className="space-y-2">
                  {signatories
                    .filter((s: Signatory) => s.type === "prepared")
                    .map((sig: Signatory, _index: number) => {
                      const globalIndex = signatories.findIndex((s: Signatory) => s === sig);
                      return (
                        <div key={globalIndex} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                          <ComboboxInput
                            value={sig.name}
                            options={staffList}
                            isLoading={isStaffLoading}
                            label=""
                            placeholder="Select staff..."
                            emptyText="No staff found. Enter name manually."
                            onSelect={(value, item) => updateSignatory(globalIndex, "name", value, item?.position)}
                            onCustomInput={(value) => updateSignatory(globalIndex, "name", value)}
                            displayKey="full_name"
                            valueKey="staff_id"
                            additionalDataKey="position"
                          />
                          <FormInput
                            control={control}
                            name={`signatories.${globalIndex}.position`}
                            label=""
                            placeholder=""
                            type="text"
                            className="p-0"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSignatory(globalIndex)}
                            disabled={signatories.length <= 1}
                            className="p-4 mt-1"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      );
                    })}
                  <Button
                    type="button"
                    onClick={() => addSignatory("prepared")}
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Approved by</label>
                <div className="space-y-2">
                  {signatories
                    .filter((s: Signatory) => s.type === "approved")
                    .map((sig: Signatory, _index: number) => {
                      const globalIndex = signatories.findIndex((s: Signatory) => s === sig);
                      return (
                        <div key={globalIndex} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                          <ComboboxInput
                            value={sig.name}
                            options={staffList}
                            isLoading={isStaffLoading}
                            label=""
                            placeholder="Select staff..."
                            emptyText="No staff found. Enter name manually."
                            onSelect={(value, item) => updateSignatory(globalIndex, "name", value, item?.position)}
                            onCustomInput={(value) => updateSignatory(globalIndex, "name", value)}
                            displayKey="full_name"
                            valueKey="staff_id"
                            additionalDataKey="position"
                          />
                          <FormInput
                            control={control}
                            name={`signatories.${globalIndex}.position`}
                            label=""
                            placeholder=""
                            type="text"
                            className="p-0"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSignatory(globalIndex)}
                            disabled={signatories.length <= 1}
                            className="p-4 mt-1"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      );
                    })}
                  <Button
                    type="button"
                    onClick={() => addSignatory("approved")}
                    variant="outline"
                    className="gap-2 w-full sm:w-auto mb-5"
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end mt-6 gap-3">
              <Button
                type="button"
                onClick={() => generatePDF(true)}
                variant="outline"
                className="w-full sm:w-auto items-center gap-2 mb-5"
              >
                Preview
              </Button>
              <ConfirmationModal
                trigger={
                  <Button
                    type="button"
                    className="w-full sm:w-auto items-center gap-2"
                    disabled={addMutation.isPending || Object.keys(form.formState.errors).length > 0 || proposedBudget > availableBudget}
                  >
                    {addMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                }
                title="Confirm Save"
                description="Are you sure you want to save this project proposal?"
                actionLabel="Confirm"
                onClick={() => form.handleSubmit(onSubmit)()}
                open={isConfirmModalOpen}
                onOpenChange={setIsConfirmModalOpen}
              />
            </div>
          </div>
        </form>
      </Form>

      <Dialog open={isPreviewOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[95vh] max-h-[95vh] p-0">
          <DialogHeader className="p-4 sticky top-0 bg-background z-10">
            <DialogTitle className="flex flex-row items-center justify-between">
              Preview
              <X
                className="text-gray-500 hover:text-gray-700 cursor-pointer hover:bg-gray-50"
                size="20"
                onClick={closePreview}
              />
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {pdfPreview && (
              <iframe
                src={`${pdfPreview}#zoom=FitH`}
                className="w-full h-full border-t-0 bg-white"
                title="PDF Preview"
                style={{ minHeight: "calc(90vh - 4rem)" }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};