import { Type, Origin } from "../profilingEnums";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import { LoadButton } from "@/components/ui/button/load-button";
import AssignPosition from "../../administration/AssignPosition";
import { Pen } from "lucide-react";
import { ConfirmationModal } from "@/components/confirmation-modal";

// Configuration Object
export const buttonConfig = (
    form: any,
    isAssignmentOpen: boolean,
    setIsAssignmentOpen: (value: boolean) => void,
    setFormType: (value: Type) => void,
    submit: () => void
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
    [Type.Request]: (
      <div className="flex gap-2">
        <Button 
          type="button"
          className="w-full sm:w-32 text-red-500 hover:text-red-500" 
          variant={"outline"}
        >
          Reject
        </Button>
        <ConfirmationModal 
          trigger={<Button className="w-full sm:w-32"> Approve </Button>}
          title="Confirm Approval"
          description="Do you wish to proceed approving this request?"
          actionLabel="Confirm"
          onClick={submit}
        />
      </div>
    ),
    default: (
      <ConfirmationModal 
          trigger={<Button className="w-full sm:w-32"> Approve </Button>}
          title="Confirm Registration"
          description="Do you wish to proceed with the registration?"
          actionLabel="Confirm"
          onClick={submit}
        />
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
  submit: () => void
) => {
  const config = buttonConfig(form, isAssignmentOpen, setIsAssignmentOpen, setFormType, submit);
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