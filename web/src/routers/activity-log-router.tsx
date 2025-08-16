import ActivityLogMain from "@/pages/record/activity-log/activity-log-main";
import ActivityLogView from "@/pages/record/activity-log/activity-log-view";

export const activity_log_router = [
  {
    path: "/record/activity-log",
    element: <ActivityLogMain />,
  },
  {
    path: "/record/activity-log/:id",
    element: <ActivityLogView />
 }
];
