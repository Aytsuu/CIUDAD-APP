// import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
// import { Button } from "@/components/ui/button/button";
// import { Input } from "@/components/ui/input";
// import BudgetHeaderSchema from "@/form-schema/budgetplan-header-schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod"
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import BudgetAllocationSchema from "@/form-schema/budget-allocation-schema";
// import BudgetAllocationForm from "./treasurer_budget_allocation_form";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { useState } from "react";

// function CreateBudgetPlanHeader(){
//     const navigate = useNavigate();
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [showHeaderForm, setShowHeaderForm] = useState(true);
//     const [ formValues, setFormValues] = useState<z.infer<typeof BudgetHeaderSchema>>();

//     const form = useForm<z.infer<typeof BudgetHeaderSchema>>({
//         resolver: zodResolver(BudgetHeaderSchema),
//         defaultValues:{
//             balance: "",
//             realtyTaxShare: "",
//             taxAllotment: "",
//             clearanceAndCertFees: "",
//             otherSpecificIncome: "",
//             actualIncome: "",
//             actualRPT: ""
//         }
//     })

//     const onSubmit = (values: z.infer<typeof BudgetHeaderSchema>) => {
//         setFormValues(values);
//         setShowHeaderForm(false);
//         setIsDialogOpen(true); 
//         // navigate("/treasurer-budgetplan-form", {state : values});
//     }

//     const handleFinalSubmit = (allocationValues: z.infer<typeof BudgetAllocationSchema>) => {
//         if (!formValues) return;
        
//         const completeData = {
//           ...formValues,
//           ...allocationValues
//         };

//         navigate("/treasurer-budgetplan-form", {state : completeData});
        
//         console.log("Complete submission:", completeData);
//         setIsDialogOpen(false);
//         setShowHeaderForm(false); 
//       };

//     const handleDialogClose = () => {
//         setIsDialogOpen(false);
//         setShowHeaderForm(true); 
//     };
    
//     return(
//         <>
//          {showHeaderForm && (
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)}>
//                     <div className="flex flex-col gap-4">
//                     <FormField
//                         control={form.control}
//                         name="balance"
//                         render={({field}) =>(
//                             <FormItem>
//                                 <FormLabel>Balance</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type='number' placeholder="Enter NET Available Resources"></Input>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                     )}></FormField>

//                     <FormField
//                         control={form.control}
//                         name="realtyTaxShare"
//                         render={({field}) =>(
//                             <FormItem>
//                                 <FormLabel>Realty Tax Share</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type='number' placeholder="Enter NET Available Resources"></Input>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>

//                         <FormField
//                         control={form.control}
//                         name="taxAllotment"
//                         render={({field}) =>(
//                             <FormItem>
//                                 <FormLabel>National Tax Allotment</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type='number' placeholder="Enter NET Available Resources"></Input>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>

//                         <FormField
//                         control={form.control}
//                         name="clearanceAndCertFees"
//                         render={({field}) =>(
//                             <FormItem>
//                                 <FormLabel>Clearance & Certification Fees</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type='number' placeholder="Enter NET Available Resources"></Input>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>

//                         <FormField
//                         control={form.control}
//                         name="otherSpecificIncome"
//                         render={({field}) =>(
//                             <FormItem>
//                                 <FormLabel>Other Specific Income</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type='number' placeholder="Enter NET Available Resources"></Input>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>

//                         <FormField
//                         control={form.control}
//                         name="actualIncome"
//                         render={({field}) =>(
//                             <FormItem>
//                                 <FormLabel>Actual Income</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type="number" placeholder="Enter Actual Income" ></Input>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>

//                         <FormField
//                         control={form.control}
//                         name="actualRPT"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Actual RPT Income</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type='number' placeholder="Enter Actual RPT Income"></Input>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>
//                     </div>

//                     <div className="flex justify-end mt-[20px]"> 
//                         <Button type="submit">Proceed</Button>
//                     </div>
//                 </form>
//             </Form>)}
        
//             <DialogLayout
//             isOpen={isDialogOpen}
//             onOpenChange={(open) => {
//                 if (!open) handleDialogClose();
//                 else setIsDialogOpen(open);
//             }}
//             title="Budget Allocation Form"
//             description="Allocate percentages for each budget category, ensuring the total does not exceed 100%."
//             mainContent={
//                 formValues ? ( 
//                 <div> 
//                     <BudgetAllocationForm headerValues={formValues} onFinalSubmit={handleFinalSubmit} setIsDialogOpen = {setIsDialogOpen} />
//                 </div>
//                 ) : (
//                 <div /> 
//                 )
//             }
//             />

//         </>
//     )
// }

// export default CreateBudgetPlanHeader	


// import { FormField, Form, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form/form";
// import { Button } from "@/components/ui/button/button";
// import BudgetAllocationSchema from "@/form-schema/budget-allocation-schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { Input } from "@/components/ui/input";
// import { z } from "zod";
// import BudgetHeaderSchema from "@/form-schema/budgetplan-header-schema";

// interface BudgetAllocationFormProps {
//     headerValues: z.infer<typeof BudgetHeaderSchema>; // Just pass them as props
//     onFinalSubmit: (allocationValues: z.infer<typeof BudgetAllocationSchema>) => void;
//     setIsDialogOpen: (isOpen: boolean) => void;
// }

// function BudgetAllocationForm({ headerValues, onFinalSubmit, setIsDialogOpen}: BudgetAllocationFormProps) {
//     const form = useForm<z.infer<typeof BudgetAllocationSchema>>({
//         resolver: zodResolver(BudgetAllocationSchema),
//         defaultValues: {
//             personalServicesLimit: "",
//             miscExpenseLimit: "",
//             localDevLimit: "",
//             skFundLimit: "",
//             calamityFundLimit: "",
//         }
//     });

//     const onSubmit = (values: z.infer<typeof BudgetAllocationSchema>) => {
//         onFinalSubmit(values);
//         setIsDialogOpen(false);
//     };

//     return (
//         <>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)}>
//                     <div className="flex flex-col gap-4">
//                         <FormField
//                             control={form.control}
//                             name="personalServicesLimit"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Personal Services</FormLabel>
//                                     <FormControl>
//                                         <Input {...field} type="number" placeholder="0" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />

//                         <FormField
//                             control={form.control}
//                             name="miscExpenseLimit"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Extraordinary & Miscellaneous Expense</FormLabel>
//                                     <FormControl>
//                                         <Input {...field} type="number" placeholder="0" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />

//                         <FormField
//                             control={form.control}
//                             name="localDevLimit"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Local Development Fund</FormLabel>
//                                     <FormControl>
//                                         <Input {...field} type="number" placeholder="0" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />

//                         <FormField
//                             control={form.control}
//                             name="skFundLimit"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>SK Fund</FormLabel>
//                                     <FormControl>
//                                         <Input {...field} type="number" placeholder="0" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />

//                         <FormField
//                             control={form.control}
//                             name="calamityFundLimit"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Calamity Fund</FormLabel>
//                                     <FormControl>
//                                         <Input {...field} type="number" placeholder="0" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />

//                         <div className="flex justify-end mt-[20px]">
//                             <Button type="submit">Proceed</Button>
//                         </div>
//                     </div>
//                 </form>
//             </Form>
//         </>
//     );
// }

// export default BudgetAllocationForm;





