import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useNavigate } from "react-router";
import { Origin } from "../../ProfilingEnums";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useResidentForm = (defaultData?: any, origin?: any) => {
  const navigate = useNavigate();
  const { isDeepStrictEqual } = require('node:util');
  const defaultValues = generateDefaultValues(personalInfoSchema);
  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
  });

  React.useEffect(() => {
    populateFields(defaultData);
  }, [defaultData])

  const populateFields = React.useCallback((values: Record<string, any>) => {
    const resident = values;
    const fields = [
      { key: "per_id",
        value:
          origin === Origin.Administration
            ? String(form.watch("per_id"))
            : String(resident?.per_id) || "",
      },
      { key: "per_lname", value: resident?.per_lname || "" },
      { key: "per_fname", value: resident?.per_fname || "" },
      { key: "per_mname", value: resident?.per_mname || "" },
      { key: "per_suffix", value: resident?.per_suffix || "" },
      { key: "per_sex", value: resident?.per_sex || "" },
      { key: "per_dob", value: resident?.per_dob || "" },
      { key: "per_status", value: resident?.per_status|| ""  },
      { key: "per_religion", value: resident?.per_religion || "" },
      { key: "per_edAttainment", value: resident?.per_edAttainment || "" },
      { key: "per_contact", value: resident?.per_contact || "" },
      { key: "per_disability", value: resident?.per_disability || "" },
      { key: "per_addresses", value: resident?.per_addresses || [] },
    ];

    fields.map((f: any) => {
      form.setValue(f.key , f.value);
    });

  },[defaultData]);

  const normalize = (obj: any) => {
    return {
      ...obj,
      per_id: String(obj.per_id),
      per_mname: obj.per_mname ?? "",
      per_suffix: obj.per_suffix ?? "",
      per_edAttainment: obj.per_edAttainment ?? "",
    }
  }

  const checkDefaultValues = (currentValues: any, initialValues: any) => {
    const obj1 = normalize(currentValues)
    const obj2 = normalize(initialValues)
    return isDeepStrictEqual(obj1, obj2)
  };

  const handleSubmitSuccess = (message: string, redirectPath?: string, state?: any) => {
    showSuccessToast(message);
    if (redirectPath) navigate(redirectPath, {state: state});
  };

  const handleSubmitError = (message: string) => {
    showErrorToast(message);
  };

  return {
    form,
    defaultValues,
    checkDefaultValues,
    handleSubmitSuccess,
    handleSubmitError,
    populateFields
  };
};