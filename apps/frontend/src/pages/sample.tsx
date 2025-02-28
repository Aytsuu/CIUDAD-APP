import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

export function DemographicData() {
  const { control } = useFormContext()

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="building"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Building Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select building type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="renter">Renter</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="quarter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quarter</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1st">First (1st)</SelectItem>
                  <SelectItem value="2nd">Second (2nd)</SelectItem>
                  <SelectItem value="3rd">Third (3rd)</SelectItem>
                  <SelectItem value="4th">Fourth (4th)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="householdNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Household No:</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter Household Number"/>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="familyNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family No:</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter Family Number"/>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Respondent Information</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name="respondent.lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter Last Name"/>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="respondent.firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter First Name"/>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="respondent.middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter Middle Name"/>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name="respondent.gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="respondent.contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" placeholder="Enter Contact Number" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="respondent.mothersMaidenName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother's Maiden Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter Mother's Maiden Name"/>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input {...field} placeholder="House No, Street, Purok/Sitio, Barangay, Province, City" />
            </FormControl>
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="nhtsHousehold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NHTS Household</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select NHTS status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="indigenousPeople"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Indigenous People</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Household Head Information</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name="householdHead.lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="householdHead.firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="householdHead.middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="householdHead.gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
      <Separator />
      {["father", "mother"].map((parent) => (
        <div key={parent} className="space-y-4">
          <h3 className="text-lg font-semibold">{parent === "father" ? "Father's" : "Mother's"} Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`${parent}.lastName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${parent}.firstName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${parent}.middleName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`${parent}.birthYear`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Year</FormLabel>
                  <FormControl>
                    <Input {...field} type="Date"  />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${parent}.age`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" max="150" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${parent}.civilStatus`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Civil Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                      <SelectItem value="separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`${parent}.educationalAttainment`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Educational Attainment</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${parent}.religion`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Religion</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${parent}.bloodType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${parent}.philHealthId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PhilHealth ID No:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${parent}.covidVaxStatus`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>COVID-19 Vax Status:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Health Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="healthRiskClassification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Risk Classification</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="immunizationStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Immunization Status</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <FormField
            control={control}
            name="familyPlanning.method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Family Planning Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pills">Pills</SelectItem>
                    <SelectItem value="iud">IUD</SelectItem>
                    <SelectItem value="condom">Condom</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="familyPlanning.source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source of FP Method</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. BHW, RHU, HC, etc." />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="noFamilyPlanning"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>No Family Planning</FormLabel>
                <FormDescription>Check this if no family planning method is being used.</FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </>
  )
}
