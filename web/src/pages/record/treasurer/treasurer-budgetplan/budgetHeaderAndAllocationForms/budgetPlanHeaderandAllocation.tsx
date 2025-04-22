import { useState, useReducer, useEffect } from 'react';
import { FormField, Form, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import BudgetAllocationSchema from "@/form-schema/treasurer/budget-allocation-schema";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import BudgetHeaderSchema from "@/form-schema/treasurer/budgetplan-header-schema";
import { UseFormReturn } from "react-hook-form";
import { MainLayoutComponent } from '@/components/ui/layout/main-layout-component';
import { Card } from '@/components/ui/card/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ChevronLeft } from 'lucide-react';

interface HeaderAndAllocationFormProps {
  headerForm: UseFormReturn<z.infer<typeof BudgetHeaderSchema>>;
  allocationForm: UseFormReturn<z.infer<typeof BudgetAllocationSchema>>;
  onSubmit: () => void;
  isEdit: boolean;
  editId?: string;
  onExit: () => void;
}

function HeaderAndAllocationForm({ headerForm, allocationForm, onSubmit, isEdit, editId, onExit
}: HeaderAndAllocationFormProps) {
  const [showAllocation, setShowAllocation] = useState(false);

  useEffect(() => {
    console.log("showAllocation state updated to:", showAllocation);
  }, [showAllocation]);

  const handleHeaderSubmit = (values: z.infer<typeof BudgetHeaderSchema>) => {
    console.log("Setting showAllocation to true");
    setShowAllocation(true);
  };

  const handleAllocationSubmit = (values: z.infer<typeof BudgetAllocationSchema>) => {
    onSubmit(); 
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    console.log("Back button clicked - setting showAllocation to false");
    setShowAllocation(false);
  };

  const formText = {
    mainTitle: isEdit ? 'Edit Budget Header & Allocation' : 'Create Budget Header & Allocation',
    mainDescription: isEdit 
        ? 'Modify the budget header information and allocation percentages.' 
        : 'Set up the initial budget header information and allocation percentages.',
        
    headerForm: {
        title: 'Budget Header',
        description: isEdit 
            ? 'Update the budget plan header information' 
            : 'Enter the budget plan header information'
    },
    
    allocationForm: {
        title: 'Budget Allocation (%)',
        description: isEdit
            ? 'Adjust budget allocation percentages'
            : 'Set initial budget allocation percentages'
    },
};


  return (
    <div>
        {/* Header Title */}
            <div className="flex flex-col mb-3">
                <div className='flex flex-row gap-4'>
                    <ConfirmationModal
                        trigger={
                            <Button className="text-black p-2 self-start" variant={"outline"}>
                                <ChevronLeft />
                            </Button>
                        }
                        title="Unsaved Changes"
                        description={
                            isEdit 
                            ? "Are you sure you want to go back? All changes made will not be saved." 
                            : "Are you sure you want to go back? All progress on your budget plan will be lost."
                        }
                        actionLabel="Confirm"
                        onClick={onExit}
                    />
                    {/* Form Main title */}
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                        <div>{formText.mainTitle}</div>
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-darkGray ml-[3.2rem]">
                    {formText.mainDescription}
                </p>
            </div>
            <hr className="border-gray mb-5 sm:mb-5" /> 

            <div className="px-10">
            {!showAllocation ? (
                // Budget Header Form
                    <Form {...headerForm}>
                        <form onSubmit={headerForm.handleSubmit(handleHeaderSubmit)} className="space-y-3">
                            <Card className="p-8 relative">
                                <MainLayoutComponent title={formText.headerForm.title} description={formText.headerForm.description}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <FormField
                                            control={headerForm.control}
                                            name="balance"
                                            render={({field}) =>(
                                                <FormItem>
                                                <FormLabel className="text-black">Balance From Previous Year</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type='number' placeholder="0.00" />
                                                </FormControl>
                                                <FormMessage/>
                                                </FormItem>
                                            )}
                                            />

                                            <FormField
                                            control={headerForm.control}
                                            name="realtyTaxShare"
                                            render={({field}) =>(
                                                <FormItem>
                                                <FormLabel className="text-black">Realty Tax Share</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type='number' placeholder="0.00" />
                                                </FormControl>
                                                <FormMessage/>
                                                </FormItem>
                                            )}
                                            />

                                            <FormField
                                            control={headerForm.control}
                                            name="taxAllotment"
                                            render={({field}) =>(
                                                <FormItem>
                                                <FormLabel className="text-black">National Tax Allotment</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type='number' placeholder="0.00" />
                                                </FormControl>
                                                <FormMessage/>
                                                </FormItem>
                                            )}
                                            />

                                            <FormField
                                            control={headerForm.control}
                                            name="clearanceAndCertFees"
                                            render={({field}) =>(
                                                <FormItem>
                                                <FormLabel className="text-black">Clearance & Certification Fees</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type='number' placeholder="0.00" />
                                                </FormControl>
                                                <FormMessage/>
                                                </FormItem>
                                            )}
                                            />

                                            <FormField
                                            control={headerForm.control}
                                            name="otherSpecificIncome"
                                            render={({field}) =>(
                                                <FormItem>
                                                <FormLabel className="text-black">Other Specific Income</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type='number' placeholder="0.00" />
                                                </FormControl>
                                                <FormMessage/>
                                                </FormItem>
                                            )}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <FormField
                                            control={headerForm.control}
                                            name="actualIncome"
                                            render={({field}) =>(
                                                <FormItem>
                                                <FormLabel className="text-black">Actual Income</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" placeholder="0.00" />
                                                </FormControl>
                                                <FormMessage/>
                                                </FormItem>
                                            )}
                                            />

                                            <FormField
                                            control={headerForm.control}
                                            name="actualRPT"
                                            render={({field}) => (
                                                <FormItem>
                                                <FormLabel className="text-black">Actual RPT Income</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type='number' placeholder="0.00" />
                                                </FormControl>
                                                <FormMessage/>
                                                </FormItem>
                                            )}
                                            />
                                        </div>
                                    </div>
                                </MainLayoutComponent>
                            </Card>

                            <div className="flex justify-end gap-4">
                                {/* <Button type="button" variant="outline" onClick={onExit}>
                                    Cancel
                                </Button> */}
                                <Button type="submit">Next</Button>
                            </div>
                        </form>
                    </Form>
            ) : (
                // Budget Allocation Form
                <Form {...allocationForm}>
                    <form onSubmit={allocationForm.handleSubmit(handleAllocationSubmit)} className="space-y-3">
                        <Card className="p-8 relative">
                            <MainLayoutComponent title={formText.allocationForm.title} description={formText.allocationForm.description}>
                                <div className="flex flex-col gap-4">
                                    <FormField
                                        control={allocationForm.control}
                                        name="personalServicesLimit"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black">Personal Services</FormLabel>
                                            <FormControl>
                                            <Input {...field} type="number" placeholder="0.0" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={allocationForm.control}
                                        name="miscExpenseLimit"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black">Extraordinary & Miscellaneous Expense</FormLabel>
                                            <FormControl>
                                            <Input {...field} type="number" placeholder="0.0" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={allocationForm.control}
                                        name="localDevLimit"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black">Local Development Fund</FormLabel>
                                            <FormControl>
                                            <Input {...field} type="number" placeholder="0.0" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={allocationForm.control}
                                        name="skFundLimit"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black">Sangguniang Kabataan (SK) Fund</FormLabel>
                                            <FormControl>
                                            <Input {...field} type="number" placeholder="0.0" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={allocationForm.control}
                                        name="calamityFundLimit"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black">Calamity Fund</FormLabel>
                                            <FormControl>
                                            <Input {...field} type="number" placeholder="0.0" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                            </MainLayoutComponent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={handleBackClick}>
                                Back
                            </Button>
                            <Button type="submit">Proceed to Budget Plan</Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    </div>
  );
}

export default HeaderAndAllocationForm;