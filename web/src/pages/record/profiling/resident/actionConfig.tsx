import { Type, Origin } from "../profilingEnums";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import { LoadButton } from "@/components/ui/button/load-button";
import AssignPosition from "../../administration/AssignPosition";
import { Pen } from "lucide-react";

// Configuration Object
export const buttonConfig = (
    form: any,
    isAssignmentOpen: boolean,
    setIsAssignmentOpen: (value: boolean) => void,
    setFormType: (value: Type) => void,
) => ({
  [Origin.Administration]: {
    [Type.Viewing]: null, // No button for viewing in administration
    default: (
      <DialogLayout
        trigger={<Button className="px-12">Finish</Button>}
        title="Position Assignment"
        description="Assign a position to complete the registration"
        mainContent={
          <AssignPosition
            close={() => {
              setIsAssignmentOpen(false);
            }}
            personalInfoform={form}
          />
        }
        isOpen={isAssignmentOpen}
        onOpenChange={setIsAssignmentOpen}
      />
    ),
  },
  defaultOrigin: {
    [Type.Viewing]: (
      <Button
        onClick={() => {
          setFormType(Type.Editing)
        }}
      >
        <Pen size={24} /> Edit
      </Button>
    ),
    [Type.Editing]: (
      <div className="flex gap-2">
        <Button 
            className="w-full sm:w-32" 
            variant={"outline"}
            onClick={() => {
                setFormType(Type.Viewing)
            }}
        >
            Cancel
        </Button>
        <Button 
          className="w-full sm:w-32"
          type="submit"
        >
          Save
        </Button>
      </div>
    ),
    default: (
      <Button type="submit" className="w-full sm:w-32">   
        Register
      </Button>
    ),
  },
});

// Render Function
type OriginKeys = keyof ReturnType<typeof buttonConfig>;

export const renderActionButton = (
  form: any,
  isAssignmentOpen: boolean,
  formType: Type,
  Origin: OriginKeys,
  isSubmitting: boolean,
  setIsAssignmentOpen: (value: boolean) => void,
  setFormType: (value: Type) => void,
) => {
  const config = buttonConfig(form, isAssignmentOpen, setIsAssignmentOpen, setFormType);
  const originConfig = config[Origin] || config.defaultOrigin;
  const button = originConfig[formType as keyof typeof originConfig] || originConfig.default;

  // Add loading state to the button
  if (isSubmitting) {
    return (
      <LoadButton>
        {formType === Type.Editing ? "Saving..." : "Registering..."}
      </LoadButton>
    );
  }

  return button;
};