import { useIdle } from "./context/IdleContext";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const IdleModal = () => {
  const { showModal, countdown, onStayActive } = useIdle();

  return (
    <AlertDialog open={showModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Inactivity Detected</AlertDialogTitle>
          <AlertDialogDescription>
            Due to inactivity, the session will end unless the user confirms it is still active. Logging out in {countdown} seconds.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <button onClick={onStayActive}>
              I'm Still Here
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
