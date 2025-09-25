import { MediaUploadType } from "@/components/ui/media-upload";

export interface DisbursementVoucherFormProps {
  onSuccess: () => void;
  existingVoucher?: any;
}

export interface DisbursementParams {
  archive?: boolean;
  year?: string;
}

export interface DisbursementFileParams {
  archive?: boolean;
}

export interface FileMutationVariables {
  disNum: string;
  disfNum: string;
}

export interface Signatory {
  name: string;
  position: string;
  type: "certified_appropriation" | "certified_availability" | "certified_validity";
}

export type DisbursementFile = {
  disf_num: any;
  disf_name: string;
  disf_type: string;
  disf_path?: string;
  disf_url: string;
  disf_is_archive: boolean;
};

export type DisbursementVoucher = {
  dis_num: any;
  dis_payee: string;
  dis_tin: string;
  dis_date: string;
  dis_fund: number;
  dis_particulars: any[];
  dis_signatories: Signatory[];
  dis_docs: any[];
  dis_checknum: string;
  dis_bank: string;
  dis_or_num: string;
  dis_paydate: string;
  dis_payacc: any[];
  dis_is_archive: boolean;
  staff_id?: any;
  staff_name?: any;
  files?: DisbursementFile[];
};

export type DisbursementInput = {
  dis_num?: any;
  dis_payee: string;
  dis_tin: string;
  dis_date: string;
  dis_fund: any;
  dis_particulars: any[];
  dis_signatories: Signatory[];
  dis_checknum: string;
  dis_bank: string;
  dis_or_num: string;
  dis_paydate: string;
  dis_payacc: any[];
  staff?: any;
  dis_is_archive?: boolean;
};

export interface ParticularItem {
  forPayment: string;
  tax: string;
  amount: string;
  suppdocs?: MediaUploadType;
}

export interface PayAccItem {
  account: string;
  accCode: string;
  debit: string;
  credit: string;
}

export interface DisbursementFormValues {
  dis_payee: string;
  dis_tin: string;
  dis_date: string;
  dis_fund: string;
  dis_particulars: ParticularItem[];
  dis_signatories: Signatory[];
  dis_checknum: string;
  dis_bank: string;
  dis_or_num: string;
  dis_paydate: string;
  dis_payacc: PayAccItem[];
  staff?: any;
  files: MediaUploadType[];
}

export type FileInput = {
  name: string;
  type: string;
  file: string;
};

export type DisbursementFileInput = {
  dis_num: number;
  files: FileInput[];
};

export type Staff = {
  staff_id: any;
  full_name: string;
  position: string;
};

export interface DisbursementFormProps {
  onSuccess: () => void;
  existingVoucher?: DisbursementVoucher;
}

export interface EditDisbursementFormProps {
  onSuccess: (data: DisbursementVoucher) => void;
  initialValues?: DisbursementVoucher;
  isEditMode?: boolean;
  isSubmitting?: boolean;
}

export const prepareDisbursementPayload = (disbursementData: any) => {
  const payload = {
    dis_payee: disbursementData.dis_payee,
    dis_tin: disbursementData.dis_tin || "",
    dis_date: disbursementData.dis_date,
    dis_fund: disbursementData.dis_fund,
    dis_particulars: disbursementData.dis_particulars,
    dis_signatories: disbursementData.dis_signatories,
    dis_docs: disbursementData.dis_docs,
    dis_checknum: disbursementData.dis_checknum || "",
    dis_bank: disbursementData.dis_bank || "",
    dis_or_num: disbursementData.dis_or_num || "",
    dis_paydate: disbursementData.dis_paydate,
    dis_payacc: disbursementData.dis_payacc,
    staff: disbursementData.staff,
    dis_is_archive: disbursementData.dis_is_archive || false,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => {
      if (key === 'dis_particulars' || key === 'dis_docs' || key === 'dis_payacc') {
        return true;
      }
      return value !== null && value !== undefined;
    })
  );
};

export const prepareEditDisbursementPayload = (disbursementData: any) => {
  const payload = {
    dis_num: disbursementData.dis_num,
    dis_payee: disbursementData.dis_payee,
    dis_tin: disbursementData.dis_tin || "",
    dis_date: disbursementData.dis_date,
    dis_fund: disbursementData.dis_fund,
    dis_particulars: disbursementData.dis_particulars,
    dis_signatories: disbursementData.dis_signatories,
    dis_docs: disbursementData.dis_docs,
    dis_checknum: disbursementData.dis_checknum || "",
    dis_bank: disbursementData.dis_bank || "",
    dis_or_num: disbursementData.dis_or_num || "",
    dis_paydate: disbursementData.dis_paydate,
    dis_payacc: disbursementData.dis_payacc,
    staff: disbursementData.staff,
    dis_is_archive: disbursementData.dis_is_archive || false,
  };

  return payload;
};