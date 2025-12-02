import { cn } from "@/lib/utils";
import { FormField } from "./form";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Label } from "../label";

export const FormRadioGroup = ({
  control,
  name,
  className,
  orientation = "vertical",
  options,
  readOnly = false,
}: {
  control: any;
  name: string;
  className?: string;
  orientation?: "vertical" | "horizontal";
  options: any[];
  readOnly?: boolean;
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <RadioGroup
          orientation={"horizontal"}
          value={field.value}
          onValueChange={(value) => {
            if(!readOnly) {
              field.onChange(value)
            }
          }}
          className={cn(`${orientation == "horizontal" && "flex gap-4"}`, className)}
        >
          {options?.map((option: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <RadioGroupItem value={option.value} id={option.value}/>
              <Label htmlFor="r1" className="text-gray-700">{option?.label}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
    />
  );
};
