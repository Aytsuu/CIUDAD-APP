import BHWAllNotes from "@/pages/record/health/bhw-daily-notes/bhw-all-notes";
import BHWNoteForm from "@/pages/record/health/bhw-daily-notes/bhw-note-form";

export const  bhw_daily_notes_router = [
   {
      path: "/bhw/notes",
      element: <BHWAllNotes />,
   },
   {
      path: "/bhw/form",
      element: <BHWNoteForm />,
   }
]  