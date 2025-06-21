import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { accountFormSchema } from "@/form-schema/account-schema"
import AccountRegistrationForm from "./AccountRegistrationForm";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import React from "react";
import { Card } from "@/components/ui/card/card";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { useAddAccount } from "./queries/accountAddQueries";
import { useAddAccountHealth } from "./queries/accountAddQueries";
import { useLocation } from "react-router";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";
import { accountCreated } from "@/redux/addRegSlice";
import { useDispatch } from "react-redux";

export default function AccountRegistrationLayout() {
  const { safeNavigate } = useSafeNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const params = React.useMemo(()=> location.state?.params, [location.state])
  const residentId = React.useMemo(()=> params.residentId, [params]);
  const { mutateAsync: addAccount } = useAddAccount();
  const { mutateAsync: addAccountHealth } = useAddAccountHealth();
  
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const defaultValues = React.useRef(generateDefaultValues(accountFormSchema._def.schema)).current;
  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  });

  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();
    if (!formIsValid) {
      setIsSubmitting(false);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
      return;
    }
  
    const accountInfo = form.getValues();
  
    try {
      // First, add to the main account DB
      await addAccount({
        accountInfo,
        residentId
      });
  
      // Then, add to the health DB
      await addAccountHealth({
        accountInfo,
        residentId
      });
  
      dispatch(accountCreated(true));
      safeNavigate.back();
    } catch (error) {
      toast("Failed to create account. Please try again.", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="W-full flex justify-center">
      <Card className="w-1/3 p-10">
        <MainLayoutComponent
          title="Account Registration"
          description="Please fill out the form below to register an account."
        >
          <Form {...form}>
            <form className="grid gap-8">
              <AccountRegistrationForm 
                form={form} 
                isSubmitting={isSubmitting}
                onSubmit={submit} 
              />
            </form>
          </Form>
        </MainLayoutComponent>
      </Card>
    </div>
  );
}