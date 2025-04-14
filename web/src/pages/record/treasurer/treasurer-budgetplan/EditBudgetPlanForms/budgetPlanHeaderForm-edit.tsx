import { FormInput } from "@/components/ui/form/form-input";
import { HeaderEditSchema } from "@/form-schema/budgetplanheaderandallocation-schema";
import { UseFormReturn } from "react-hook-form";
import z from "zod";

function HeaderFormEdit({ form }: {
    form: UseFormReturn<z.infer<typeof HeaderEditSchema>>
}) {
    // Split the inputs into two groups of 5 or less
    const leftColumnInputs = [
        { name: "balanceEdit", label: "Balance" },
        { name: "realtyTaxShareEdit", label: "Realty Tax Share" },
        { name: "taxAllotmentEdit", label: "National Tax Allotment" },
        { name: "clearanceAndCertFeesEdit", label: "Clearance & Certification Fees" },
        { name: "otherSpecificIncomeEdit", label: "Other Specific Income" },
    ];

    const rightColumnInputs = [
        { name: "actualIncomeEdit", label: "Actual Income" },
        { name: "actualRPTEdit", label: "Actual RPT Income" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
                {leftColumnInputs.map((input) => (
                    <FormInput
                        key={input.name}
                        control={form.control}
                        name={input.name}
                        label={input.label}
                        type="number"
                    />
                ))}
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
                {rightColumnInputs.map((input) => (
                    <FormInput
                        key={input.name}
                        control={form.control}
                        name={input.name}
                        label={input.label}
                        type="number"
                    />
                ))}
            </div>
        </div>
    );
}

export default HeaderFormEdit;