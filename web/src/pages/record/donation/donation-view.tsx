// // import { useState } from 'react';
// // import { Input } from '@/components/ui/input';
// // import { Label } from '@/components/ui/label';
// // import { Textarea } from '@/components/ui/textarea';
// // import { Button } from '@/components/ui/button';
// // import { SelectLayout } from '@/components/ui/select/select-layout';
// // import { zodResolver } from '@hookform/resolvers/zod';
// // import { useForm } from 'react-hook-form';
// // import { z } from 'zod';
// // import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form/form';
// // import ClerkDonateViewSchema from '@/form-schema/donate-view-schema';

// // function ClerkDonateView() {
// //     const [isEditing, setIsEditing] = useState(false); // State to track edit mode
// //     const form = useForm<z.infer<typeof ClerkDonateViewSchema>>({
// //         resolver: zodResolver(ClerkDonateViewSchema),
// //         defaultValues: {
// //             donorName: '',
// //             donItemname: '',
// //             donItemqty: '',
// //             donItemcategory:'',
// //             donReceiver:'',
// //             donItemDescription: '',
// //         },
// //     });

// //     const onSubmit = (values: z.infer<typeof ClerkDonateViewSchema>) => {
// //         console.log(values);
// //         // Handle form submission (e.g., send data to the server)
// //         // After saving, you can toggle back to read-only mode
// //         setIsEditing(false);
// //     };

// //     return (
// //         <Form {...form}>
// //             <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto">
// //                 <Label className="text-lg font-semibold leading-none tracking-tight text-darkBlue1">DONATION DETAILS</Label>

// //                 <FormField
// //                     control={form.control}
// //                     name="donorName"
// //                     render={({ field }) => (
// //                         <FormItem>
// //                             <Label>Donor:</Label>
// //                             <FormControl>
// //                                 <Input placeholder="Enter donor's name" {...field} readOnly={!isEditing} />
// //                             </FormControl>
// //                             <FormMessage />
// //                         </FormItem>
// //                     )}
// //                 /><br/>

// //                 <FormField
// //                     control={form.control}
// //                     name="donItemname"
// //                     render={({ field }) => (
// //                         <FormItem>
// //                             <Label>Item Name:</Label>
// //                             <FormControl>
// //                                 <Input placeholder='Enter item name' {...field} readOnly={!isEditing} />
// //                             </FormControl>
// //                             <FormMessage />
// //                         </FormItem>
// //                     )}
// //                 /><br/>

// //                 <FormField
// //                     control={form.control}
// //                     name="donItemqty"
// //                     render={({ field }) => (
// //                         <FormItem>
// //                             <Label>Quantity:</Label>
// //                             <FormControl>
// //                                 <Input placeholder='Enter quantity' {...field} readOnly={!isEditing} />
// //                             </FormControl>
// //                             <FormMessage />
// //                         </FormItem>
// //                     )}
// //                 /><br/>

// //                 <FormField
// //                     control={form.control}
// //                     name="donItemcategory"
// //                     render={({ field }) => (
// //                         <FormItem>
// //                             <Label>Category:</Label>
// //                             <FormControl>
// //                                 {/* <SelectLayout className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
// //                                     label=""
// //                                     placeholder="Select Item Category"
// //                                     options={[
// //                                         { id: 'Category 1', name: 'Category 1' },
// //                                         { id: 'Category 2', name: 'Category 2' }
// //                                     ]}
// //                                     value={field.value || ''}
// //                                     onChange={field.onChange}
// //                                 /> */}
// //                                 {isEditing ? (
// //                                     <SelectLayout 
// //                                         className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
// //                                         label=""
// //                                         placeholder="Select Item Category"
// //                                         options={[
// //                                             { id: 'Category 1', name: 'Category 1' },
// //                                             { id: 'Category 2', name: 'Category 2' }
// //                                         ]}
// //                                         value={field.value || ''}
// //                                         onChange={field.onChange}
// //                                     />
// //                                 ) : (
// //                                     <div className="flex items-center h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base">
// //                                         {field.value || 'No category selected'}
// //                                     </div>
// //                                 )}
// //                             </FormControl>
// //                             <FormMessage />
// //                         </FormItem>
// //                     )}
// //                 /><br/>

// //                 <FormField
// //                     control={form.control}
// //                     name="donReceiver"
// //                     render={({ field }) => (
// //                         <FormItem>
// //                             <Label>Donation Received By:</Label>
// //                             <FormControl>
// //                                 {/* <SelectLayout className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
// //                                     label=""
// //                                     placeholder="Select employee name who received the donation"
// //                                     options={[
// //                                         { id: 'Employee 1', name: 'Employee 1' },
// //                                         { id: 'Employee 2', name: 'Employee 2' }
// //                                     ]}
// //                                     value={field.value || ''}
// //                                     onChange={field.onChange}
// //                                 /> */}
// //                                 {isEditing ? (
// //                                     <SelectLayout 
// //                                         className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
// //                                         label=""
// //                                         placeholder="Select employee name who received the donation"
// //                                         options={[
// //                                             { id: 'Employee 1', name: 'Employee 1' },
// //                                             { id: 'Employee 2', name: 'Employee 2' }
// //                                         ]}
// //                                         value={field.value || ''}
// //                                         onChange={field.onChange}
// //                                     />
// //                                 ) : (
// //                                     <div className="flex items-center h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base">
// //                                         {field.value || 'No receiver selected'}
// //                                     </div>
// //                                 )}
// //                             </FormControl>
// //                             <FormMessage />
// //                         </FormItem>
// //                     )}
// //                 /><br/>

// //                 <FormField
// //                     control={form.control}
// //                     name="donItemDescription"
// //                     render ={({ field }) => (
// //                         <FormItem>
// //                             <Label>Item Description:</Label>
// //                             <FormControl>
// //                                 <Textarea placeholder='Enter item description' {...field} readOnly={!isEditing} />
// //                             </FormControl>
// //                             <FormMessage />
// //                         </FormItem>
// //                     )}
// //                 /><br/>

// //                 <div className="flex items-center justify-end">
// //                     <Button type="button" onClick={() => setIsEditing(!isEditing)} className="bg-blue hover:bg-blue hover:opacity-[95%]">
// //                         {isEditing ? 'Save' : 'Edit'}
// //                     </Button>
// //                 </div>
// //             </form>
// //         </Form>
// //     );
// // }

// // export default ClerkDonateView;

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { Form } from '@/components/ui/form/form';
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormSelect } from '@/components/ui/form/form-select';
// import { FormDateInput } from '@/components/ui/form/form-date-input';
// import ClerkDonateViewSchema from '@/form-schema/donate-view-schema';

// function ClerkDonateView() {
//     const [isEditing, setIsEditing] = useState(false); // State to track edit mode
//     const form = useForm<z.infer<typeof ClerkDonateViewSchema>>({
//         resolver: zodResolver(ClerkDonateViewSchema),
//         defaultValues: {
//             don_donorfname: '', // Donor first name
//             don_donorlname: '', // Donor last name
//             don_item_name: '', // Item name
//             don_qty: '', // Quantity
//             don_description: '', // Description
//             don_category: '', // Category
//             don_receiver: '', // Receiver
//             don_date: new Date().toISOString().split('T')[0], // Default to today's date
//         },
//     });

//     const onSubmit = (values: z.infer<typeof ClerkDonateViewSchema>) => {
//         console.log(values);
//         // Handle form submission (e.g., send data to the server)
//         // After saving, toggle back to read-only mode
//         setIsEditing(false);
//     };

//     return (
//         <div className="flex flex-col min-h-0 h-auto p-6 max-w-4xl mx-auto rounded-lg overflow-auto">
//             <div className="pb-4">
//                 <h2 className="text-lg font-semibold">DONATION DETAILS</h2>
//                 <p className="text-xs text-black/50">View or edit donation details</p>
//             </div>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
//                     {/* Donor First Name */}
//                     <FormInput
//                         control={form.control}
//                         name="don_donorfname"
//                         label="Donor First Name"
//                         placeholder="Enter donor's first name"
//                         readOnly={!isEditing}
//                     />

//                     {/* Donor Last Name */}
//                     <FormInput
//                         control={form.control}
//                         name="don_donorlname"
//                         label="Donor Last Name"
//                         placeholder="Enter donor's last name"
//                         readOnly={!isEditing}
//                     />

//                     {/* Item Name */}
//                     <FormInput
//                         control={form.control}
//                         name="don_item_name"
//                         label="Item Name"
//                         placeholder="Enter item name"
//                         readOnly={!isEditing}
//                     />

//                     {/* Quantity */}
//                     <FormInput
//                         control={form.control}
//                         name="don_qty"
//                         label="Quantity"
//                         placeholder="Enter quantity"
//                         readOnly={!isEditing}
//                     />

//                     {/* Category */}
//                     <FormSelect
//                         control={form.control}
//                         name="don_category"
//                         label="Category"
//                         options={[
//                             { id: "Monetary Donations", name: "Monetary Donations" },
//                             { id: "Essential Goods", name: "Essential Goods" },
//                             { id: "Medical Supplies", name: "Medical Supplies" },
//                             { id: "Household Items", name: "Household Items" },
//                             { id: "Educational Supplies", name: "Educational Supplies" },
//                             { id: "Baby & Childcare Items", name: "Baby & Childcare Items"},
//                             { id: "Animal Welfare Items", name: "Animal Welfare Items" },
//                             { id: "Shelter & Homeless Aid", name: "Shelter & Homeless Aid"},
//                             { id: "Disaster Relief Supplies", name: "Disaster Relief Supplies"},
//                         ]}
//                         readOnly={!isEditing}
//                     />

//                     {/* Receiver */}
//                     <FormSelect
//                         control={form.control}
//                         name="don_receiver"
//                         label="Received by"
//                         options={[
//                             { id: 'Employee 1', name: 'Employee 1' },
//                             { id: 'Employee 2', name: 'Employee 2' },
//                         ]}
//                         readOnly={!isEditing}
//                     />

//                     {/* Item Description */}
//                     <FormInput
//                         control={form.control}
//                         name="don_description"
//                         label="Item Description"
//                         placeholder="Enter item description"
//                         readOnly={!isEditing}
//                     />

//                     {/* Donation Date */}
//                     <FormDateInput
//                         control={form.control}
//                         name="don_date"
//                         label="Donation Date"
//                         readOnly={!isEditing}
//                     />

//                     {/* Edit/Save Button */}
//                     <div className="mt-8 flex justify-end gap-3">
//                         <Button
//                             type="button"
//                             onClick={() => setIsEditing(!isEditing)}
//                             className="bg-buttonBlue hover:bg-buttonBlue/90"
//                         >
//                             {isEditing ? 'Save' : 'Edit'}
//                         </Button>
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }

// export default ClerkDonateView;

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form/form';
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from '@/components/ui/form/form-select';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import ClerkDonateViewSchema from '@/form-schema/donate-view-schema';
import { putdonationreq } from './request-db/donationPutRequest';

type ClerkDonateViewProps = {
    don_num: number;
    don_donorfname: string;
    don_donorlname: string;
    don_item_name: string;
    don_qty: number;
    don_category: string;
    don_receiver: string;
    don_description?: string;
    don_date: string;
    onSaveSuccess?: () => void;
  };

function ClerkDonateView({
  don_num,
  don_donorfname,
  don_donorlname,
  don_item_name,
  don_qty,
  don_category,
  don_receiver,
  don_description,
  don_date,
  onSaveSuccess,
}: ClerkDonateViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ClerkDonateViewSchema>>({
    resolver: zodResolver(ClerkDonateViewSchema),
    defaultValues: {
      don_donorfname,
      don_donorlname,
      don_item_name,
      don_qty,
      don_category,
      don_receiver,
      don_description,
      don_date,
    },
  });

  const onSubmit = async (values: z.infer<typeof ClerkDonateViewSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      console.log("Submitting:", { don_num, values }); 
      // Call the PUT API
      await putdonationreq(don_num, values);
      
      // On successful update
      setIsEditing(false);
      if (onSaveSuccess) onSaveSuccess(); // Refresh parent data if needed
      
    } catch (err) {
      console.error("Update failed:", err);
      setError(err instanceof Error ? err.message : "Failed to update donation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-6 max-w-4xl mx-auto rounded-lg overflow-auto">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">DONATION DETAILS</h2>
        <p className="text-xs text-black/50">View or edit donation details</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Donor First Name */}
          <FormInput
            control={form.control}
            name="don_donorfname"
            label="Donor First Name"
            placeholder="Enter donor's first name"
            readOnly={!isEditing}
          />

          {/* Donor Last Name */}
          <FormInput
            control={form.control}
            name="don_donorlname"
            label="Donor Last Name"
            placeholder="Enter donor's last name"
            readOnly={!isEditing}
          />

          {/* Item Name */}
          <FormInput
            control={form.control}
            name="don_item_name"
            label="Item Name"
            placeholder="Enter item name"
            readOnly={!isEditing}
          />

          {/* Quantity */}
          <FormInput
            control={form.control}
            name="don_qty"
            label="Quantity"
            placeholder="Enter quantity"
            readOnly={!isEditing}
          />

          {/* Category */}
          <FormSelect
            control={form.control}
            name="don_category"
            label="Category"
            options={[
              { id: "Monetary Donations", name: "Monetary Donations" },
              { id: "Essential Goods", name: "Essential Goods" },
              { id: "Medical Supplies", name: "Medical Supplies" },
              { id: "Household Items", name: "Household Items" },
              { id: "Educational Supplies", name: "Educational Supplies" },
              { id: "Baby & Childcare Items", name: "Baby & Childcare Items"},
              { id: "Animal Welfare Items", name: "Animal Welfare Items" },
              { id: "Shelter & Homeless Aid", name: "Shelter & Homeless Aid"},
              { id: "Disaster Relief Supplies", name: "Disaster Relief Supplies"},
            ]}
            readOnly={!isEditing}
          />

          {/* Receiver */}
          <FormSelect
            control={form.control}
            name="don_receiver"
            label="Received by"
            options={[
              { id: 'Employee 1', name: 'Employee 1' },
              { id: 'Employee 2', name: 'Employee 2' },
            ]}
            readOnly={!isEditing}
          />

          {/* Item Description */}
          <FormInput
            control={form.control}
            name="don_description"
            label="Item Description"
            placeholder="Enter item description"
            readOnly={!isEditing}
          />

          {/* Donation Date */}
          <FormDateInput
            control={form.control}
            name="don_date"
            label="Donation Date"
            readOnly={!isEditing}
          />

          {/* Edit/Save Button */}
          <div className="mt-8 flex justify-end gap-3">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                    setError(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-buttonBlue hover:bg-buttonBlue/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-buttonBlue hover:bg-buttonBlue/90"
              >
                Edit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ClerkDonateView;