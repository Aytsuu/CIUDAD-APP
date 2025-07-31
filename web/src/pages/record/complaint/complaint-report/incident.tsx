import { useFormContext, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

export const IncidentInfo = () => {
  const { control } = useFormContext();
  const incidentType = useWatch({ control, name: "incident.type" });

  return (
    <div className="space-y-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="incident.type"
          render={({ field } : any) => (
            <FormItem>
              <FormLabel className="font-semibold text-black/50">Incident Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Theft">Theft</SelectItem>
                  <SelectItem value="Assault">Assault</SelectItem>
                  <SelectItem value="Property Damage">Property Damage</SelectItem>
                  <SelectItem value="Noise">Noise Complaint</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {incidentType === "Other" && (
          <FormField
            control={control}
            name="incident.otherType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/50">Specify Incident Type *</FormLabel>
                <FormControl>
                  <Input placeholder="Describe the incident type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="incident.date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-black/50">Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="incident.time"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-black/50">Time *</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
        <FormField
          control={control}
          name="incident.location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-black/50">Location *</FormLabel>
              <FormControl>
                <Input placeholder="Specific place of where the incident happened" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      <FormField
        control={control}
        name="incident.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-semibold text-black/50">Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide detailed description of the incident..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};