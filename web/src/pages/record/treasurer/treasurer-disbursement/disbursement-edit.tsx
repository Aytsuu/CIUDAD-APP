import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Plus, X } from "lucide-react";
import { useUpdateDisbursementVoucher } from "./queries/incDisb-updatequeries";
import { useAddDisbursementFiles } from "./queries/incDisb-addqueries";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";
import { useGetStaffList } from "./queries/incDisb-fetchqueries";
import {
  DisbursementVoucherFormProps,
  DisbursementInput,
  FileInput,
  ParticularItem,
  PayAccItem,
  DisbursementFormValues,
  DisbursementFile,
  Signatory,
  prepareEditDisbursementPayload,
} from "./incDisb-types";
import { DisbursementSchema } from "@/form-schema/treasurer/disbursement-schema";
import { zodResolver } from "@hookform/resolvers/zod";

export const EditDisbursementVoucher: React.FC<
  DisbursementVoucherFormProps
> = ({ onSuccess, existingVoucher }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<MediaUploadType>([]);
  const [_existingFiles, setExistingFiles] = useState<DisbursementFile[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();
  const updateMutation = useUpdateDisbursementVoucher();
  const addFilesMutation = useAddDisbursementFiles();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [voucherId, setVoucherId] = useState<string | number | null>(null);

  const form = useForm<DisbursementFormValues>({
    resolver: zodResolver(DisbursementSchema),
    defaultValues: {
      dis_payee: "",
      dis_tin: "",
      dis_date: new Date().toISOString().split("T")[0],
      dis_fund: "0",
      dis_particulars: [{ forPayment: "", tax: "0", amount: "0" }],
      dis_signatories: [
        { name: "", position: "", type: "certified_appropriation" },
        { name: "", position: "", type: "certified_availability" },
        { name: "", position: "", type: "certified_validity" },
      ],
      dis_checknum: "",
      dis_bank: "",
      dis_or_num: "",
      dis_paydate: new Date().toISOString().split("T")[0],
      dis_payacc: [{ account: "", accCode: "", debit: "0", credit: "0 " }],
      files: [],
    },
  });

  useEffect(() => {
    if (!existingVoucher) {
      setErrorMessage("No existing voucher data provided");
      setIsInitialized(true);
      return;
    }

    if (!existingVoucher.dis_num) {
      setErrorMessage("Voucher ID is missing from the existing data");
      setIsInitialized(true);
      return;
    }

    setVoucherId(existingVoucher.dis_num);
    setErrorMessage(null);

    try {
      const formData = {
        dis_payee: existingVoucher.dis_payee || "",
        dis_tin: existingVoucher.dis_tin || "",
        dis_date:
          existingVoucher.dis_date || new Date().toISOString().split("T")[0],
        dis_fund: existingVoucher.dis_fund || 0,
        dis_particulars: existingVoucher.dis_particulars?.length
          ? existingVoucher.dis_particulars.map((p: any) => ({
              forPayment: p.forPayment || "",
              tax: p.tax || 0,
              amount: p.amount || 0,
            }))
          : [{ forPayment: "", tax: 0, amount: 0 }],
        dis_signatories: existingVoucher.dis_signatories?.length
          ? existingVoucher.dis_signatories
          : [
              { name: "", position: "", type: "certified_appropriation" },
              { name: "", position: "", type: "certified_availability" },
              { name: "", position: "", type: "certified_validity" },
            ],
        dis_checknum: existingVoucher.dis_checknum || "",
        dis_bank: existingVoucher.dis_bank || "",
        dis_or_num: existingVoucher.dis_or_num || "",
        dis_paydate:
          existingVoucher.dis_paydate || new Date().toISOString().split("T")[0],
        dis_payacc: existingVoucher.dis_payacc?.length
          ? existingVoucher.dis_payacc.map((p: any) => ({
              account: p.account || "",
              accCode: p.accCode || "",
              debit: p.debit || 0,
              credit: p.credit || 0,
            }))
          : [{ account: "", accCode: "", debit: 0, credit: 0 }],
      };

      form.reset(formData);

      const files = existingVoucher.files || [];

      const mappedFiles = files.map((file: DisbursementFile) => ({
        id: file.disf_num?.toString() || `file-${Date.now()}-${Math.random()}`,
        name: file.disf_name,
        type: file.disf_type,
        url: file.disf_url,
        file: null,
        isExisting: true,
      }));

      setFiles(mappedFiles);
      setExistingFiles(files);

      setIsInitialized(true);
    } catch (initError) {
      setIsInitialized(true);
    }
  }, [existingVoucher, form, user]);

  const { control, setValue, watch, handleSubmit } = form;
  const particulars = watch("dis_particulars");
  const payacc = watch("dis_payacc");
  const signatories = watch("dis_signatories");

  const addParticular = () => {
    setValue("dis_particulars", [
      ...particulars,
      { forPayment: "", tax: "0", amount: "0" },
    ]);
  };

  const removeParticular = (index: number) => {
    if (particulars.length > 1) {
      setValue(
        "dis_particulars",
        particulars.filter((_: ParticularItem, i: number) => i !== index)
      );
    }
  };

  const addPayAcc = () => {
    setValue("dis_payacc", [
      ...payacc,
      { account: "", accCode: "", debit: "0", credit: "0" },
    ]);
  };

  const removePayAcc = (index: number) => {
    if (payacc.length > 1) {
      setValue(
        "dis_payacc",
        payacc.filter((_: PayAccItem, i: number) => i !== index)
      );
    }
  };

  const updateSignatory = (
    index: number,
    field: keyof Signatory,
    value: string,
    position?: string
  ) => {
    setValue(`dis_signatories.${index}.${field}`, value);
    if (position && field === "name") {
      setValue(`dis_signatories.${index}.position`, position);
    }
  };

  const signatoryLabels = {
    certified_appropriation:
      "A. Certified as to existence of appropriation for obligation",
    certified_availability: "B. Certified as to availability of funds",
    certified_validity: "C. Certified as to validity, propriety, and legality",
  };

  const onSubmit = async (data: DisbursementFormValues) => {
    try {
      setErrorMessage(null);
      if (!voucherId) {
        const error = "Voucher ID is required for update but was not found.";

        throw new Error(error);
      }

      const disbursementData: DisbursementInput = {
        dis_num: voucherId,
        dis_payee: data.dis_payee,
        dis_tin: data.dis_tin || "",
        dis_date: data.dis_date,
        dis_fund: data.dis_fund,
        dis_particulars: data.dis_particulars.filter(
          (p) => p.forPayment.trim() !== ""
        ),
        dis_signatories: data.dis_signatories.filter(
          (s) => s.name.trim() !== ""
        ),
        dis_checknum: data.dis_checknum || "",
        dis_bank: data.dis_bank || "",
        dis_or_num: data.dis_or_num || "",
        dis_paydate: data.dis_paydate,
        dis_payacc: data.dis_payacc.filter((p) => p.account.trim() !== ""),
        dis_is_archive: existingVoucher?.dis_is_archive || false,
      };

      const preparedData = prepareEditDisbursementPayload(disbursementData);
      await updateMutation.mutateAsync(preparedData);

      const newFiles: FileInput[] = files
        .filter((file) => {
          const isNewFile = !!file.file;
          console.log("File check:", {
            name: file.name,
            hasFile: !!file.file,
            hasUrl: !!file.url,
            isNewFile: isNewFile,
          });
          return isNewFile;
        })
        .map((file) => {
          return {
            name: file.name,
            type: file.type,
            file: file.file as string,
          };
        });

      // Add new files
      if (newFiles.length > 0) {
        try {
          // Convert voucherId to number
          const numericVoucherId = Number(voucherId);
          if (isNaN(numericVoucherId)) {
            throw new Error("Invalid voucher ID format");
          }

          await addFilesMutation.mutateAsync({
            dis_num: numericVoucherId, // ← Now it's a number
            files: newFiles,
          });
        } catch (fileError) {
          console.error("❌ Failed to add new files:", fileError);
        }
      }

      onSuccess();
    } catch (error: any) {
      if (error.response) {
        console.error("❌ API Response Error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      }

      let errorMessage =
        "Failed to update disbursement voucher. Please check the form data and try again.";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data, null, 2);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrorMessage(errorMessage);
    }
  };

  const handleFormSubmit = handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (errors) => {
      setErrorMessage(
        `Form validation failed: ${Object.keys(errors).join(", ")}`
      );
    }
  );

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div className="p-4 bg-blue-100 border border-blue-300 text-blue-700 rounded-lg">
          Loading disbursement voucher data...
        </div>
      </div>
    );
  }

  // Show error if no voucher ID
  if (!voucherId) {
    return (
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          <h3 className="font-semibold mb-2">Unable to load voucher</h3>
          <p>
            The voucher ID is missing or invalid. Please ensure you're accessing
            this form with valid voucher data.
          </p>
          {errorMessage && <p className="mt-2 text-sm">{errorMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-2xl md:max-w-3xl lg:max-w-4xl">
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
          <div className="space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Display voucher ID for debugging */}
            <div className="p-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg text-sm">
              <strong>Editing Voucher ID:</strong> {voucherId}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                control={control}
                name="dis_payee"
                label="Payee"
                placeholder="Enter payee name"
                type="text"
              />
              <FormInput
                control={control}
                name="dis_tin"
                label="TIN"
                placeholder="Enter TIN number"
                type="text"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormDateTimeInput
                control={control}
                name="dis_date"
                label="Date"
                type="date"
              />
              <FormInput
                control={control}
                name="dis_fund"
                label="Fund"
                placeholder="0.00"
                type="number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Particulars
              </label>
              <div className="space-y-2">
                {particulars.map(
                  (_particular: ParticularItem, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center p-3 border rounded-lg"
                    >
                      <FormInput
                        control={control}
                        name={`dis_particulars.${index}.forPayment`}
                        label="For Payment"
                        placeholder="Description"
                        type="text"
                      />
                      <FormInput
                        control={control}
                        name={`dis_particulars.${index}.tax`}
                        label="Withholding Tax %"
                        placeholder="0"
                        type="number"
                      />
                      <FormInput
                        control={control}
                        name={`dis_particulars.${index}.amount`}
                        label="Amount"
                        placeholder="0.00"
                        type="number"
                      />
                      <Button
                        className="mt-8"
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeParticular(index)}
                        disabled={particulars.length <= 1}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  )
                )}
                <Button
                  type="button"
                  onClick={addParticular}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus size={16} />
                  Add Particular
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Signatories
              </label>
              <div className="space-y-4">
                {signatories.map((signatory: Signatory, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm mb-3">
                      {signatoryLabels[signatory.type]}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                      <ComboboxInput
                        value={signatory.name}
                        options={staffList}
                        isLoading={isStaffLoading}
                        label=""
                        placeholder="Select staff..."
                        emptyText="No staff found. Enter name manually."
                        onSelect={(value, item) =>
                          updateSignatory(index, "name", value, item?.position)
                        }
                        onCustomInput={(value) =>
                          updateSignatory(index, "name", value)
                        }
                        displayKey="full_name"
                        valueKey="staff_id"
                        additionalDataKey="position"
                      />
                      <FormInput
                        className="h-10 mt-0.5"
                        control={control}
                        name={`dis_signatories.${index}.position`}
                        label=""
                        placeholder="Position"
                        type="text"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <FormInput
                control={control}
                name="dis_checknum"
                label="Check Number"
                placeholder="Enter check number"
                type="text"
              />
              <FormInput
                control={control}
                name="dis_bank"
                label="Bank"
                placeholder="Enter bank name"
                type="text"
              />
              <FormInput
                control={control}
                name="dis_or_num"
                label="OR Number"
                placeholder="Enter OR number"
                type="text"
              />
              <FormDateTimeInput
                control={control}
                name="dis_paydate"
                label="Payment Date"
                type="date"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Accounts
              </label>
              <div className="space-y-2">
                {payacc.map((_payacc: PayAccItem, index: number) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center p-3 border rounded-lg"
                  >
                    <FormInput
                      control={control}
                      name={`dis_payacc.${index}.account`}
                      label="Account"
                      placeholder="Account name"
                      type="text"
                    />
                    <FormInput
                      control={control}
                      name={`dis_payacc.${index}.accCode`}
                      label="Account Code"
                      placeholder="Code"
                      type="text"
                    />
                    <FormInput
                      control={control}
                      name={`dis_payacc.${index}.debit`}
                      label="Debit"
                      placeholder="0.00"
                      type="number"
                    />
                    <FormInput
                      control={control}
                      name={`dis_payacc.${index}.credit`}
                      label="Credit"
                      placeholder="0.00"
                      type="number"
                    />
                    <Button
                      className="mt-8"
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePayAcc(index)}
                      disabled={payacc.length <= 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addPayAcc}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus size={16} />
                  Add Account
                </Button>
              </div>
            </div>

            <div>
              <MediaUpload
                title="Supporting Documents"
                description="Upload supporting documents for this disbursement"
                mediaFiles={files}
                setMediaFiles={setFiles}
                activeVideoId={activeVideoId}
                setActiveVideoId={setActiveVideoId}
                acceptableFiles="all"
                hideRemoveButton={true}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end mt-6 gap-3">
              <ConfirmationModal
                trigger={
                  <Button
                    type="button"
                    className="w-full sm:w-auto items-center gap-2 mb-5"
                    disabled={updateMutation.isPending || !voucherId}
                  >
                    {updateMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                }
                title="Confirm Update"
                description="Are you sure you want to update this disbursement voucher?"
                actionLabel="Confirm"
                onClick={() => {
                  handleFormSubmit();
                }}
                open={isConfirmModalOpen}
                onOpenChange={setIsConfirmModalOpen}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
