import ComplaintReportProcess from "@/screens/request/complaint/ComplaintForm/ComplaintForm"
import { ComplaintFormProvider } from "@/contexts/ComplaintFormContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { complaintFormSchema } from "@/form-schema/complaint-schema"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import {z} from "zod"

type ComplaintForm = z.infer<typeof complaintFormSchema>;
const defaultValues = generateDefaultValues(complaintFormSchema);

export default () => {
    const methods = useForm<ComplaintForm>({
        resolver: zodResolver(complaintFormSchema),
        defaultValues,
    })

  return (
    <ComplaintFormProvider methods={methods}>
      <ComplaintReportProcess />
    </ComplaintFormProvider>
  );
}
