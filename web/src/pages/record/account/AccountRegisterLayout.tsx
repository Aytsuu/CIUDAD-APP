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

export default function AccountRegistrationLayout() {
  const defaultValues = React.useRef(
    generateDefaultValues(accountFormSchema)
  ).current;
  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  });

  const submit = React.useCallback(async () => {}, []);

  return (
    <div className="W-full flex justify-center">
      <Card className="w-1/3 p-10">
        <MainLayoutComponent
          title="Account Registration"
          description="Please fill out the form below to register an account."
        >
          <Form {...form}>
            <form className="grid gap-8">
              <AccountRegistrationForm form={form} onSubmit={submit} />
            </form>
          </Form>
        </MainLayoutComponent>
      </Card>
    </div>
  );
}
