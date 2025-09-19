import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Plus, X } from "lucide-react";
import { useAddDisbursementVoucher, useAddDisbursementFiles } from "./queries/incDisb-addqueries";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
// import { useGetStaffList } from "./queries/incDisb-fetchqueries";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { DisbursementVoucherFormProps, DisbursementInput, FileInput, ParticularItem, PayAccItem, DisbursementFormValues } from "./incDisb-types";



export const DisbursementCreate: React.FC<DisbursementVoucherFormProps> = ({
  onSuccess,
  existingVoucher,
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [_errorMessage, setErrorMessage] = useState<string | null>(null);
  // const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();
  const addMutation = useAddDisbursementVoucher();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const addFilesMutation = useAddDisbursementFiles(); 

  const form = useForm<DisbursementFormValues>({
    defaultValues: {
      dis_payee: "",
      dis_tin: "",
      dis_date: new Date().toISOString().split('T')[0],
      dis_fund: "0",
      dis_particulars: [{ forPayment: "", tax: "0", amount: "0" }],
      dis_checknum: "",
      dis_bank: "",
      dis_or_num: "",
      dis_paydate: new Date().toISOString().split('T')[0],
      dis_payacc: [{ account: "", accCode: "", debit: "0", credit: "0" }],
      files: [],
    },
  });

  useEffect(() => {
    if (existingVoucher) {
      form.reset({
        dis_payee: existingVoucher.dis_payee || "",
        dis_tin: existingVoucher.dis_tin || "",
        dis_date: existingVoucher.dis_date || new Date().toISOString().split('T')[0],
        dis_fund: existingVoucher.dis_fund?.toString() || "0",
        dis_particulars: existingVoucher.dis_particulars?.length
          ? existingVoucher.dis_particulars.map((p: any) => ({
              forPayment: p.forPayment || "",
              tax: p.tax?.toString() || "0",
              amount: p.amount?.toString() || "0",
            }))
          : [{ forPayment: "", tax: "0", amount: "0" }],
        dis_checknum: existingVoucher.dis_checknum || "",
        dis_bank: existingVoucher.dis_bank || "",
        dis_or_num: existingVoucher.dis_or_num || "",
        dis_paydate: existingVoucher.dis_paydate || new Date().toISOString().split('T')[0],
        dis_payacc: existingVoucher.dis_payacc?.length
          ? existingVoucher.dis_payacc.map((p: any) => ({
              account: p.account || "",
              accCode: p.accCode || "",
              debit: p.debit?.toString() || "0",
              credit: p.credit?.toString() || "0",
            }))
          : [{ account: "", accCode: "", debit: "0", credit: "0" }],
        staff: user?.staff?.staff_id || null,
      });

      setFiles(
        existingVoucher.files?.map((file: any) => ({
          id: `file-${file.disf_num}`,
          name: file.disf_name,
          type: file.disf_type,
          file: file.disf_url,
          url: file.disf_url,
        })) || []
      );
    }
  }, [existingVoucher, form]);

  const { control, setValue, watch } = form;
  const particulars = watch("dis_particulars");
  const payacc = watch("dis_payacc");
  const addParticular = () => {
    setValue("dis_particulars", [...particulars, { forPayment: "", tax: "0", amount: "0" }]);
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
    setValue("dis_payacc", [...payacc, { account: "", accCode: "", debit: "0", credit: "0" }]);
  };

  const removePayAcc = (index: number) => {
    if (payacc.length > 1) {
      setValue(
        "dis_payacc",
        payacc.filter((_: PayAccItem, i: number) => i !== index)
      );
    }
  };

  const onSubmit = async (data: DisbursementFormValues) => {
    try {
      setErrorMessage(null);

      const formattedParticulars = data.dis_particulars
        .filter(p => p.forPayment.trim() !== "")
        .map(p => ({
          forPayment: p.forPayment,
          tax: parseFloat(p.tax) || 0,
          amount: parseFloat(p.amount) || 0
        }));

      const formattedPayAcc = data.dis_payacc
        .filter(p => p.account.trim() !== "")
        .map(p => ({
          account: p.account,
          accCode: p.accCode,
          debit: parseFloat(p.debit) || 0,
          credit: parseFloat(p.credit) || 0
        }));

      const disbursementData: DisbursementInput = {
        dis_payee: data.dis_payee,
        dis_tin: data.dis_tin,
        dis_date: data.dis_date,
        dis_fund: parseFloat(data.dis_fund) || 0,
        dis_particulars: formattedParticulars,
        dis_checknum: data.dis_checknum,
        dis_bank: data.dis_bank,
        dis_or_num: data.dis_or_num,
        dis_paydate: data.dis_paydate,
        dis_payacc: formattedPayAcc,
        staff: data.staff,
      };

      const newFiles: FileInput[] = files
        .filter((file) => !!file.file)
        .map((file) => ({
          name: file.name,
          type: file.type,
          file: file.file as string,
        }));

      // Create the disbursement voucher
      const disbursementResponse = await addMutation.mutateAsync(disbursementData);

      // Handle files using the returned ID
      if (newFiles.length > 0) {
        const disNum = disbursementResponse.dis_num || disbursementResponse.disNum;
        if (!disNum) {
          throw new Error('No disbursement voucher ID returned from server');
        }
        
        // You would call your file upload mutation here
        await addFilesMutation.mutateAsync({
          dis_num: disNum,
          files: newFiles,
        });
      }

      form.reset();
      setFiles([]);
      onSuccess();

    } catch (error: any) {
      let errorMessage = "Failed to save disbursement voucher. Please check the form data and try again.";
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage = JSON.stringify(error.response.data, null, 2);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-2xl md:max-w-3xl lg:max-w-4xl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-6">
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
                {particulars.map((_particular: ParticularItem, index: number) => (
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
                ))}
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
              />
            </div>

            {/* {errorMessage && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )} */}

            <div className="flex flex-col sm:flex-row justify-end mt-6 gap-3">
              <ConfirmationModal
                trigger={
                  <Button
                    type="button"
                    className="w-full sm:w-auto items-center gap-2 mb-5"
                    disabled={
                      addMutation.isPending
                    }
                  >
                    {addMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                }
                title="Confirm Save"
                description="Are you sure you want to save this disbursement voucher?"
                actionLabel="Confirm"
                onClick={() => {
                  form.handleSubmit(onSubmit)();
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