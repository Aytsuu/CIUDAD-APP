import { useQuery } from "@tanstack/react-query";
import { getInvoice } from "../request/receipt-get-request";

export type Receipt = {
    inv_num: number;
    inv_serial_num: string;
    inv_date: string;
    inv_amount: string;
    inv_nat_of_collection: string;
    inv_pay_method: string;
    inv_payor: string; // Added this field
    // Keep these if you need them separately
    payor_lname?: string;
    payor_fname?: string;
};
  
export const useInvoiceQuery = () => {
    return useQuery<Receipt[]>({
        queryKey: ["invoices"], // Changed to simpler key
        queryFn: getInvoice,
        staleTime: 1000 * 60 * 30,
    });
}