import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useNavigate } from "react-router";
import { Origin } from "../../ProfilingEnums";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import _ from "lodash";

export const useResidentForm = (defaultData?: any, origin?: any) => {
  const navigate = useNavigate();
  const defaultValues = generateDefaultValues(personalInfoSchema);
  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
  });

  React.useEffect(() => {
    populateFields(defaultData);
  }, [defaultData]);

  const populateFields = React.useCallback(
    (values: Record<string, any>) => {
      const resident = values;
      const newValues = {
        per_id:
          origin === Origin.Administration
            ? String(form.watch("per_id"))
            : String(resident?.per_id) || "",
        per_lname: resident?.per_lname || "",
        per_fname: resident?.per_fname || "",
        per_mname: resident?.per_mname || "",
        per_suffix: resident?.per_suffix || "",
        per_sex: resident?.per_sex || "",
        per_dob: resident?.per_dob || "",
        per_status: resident?.per_status || "",
        per_religion: resident?.per_religion || "",
        per_edAttainment: resident?.per_edAttainment || "",
        per_contact: resident?.per_contact || "",
        per_disability: resident?.per_disability || "",
        per_is_deceased: resident?.per_is_deceased === "True" ? "YES" : "NO",
        per_addresses: resident?.per_addresses || [],
      };

      form.reset(newValues, {
        keepDirty: false,
      });
    },
    [defaultData]
  );

  const normalize = (obj: any) => {
    return {
      ...obj,
      per_id: String(obj.per_id),
      per_disability: obj.per_disability ?? "",
      per_mname: obj.per_mname ?? "",
      per_suffix: obj.per_suffix ?? "",
      per_edAttainment: obj.per_edAttainment ?? "",
      per_is_deceased:
        obj.per_is_deceased == "YES"
          ? "True"
          : obj.per_is_deceased == "NO"
          ? "False"
          : obj.per_is_deceased,
    };
  };

  const checkDefaultValues = (currentValues: any, initialValues: any) => {
    const obj1 = normalize(currentValues);
    const obj2 = normalize(initialValues);
    return _.isEqual(obj1, obj2);
  };

  const handleSubmitSuccess = (
    message: string,
    redirectPath?: string,
    state?: any
  ) => {
    showSuccessToast(message);
    if (redirectPath) navigate(redirectPath, { state: state });
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
    populateFields,
  };
};
