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
} from "@/components/ui/form";
import { SelectLayout } from "@/components/ui/select/select-layout";
import FamillyPlanningSchema from "@/form-schema/FamilyPlanningSchema";

export default function FamilyPlanningForm() {
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
              {/* Client Information */}
              <FormField
                control={form.control} name="clientID" render={({ field }) => (
                  <FormItem>
                    <Label>CLIENT ID:</Label>
                    <FormControl>
                      <Input {...field} className="border-black w-[250px]grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="philhealthNo" render={({ field }) => (
                  <FormItem>
                    <Label>PHILHEALTH NO:</Label>
                    <FormControl>
                      <Input {...field} className="border-black w-[250px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NHTS Checkbox */}
              <FormField control={form.control} name="nhts_status" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <Label className="mt-2">NHTS?</Label>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={() => field.onChange(true)}
                    />
                  </FormControl>
                  <Label>Yes</Label>
                  <FormControl>
                    <Checkbox
                      checked={!field.value}
                      onCheckedChange={() => field.onChange(false)}
                    />
                  </FormControl>
                  <Label>No</Label>
                  <FormMessage />
                </FormItem>
              )}
              />

              {/* Pantawid 4Ps Checkbox */}
              <FormField control={form.control} name="pantawid_4ps" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <Label className="mt-3">Pantawid Pamilya Pilipino (4Ps)</Label>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={() => field.onChange(true)}
                    />
                  </FormControl>
                  <Label>Yes</Label>
                  <FormControl>
                    <Checkbox
                      checked={!field.value}
                      onCheckedChange={() => field.onChange(false)}
                    />
                  </FormControl>
                  <Label>No</Label>
                  <FormMessage />
                </FormItem>
              )}
              />
            </div>

            <div className="flex grid-cols-4 gap-6 mt-10 ">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <Label>NAME OF CLIENT</Label>
                    <FormControl>
                      <Input {...field} placeholder="Last name" className="border-black w-[250px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="givenName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Given name" className="border-black w-[250px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middleInitial"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="M.I" className="border-black w-[50px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <Label>Date of Birth:</Label>
                    <FormControl>
                      <Input type="date" {...field} className="w-[150px] border-black" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"

                render={({ field }) => (
                  <FormItem>
                    <Label>Age</Label>
                    <FormControl>
                      <Input {...field} placeholder="Age" className="border-black w-[50px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="educationalAttainment"
                render={() => (
                  <FormItem>
                    <Label>Education Attainment</Label>
                    <FormControl>
                      <SelectLayout
                        placeholder="Choose"
                        label=""
                        className="custom-class border-black"
                        options={[
                          { id: "elementary", name: "Elementary" },
                          { id: "highschool", name: "High school" },
                          { id: "shs", name: "Senior Highschool" },
                          { id: "collegegrad", name: "College level" },
                          { id: "collegelvl", name: "College Graduate" }
                        ]}
                        value={""}
                        onChange={() => { }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 mt-8">
                    <FormControl>
                      <Input {...field} placeholder="Occupation" className="border-black w-[200px] " />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex grid-cols-5 gap-6">
              <FormField
                control={form.control}
                name="address.houseNumber"
                render={({ field }) => (
                  <FormItem>
                    <Label>ADDRESS</Label>
                    <FormControl>
                      <Input {...field} placeholder="No." className="border-black w-[200px] " />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Street" className="border-black w-[300px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.barangay"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Barangay" className="border-black w-[250px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.municipality"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Municipality/City" className="border-black w-[250px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.province"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 mt-8">
                    <FormControl>
                      <Input {...field} placeholder="Province" className="border-black w-[200px] " />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex grid-cols-4 gap-7">
              <FormField
                control={form.control}
                name="spouse.s_lastName"
                render={({ field }) => (
                  <FormItem>
                    <Label>NAME OF SPOUSE</Label>
                    <FormControl>
                      <Input {...field} placeholder="Last name" className="border-black w-[300px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_givenName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Given name" className="border-black w-[300px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_middleInitial"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="M.I" className="border-black w-[50px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <Label>Date of Birth:</Label>
                    <FormControl>
                      <Input type="date" {...field} className="w-[150px] border-black" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_age"
                render={({ field }) => (
                  <FormItem>
                    <Label>Age</Label>
                    <FormControl>
                      <Input {...field} placeholder="Age" className="border-black w-[100px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_occupation"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 mt-8">
                    <FormControl>
                      <Input {...field} placeholder="Occupation" className="border-black w-[250px] " />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex grid-cols-4 gap-7">
              <FormField
                control={form.control}
                name="numOfLivingChildren"
                render={({ field }) => (
                  <FormItem>
                    <Label>NO. OF LIVING CHILDREN</Label>
                    <FormControl>
                      <Input {...field} placeholder="" className="border-black w-[300px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="planToHaveMoreChildren"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 mt-5">
                    <Label className="mt-2">PLAN TO HAVE MORE CHILDREN?</Label>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={() => field.onChange(true)}
                      />
                    </FormControl>
                    <Label>Yes</Label>
                    <FormControl>
                      <Checkbox
                        checked={!field.value}
                        onCheckedChange={() => field.onChange(false)}
                      />
                    </FormControl>
                    <Label>No</Label>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="averageMonthlyIncome"
                render={() => (
                  <FormItem>
                    <Label>AVERAGE MONTHLY INCOME</Label>
                    <FormControl>
                      <SelectLayout
                        placeholder="Choose"
                        label=""
                        className="custom-class border-black "
                        options={[
                          { id: "5k-10k", name: "5k-10k" },
                          { id: "10k-30k", name: "10k-30k" },
                          { id: "30k-50k", name: "30k-50k" },
                          { id: "50k-80k", name: "50k-80k" },
                          { id: "80k-100k", name: "80k-100k" },
                          { id: "100k-200k", name: "100k-200k" },
                          { id: "Higher", name: "Higher" },
                        ]}
                        value={""}
                        onChange={() => { }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="font-semibold mt-10">Type of Client</div>

            {["New Acceptor", "Current User"].map((type) => (
              <FormField
                key={type}
                control={form.control}
                name="typeOfClient"
                render={({ field }) => {
                  return (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value === type}
                          onCheckedChange={() => {
                            // Set only the selected type, removing others
                            field.onChange(field.value === type ? "" : type);

                            // If "Current User" is deselected, reset subTypeOfClient
                            if (type === "Current User" && field.value !== type) {
                              form.setValue("subTypeOfClient", undefined);
                            }
                          }}
                        />
                      </FormControl>
                      <Label>{type}</Label>
                    </FormItem>
                  );
                }}
              />
            ))}

            {/* Conditional Radio Buttons for "Current User" */}
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


          </form>
        </Form>
      </div>
    </div>
  );
}