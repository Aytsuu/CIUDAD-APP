import { useForm } from "react-hook-form";
import { z } from "zod";
import FamilyPlanningSchema from "@/form-schema/FamilyPlanningSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form/form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

type Page2FormData = z.infer<typeof FamilyPlanningSchema>;

type Page2Props = {
  onPrevious1: () => void;
  onNext3: () => void;
  updateFormData: (data: Partial<Page2FormData>) => void;
  formData: Page2FormData;
};

export default function FamilyPlanningForm2({
  onPrevious1,onNext3,updateFormData,formData,
}: Page2Props) {
  const form = useForm<Page2FormData>({
    defaultValues: {
      medicalHistory: {},
      obstetricalHistory: {},
      clientID: "",
  }
  });

  const medicalHistoryOptions = [
    { name: "severeHeadaches", label: "Severe headaches / migraine" },
    { name: "strokeHeartAttackHypertension", label: "History of stroke / heart attack / hypertension" },
    { name: "hematomaBruisingBleeding", label: "Non-traumatic hematoma / frequent bruising or gum bleeding" },
    { name: "breastCancerHistory", label: "Current or history of breast cancer / breast mass" },
    { name: "severeChestPain", label: "Severe chest pain" },
    { name: "coughMoreThan14Days", label: "Cough for more than 14 days" },
    { name: "jaundice", label: "Jaundice" },
    { name: "unexplainedVaginalBleeding", label: "Unexplained vaginal bleeding" },
    { name: "abnormalVaginalDischarge", label: "Abnormal vaginal discharge" },
    { name: "phenobarbitalOrRifampicin", label: "Intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)" },
    { name: "smoker", label: "Is this client a SMOKER?" },
    { name: "disability", label: "With Disability?" },
  ];

  const onSubmit = (data: Page2FormData) => {
    console.log("PAGE 2 Data:", data);
    updateFormData(data); // Save form data
    onNext3(); // Move to the next page
  };

  return (
    <div className="bg-white h-full flex w-full overflow-auto">
      <div className="rounded-lg w-full p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Medical History Section */}
              <div>
                <Label className="text-lg font-bold mb-3">I. MEDICAL HISTORY</Label>
                <p className="text-sm mb-3">Does the client have any of the following?</p>

                {medicalHistoryOptions.map((item) => (
                  <FormField
                    key={item.name}
                    control={form.control}
                    name={`medicalHistory.${item.name}`}
                    render={({ field }) => (
                      <FormItem className="flex justify-between items-center">
                        <Label className="mt-2">■ {item.label}</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <Label>Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={!field.value}
                                onCheckedChange={() => field.onChange(false)}
                              />
                            </FormControl>
                            <Label>No</Label>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}

                {/* If YES, specify disability */}
                {form.watch("medicalHistory.disability") && (
                  <FormField
                    control={form.control}
                    name="medicalHistory.disabilityDetails"
                    render={({ field }) => (
                      <FormItem>
                        <Label>If YES, please specify:</Label>
                        <FormControl>
                          <Input {...field} className="border border-black w-full mt-2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Obstetrical History Section */}
              <div className="border-l-4 pl-5">
                <Label className="text-lg font-bold mb-3">II. OBSTETRICAL HISTORY</Label>

                {/* Number of Pregnancies */}
                <div className="grid grid-cols-6 mt-5">
                  <FormField
                    control={form.control}
                    name="obstetricalHistory.g_pregnancies"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="flex w-[150px] mb-4">Number of pregnancies</Label>
                        <FormControl>
                          <Input {...field} placeholder="G" className="border-black w-[90px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.p_pregnancies"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="P" className="border-black w-20 mt-8" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.fullTerm"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Full term</Label>
                        <FormControl>
                          <Input {...field} type="number" className="border-black w-[90px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.premature"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Premature</Label>
                        <FormControl>
                          <Input {...field} type="number" className="border-black w-[90px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.abortion"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Abortion</Label>
                        <FormControl>
                          <Input {...field} type="number" className="border-black w-[90px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.livingChildren"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Living Children</Label>
                        <FormControl>
                          <Input {...field} type="number" className="border-black w-[90px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date of Last Delivery */}
                <div className="flex grid-cols-2 mt-5">
                  <FormField
                    control={form.control}
                    name="obstetricalHistory.lastDeliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Date of last delivery</Label>
                        <FormControl>
                          <Input {...field} type="date" className="border-black w-[150px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type of Last Delivery */}
                  <FormField
                    control={form.control}
                    name="obstetricalHistory.typeOfLastDelivery"
                    render={({ field }) => (
                      <FormItem className="ml-7">
                        <Label>Type of last delivery:</Label>
                        <div className="flex space-x-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value === "Vaginal"}
                              onCheckedChange={() => field.onChange("Vaginal")}
                            />
                          </FormControl>
                          <Label>Vaginal</Label>
                          <FormControl>
                            <Checkbox
                              checked={field.value === "Cesarean"}
                              onCheckedChange={() => field.onChange("Cesarean")}
                            />
                          </FormControl>
                          <Label>Cesarean section</Label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Last and Previous Menstrual Period */}
                <div className="flex grid-cols-2 gap-4 mt-5">
                  <FormField
                    control={form.control}
                    name="obstetricalHistory.lastMenstrualPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Last menstrual period</Label>
                        <FormControl>
                          <Input {...field} type="date" className="border-black w-[150px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="obstetricalHistory.previousMenstrualPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Previous menstrual period</Label>
                        <FormControl>
                          <Input {...field} type="date" className="border-black w-[150px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Menstrual Flow */}
                <div className="mt-5">
                  <Label>Menstrual Flow</Label>
                  <FormField
                    control={form.control}
                    name="obstetricalHistory.menstrualFlow"
                    render={({ field }) => (
                      <FormItem>
                        <div className="ml-10">
                          <FormControl>
                            <Checkbox
                              checked={field.value === "scanty"}
                              onCheckedChange={() => field.onChange("scanty")}
                            />
                          </FormControl>
                          <Label>Scanty (1-2 pads per day)</Label>
                          <br />
                          <FormControl>
                            <Checkbox
                              checked={field.value === "moderate"}
                              onCheckedChange={() => field.onChange("moderate")}
                            />
                          </FormControl>
                          <Label>Moderate (3-5 pads per day)</Label>
                          <br />
                          <FormControl>
                            <Checkbox
                              checked={field.value === "heavy"}
                              onCheckedChange={() => field.onChange("heavy")}
                            />
                          </FormControl>
                          <Label>Heavy (more than 5 pads per day)</Label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Obstetrical History Fields */}
                <FormField
                  control={form.control}
                  name="obstetricalHistory.dysmenorrhea"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>Dysmenorrhea</Label>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="obstetricalHistory.hydatidiformMole"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>Hydatidiform mole (within the last 12 months)</Label>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="obstetricalHistory.ectopicPregnancyHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>History of ectopic pregnancy</Label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
            <Link to={`/FamPlanning_form/`}>
            <Button type="button" onClick={onPrevious1}>
                Previous
              </Button>
              </Link>
              <Button type="submit">
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}