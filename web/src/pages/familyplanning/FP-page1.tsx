import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
<<<<<<< HEAD
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form/form";
=======
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form/form";
>>>>>>> backend/feature/healthinventory
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";
import FamilyPlanningSchema from "@/form-schema/FamilyPlanningSchema";
import { Link } from "react-router";


type Page1FormData = z.infer<typeof FamilyPlanningSchema>;

type Page1Props = {
  onNext2: () => void;
  updateFormData: (data: Partial<Page1FormData>) => void;
  formData: Page1FormData;
};

export default function FamilyPlanningForm({
  onNext2,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<Page1FormData>({
    resolver: zodResolver(FamilyPlanningSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  const onSubmitForm = (data: Page1FormData) => {
    console.log("PAGE 1:", data);
    updateFormData(data);
    onNext2();
  };

  const methodCurrentlyUsed = [
    { id: "COC", name: "COC" }, { id: "IUD", name: "IUD" },
    { id: "BOM/CMM", name: "BOM/CMM" }, { id: "LAM", name: "LAM" }, { id: "POP", name: "POP" }, { id: "Interval", name: "Interval" }, { id: "BBT", name: "BBT" },
    { id: "SDM", name: "SDM" }, { id: "Injectable", name: "Injectable" }, { id: "Post Partum", name: "Post Partum" },
    { id: "STM", name: "STM" }, { id: "Implant", name: "Implant" }, { id: "Condom", name: "Condom" },
  ];

  return (
    <div className="bg-white h-full flex w-full overflow-auto">
  <div className="rounded-lg w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 border-l-4 p-4 text-center">
          Family Planning (FP) Form 1
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((onSubmit) => console.log(data))} className="p-4 space-y-4">
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
              <FormField
                control={form.control} name="clientID" render={({ field }) => (
                  <FormItem>
                    <Label>CLIENT ID:</Label>
                    <FormControl>
                      <Input {...field} className="border-black w-full" />
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
                      <Input {...field} className="border-black w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NHTS Checkbox */}
              <FormField control={form.control} name="nhts_status" render={({ field }) => (
                <FormItem className="flex items-center space-x-2 ">
                  <Label className="mt-2">NHTS?</Label>
                  <FormControl className="border border-black">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={() => field.onChange(true)}
                    />
                  </FormControl>
                  <Label>Yes</Label>
                  <FormControl>
                    <Checkbox
                      className="border border-black"
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
                      className="border border-black"
                      checked={field.value}
                      onCheckedChange={() => field.onChange(true)}
                    />
                  </FormControl>
                  <Label>Yes</Label>
                  <FormControl>
                    <Checkbox
                      className="border border-black"
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

            <div className="flex grid-cols-6 w-full gap-3 mt-10">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <Label>NAME OF CLIENT</Label>
                    <FormControl>
                      <Input {...field} placeholder="Last name" className="border-black w-[180px]" />
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
                      <Input {...field} placeholder="Given name" className="mt-8 border-black w-[180px]" />
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
                      <Input {...field} placeholder="M.I" className="mt-8 border-black max-w-[85px]" />
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
                      <Input {...field} placeholder="Age" className="border-black w-[100px]" />
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
                        className="custom-class mt-3 border-black w-full"
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
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Occupation" className="mt-8 border-black w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex grid-cols-5  gap-4">
              <FormField
                control={form.control}
                name="address.houseNumber"
                render={({ field }) => (
                  <FormItem>
                    <Label>ADDRESS</Label>
                    <FormControl>
                      <Input {...field} placeholder="No." className="border-black w-[100px]" />
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
                      <Input {...field} placeholder="Street" className="border-black w-[200px] mt-8" />
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
                      <Input {...field} placeholder="Barangay" className="border-black w-[200px] mt-8" />
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
                      <Input {...field} placeholder="Municipality/City" className="border-black w-[180px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.province"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Province" className="border-black w-[180px] mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="spouse.s_lastName"
                render={({ field }) => (
                  <FormItem>
                    <Label>NAME OF SPOUSE</Label>
                    <FormControl>
                      <Input {...field} placeholder="Last name" className="border-black w-[180px]" />
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
                      <Input {...field} placeholder="Given name" className="border-black w-[180px] mt-8" />
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
                      <Input {...field} placeholder="M.I" className="border-black w-full mt-8" />
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
                      <Input type="date" {...field} className="w-full border-black" />
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
                      <Input {...field} placeholder="Age" className="border-black w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Occupation" className="border-black w-full mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="numOfLivingChildren"
                render={({ field }) => (
                  <FormItem>
                    <Label>NO. OF LIVING CHILDREN</Label>
                    <FormControl>
                      <Input {...field} placeholder="" className="border-black w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="planToHaveMoreChildren"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <Label className="mt-2">PLAN TO HAVE MORE CHILDREN?</Label>
                    <FormControl>
                      <Checkbox
                        className="border border-black"
                        checked={field.value}
                        onCheckedChange={() => field.onChange(true)}
                      />
                    </FormControl>
                    <Label>Yes</Label>
                    <FormControl>
                      <Checkbox
                        className="border border-black"
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
                        className="custom-class border-black w-full"
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

            <div className="border border-t-black w-full flex grid-cols-3 p-4 rounded-md">
              <div className=" w-[200px]">
                <h3 className="font-semibold">Type of Client</h3>
                {['New Acceptor', 'Current User'].map((type) => (
                  <FormField
                    key={type}
                    control={form.control}
                    name="typeOfClient"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="radio"
                            value={type}
                            checked={field.value === type}
                            onChange={() => {
                              field.onChange(type);
                              if (type !== "Current User") {
                                form.setValue("subTypeOfClient", "");
                              }
                            }}
                          />
                        </FormControl>
                        <Label>{type}</Label>
                      </FormItem>
                    )}
                  />
                ))}
                {form.watch("typeOfClient") === "Current User" && (
                  <div className="ml-6">
                    {['Changing Method', 'Changing Clinic', 'Dropout/Restart'].map((subType) => (
                      <FormField
                        key={subType}
                        control={form.control}
                        name="subTypeOfClient"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
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

              
              <div className=" grid-rows-2">
                <FormField control={form.control} name="reasonForFP" render={({ field }) => (
                  <FormItem className="w-full flex items-center space-x-2">
                    <Label className="mt-2 w-full">Reason for FP</Label>
                    <FormControl>
                      <Checkbox
                        className="border border-black"
                        checked={field.value}
                        onCheckedChange={() => field.onChange(true)}
                      />
                    </FormControl>
                    <Label>Spacing</Label>
                    <FormControl>
                      <Checkbox
                        className="border border-black"
                        checked={!field.value}
                        onCheckedChange={() => field.onChange(false)}
                      />
                    </FormControl>
                    <Label>Limiting</Label>


                    <FormControl>
                      <Checkbox
                        className="border border-black"
                        checked={!field.value}
                        onCheckedChange={() => field.onChange(false)}
                      />
                    </FormControl>
                    <Label>Others</Label>
                    <Input className="border border-b-black"></Input>
                    <FormMessage />
                  </FormItem>



                )}

                />

                <FormField control={form.control} name="reasonFP" render={({ field }) => (
                  <FormItem className="w-full flex items-center space-x-2">
                    <Label className="mt-2 mr-10">Reason</Label>
                    <FormControl>
                      <Checkbox
                        className="border border-black"
                        checked={field.value}
                        onCheckedChange={() => field.onChange(true)}
                      />
                    </FormControl>
                    <Label>Medical condition</Label>


                    <FormControl>
                      <Checkbox
                        className="border border-black"
                        checked={!field.value}
                        onCheckedChange={() => field.onChange(false)}
                      />
                    </FormControl>
                    <Label>side-effects</Label>
                    <Input className="border border-b-black w-[20%]"></Input>
                    <FormMessage />
                  </FormItem>
                )}

                />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-sm w-full mb-2">
                  Method currently used (for Changing Method):
                </h3>

                <div className="grid grid-cols-4 gap-x-6 gap-y-2">
                  {methodCurrentlyUsed.map((method) => (
                    <FormField
                      key={method.id}
                      control={form.control}
                      name={`methodCurrentlyUsed.${method.id}`}
                      render={({ field }) => (
                        <FormItem className="flex items-center">
                          <FormControl className="border border-black">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(checked)}
                            />
                          </FormControl>
                          <Label className="text-sm whitespace-nowrap">{method.name}</Label>
                        </FormItem>
                      )}
                    />
                  ))}


                  <div className="col-span-4 flex items-center space-x-2 mt-2">
                    <FormField
                      control={form.control}
                      name="methodCurrentlyUsed"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              className="border border-black"
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(checked)}
                            />
                          </FormControl>
                          <Label className="text-sm">Others</Label>
                        </FormItem>
                      )}
                    />
                    <span className="text-sm">Specify:</span>
                    <Input
                      type="text"
                      className="border-black w-40"
                      {...form.register("methodCurrentlyUsed.specify")}
                    />
                  </div>
                </div>
              </div>

            </div>
            <div className="flex justify-end">
              <Link to={"/FamilyPlanning_form2"}>
              
              <Button type="submit" className="w-[100px]">Next</Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
      <div>

      </div>
    </div>


  );
};
