import { Type } from "./AdministrationEnums";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button/button";
import { LoadButton } from "@/components/ui/button/load-button";
import { Check } from "lucide-react";

// Configuration
export const buttonConfig = (
  submit: () => void,
  update?: () => void
) => ({
  [Type.Add]: (
    <ConfirmationModal
      trigger={<Button>Create</Button>}
      title="Confirm Creation"
      description="Are you sure you want to create new position?"
      actionLabel="Confirm"
      onClick={submit}
    />
  ),
  [Type.Edit]: (
    <ConfirmationModal
      trigger={<Button>
        <Check/>
        Save
      </Button>}
      title="Confirm Save"
      description="Are you sure you want to save your changes?"
      actionLabel="Confirm"
      onClick={update && update}
    />
  )
});

// Render button
export const renderActionButton = ({
  formType,
  isSubmitting,
  submit,
  update
}: {
  formType: Type;
  isSubmitting: boolean;
  submit: () => void;
  update?: () => void;
}) => {
  const config = buttonConfig(submit, update);
  const button = config[formType];

  if(isSubmitting) {
    return (
      <LoadButton>
        {formType === Type.Add ? 'Creating...' : 'Saving...'}
      </LoadButton>  
    )
  }

  return button;
};
