import { Type } from "./administrationEnums";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button/button";
import { LoadButton } from "@/components/ui/button/load-button";
import { Check } from "lucide-react";

export const buttonConfig = (
  submit: () => void
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
      onClick={submit}
    />
  )
});

export const renderActionButton = ({
  formType,
  isSubmitting,
  submit,
}: {
  formType: Type;
  isSubmitting: boolean;
  submit: () => void;
}) => {
  const config = buttonConfig(submit);
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
