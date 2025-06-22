import { Type, Origin } from "./profilingEnums";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import { LoadButton } from "@/components/ui/button/load-button";
import AssignPosition from "../administration/AssignPosition";
import { Check, Pen, X } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

// Configuration Object
export const buttonConfig = (
  form: any,
  isAssignmentOpen: boolean,
  isAllowSubmit: boolean,
  setIsAssignmentOpen: (value: boolean) => void,
  setFormType: React.Dispatch<React.SetStateAction<Type>> | undefined,
  submit: () => void,
  reject: () => void
) => ({
  [Origin.Administration]: {
    [Type.Viewing]: null, // No button for viewing in administration
    default: (
      isAllowSubmit ? (<DialogLayout
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
      />) : (
        <Button type="submit" className="px-12">
          <Check />
          Finish
        </Button>
      )
    ),
  },
  defaultOrigin: {
    [Type.Viewing]: (
      <Button
        onClick={() => {
          setFormType && setFormType(Type.Editing);
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
            setFormType && setFormType(Type.Viewing);
          }}
        >
          Cancel
        </Button>
        <Button className="w-full sm:w-32" type="submit">
          <Check/>
          Save
        </Button>
      </div>
    ),
    [Type.Request]: (
      <div className="flex gap-2">
        <ConfirmationModal
          trigger={<Button
              className="w-full sm:w-32 text-red-500 hover:text-red-500"
              variant={"outline"}
            >
              <X />
              Reject
            </Button>
          }
          title="Confirm Rejection"
          description="Do you wish to proceed rejecting this request?"
          actionLabel="Confirm"
          onClick={reject}
          variant="destructive"
        />
        <ConfirmationModal
          trigger={<Button className="w-full"> 
            <Check/>
            Approve & Create Record 
          </Button>
          }
          title="Confirm Approval"
          description="Do you wish to proceed approving this request?"
          actionLabel="Confirm"
          onClick={submit}
        />
      </div>
    ),
    default: (
      <ConfirmationModal
        trigger={<Button className="w-full sm:w-32"> 
          <Check/>
          Register 
        </Button>}
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

export const renderActionButton = ({
  form,
  isAssignmentOpen,
  formType,
  origin="defaultOrigin",
  isSubmitting,
  isAllowSubmit,
  setIsAssignmentOpen,
  setFormType,
  submit,
  reject, // For request
}: {
  form?: any;
  isAssignmentOpen?: boolean;
  formType: Type;
  origin?: OriginKeys;
  isSubmitting: boolean;
  isAllowSubmit?: boolean;  
  setIsAssignmentOpen?: (value: boolean) => void;
  setFormType?: React.Dispatch<React.SetStateAction<Type>>;
  submit: () => void;
  reject?: () => void; // For request
}) => {
  const config = buttonConfig(
    form,
    isAssignmentOpen || false,
    isAllowSubmit || false,
    setIsAssignmentOpen || (() => {}),
    setFormType,
    submit,
    reject || (() => {})
  );
  const originConfig = config[origin] || config.defaultOrigin;
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
