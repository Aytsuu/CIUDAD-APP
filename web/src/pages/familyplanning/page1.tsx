import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form/form";
import { SelectLayout } from "@/components/ui/select/select-layout";
import FamillyPlanningSchema from "@/form-schema/FamilyPlanningSchema";

export default function FamilyPlanningForm1() {
  const form = useForm<z.infer<typeof FamillyPlanningSchema>>({
    defaultValues: {
      clientID: "",
      philhealthNo: "",
      nhts_status: false,
      pantawid_4ps: false,
      lastName: "",
      givenName: "",
      middleInitial: "",
      dateOfBirth: "",
      age: 0,
      educationalAttainment: "",
      occupation: "",
      address: {
        houseNumber: "",
        street: "",
        barangay: "",
        municipality: "",
        province: "",
      },
      spouse: {
        s_lastName: "",
        s_givenName: "",
        s_middleInitial: "",
        s_dateOfBirth: "",
        s_age: 0,
        s_occupation: ""
      },
      numOfLivingChildren: 0,
      planToHaveMoreChildren: false,
      averageMonthlyIncome: "",
      typeOfClient: [],
      subTypeOfClient: undefined,
    },
  });

  const renderInputField = (name, label, placeholder, className) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Label>{label}</Label>
          <FormControl>
            <Input {...field} placeholder={placeholder} className={className} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderCheckboxField = (name, label) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center space-x-2">
          <Label>{label}</Label>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={() => field.onChange(!field.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderSelectField = (name, label, options) => (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <Label>{label}</Label>
          <FormControl>
            <SelectLayout
              placeholder="Choose"
              label=""
              className="custom-class border-black"
              options={options}
              value={""}
              onChange={() => { }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="flex justify-center mt-10 h-full w-full px-4">
      <div className="p-8 h-full w-full border border-gray-300 shadow-xl rounded-lg">
        <h2 className="text-3xl font-bold mb-4 border-l-4 p-4 text-center">
          Family Planning (FP) Form 1
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => console.log(data))} className="p-4 space-y-4">
            <div>
              <strong>FAMILY PLANNING CLIENT ASSESSMENT RECORD</strong>
              <p>
                Instructions for Physicians, Nurses, and Midwives.{" "}
                <strong>
                  Make sure that the client is not pregnant by using the
                  questions listed in SIDE B.
                </strong>{" "}
                Completely fill out or check the required information. Refer
                accordingly for any abnormal history/findings for further
                medical evaluation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {renderInputField("clientID", "CLIENT ID:", "", "border-black w-[250px]")}
              {renderInputField("philhealthNo", "PHILHEALTH NO:", "", "border-black w-[250px]")}
              {renderCheckboxField("nhts_status", "NHTS?")}
              {renderCheckboxField("pantawid_4ps", "Pantawid Pamilya Pilipino (4Ps)")}
            </div>

            <div className="flex grid-cols-4 gap-6 mt-10">
              {renderInputField("lastName", "NAME OF CLIENT", "Last name", "border-black w-[250px]")}
              {renderInputField("givenName", "", "Given name", "border-black w-[250px]")}
              {renderInputField("middleInitial", "", "M.I", "border-black w-[50px] mt-8")}
              {renderInputField("dateOfBirth", "Date of Birth:", "", "w-[150px] border-black")}
              {renderInputField("age", "Age", "Age", "border-black w-[50px] mt-8")}
              {renderSelectField("educationalAttainment", "Education Attainment", [
                { id: "elementary", name: "Elementary" },
                { id: "highschool", name: "High school" },
                { id: "shs", name: "Senior Highschool" },
                { id: "collegegrad", name: "College level" },
                { id: "collegelvl", name: "College Graduate" }
              ])}
              {renderInputField("occupation", "", "Occupation", "border-black w-[200px] mt-8")}
            </div>

            <div className="flex grid-cols-5 gap-6">
              {renderInputField("address.houseNumber", "ADDRESS", "No.", "border-black w-[200px]")}
              {renderInputField("address.street", "", "Street", "border-black w-[300px] mt-8")}
              {renderInputField("address.barangay", "", "Barangay", "border-black w-[250px] mt-8")}
              {renderInputField("address.municipality", "", "Municipality/City", "border-black w-[250px] mt-8")}
              {renderInputField("address.province", "", "Province", "border-black w-[200px] mt-8")}
            </div>

            <div className="flex grid-cols-4 gap-7">
              {renderInputField("spouse.s_lastName", "NAME OF SPOUSE", "Last name", "border-black w-[300px]")}
              {renderInputField("spouse.s_givenName", "", "Given name", "border-black w-[300px] mt-8")}
              {renderInputField("spouse.s_middleInitial", "", "M.I", "border-black w-[50px] mt-8")}
              {renderInputField("spouse.s_dateOfBirth", "Date of Birth:", "", "w-[150px] border-black")}
              {renderInputField("spouse.s_age", "Age", "Age", "border-black w-[100px] mt-8")}
              {renderInputField("spouse.s_occupation", "", "Occupation", "border-black w-[250px] mt-8")}
            </div>

            <div className="flex grid-cols-4 gap-7">
              {renderInputField("numOfLivingChildren", "NO. OF LIVING CHILDREN", "", "border-black w-[300px]")}
              {renderCheckboxField("planToHaveMoreChildren", "PLAN TO HAVE MORE CHILDREN?")}Yes
              {renderSelectField("averageMonthlyIncome", "AVERAGE MONTHLY INCOME", [
                { id: "5k-10k", name: "5k-10k" },
                { id: "10k-30k", name: "10k-30k" },
                { id: "30k-50k", name: "30k-50k" },
                { id: "50k-80k", name: "50k-80k" },
                { id: "80k-100k", name: "80k-100k" },
                { id: "100k-200k", name: "100k-200k" },
                { id: "Higher", name: "Higher" },
              ])}
            </div>

            <div className="grid grid-cols-3 border border-black">
              <div className="font-semibold mt-10 grid grid-cols-2">Type of Client</div>
              {["New Acceptor", "Current User"].map((type) => (
                <FormField
                  key={type}
                  control={form.control}
                  name="typeOfClient"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value === type}
                          onCheckedChange={() => {
                            field.onChange(field.value === type ? "" : type);
                            if (type === "Current User" && field.value !== type) {
                              form.setValue("subTypeOfClient", undefined);
                            }
                          }}
                        />
                      </FormControl>
                      <Label>{type}</Label>
                    </FormItem>
                  )}
                />
              ))}

              {form.watch("typeOfClient").includes("Current User") && (
                <div className="ml-6">
                  {["Changing Method", "Changing Clinic", "Dropout/Restart"].map((subType) => (
                    <FormField
                      key={subType}
                      control={form.control}
                      name="subTypeOfClient"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-1">
                          <FormControl>
                            <input
                              type="radio"
                              value={subType}
                              checked={field.value === subType}
                              onChange={() => field.onChange(subType)}
                            />
                          </FormControl>
                          <Label>{subType}</Label>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}