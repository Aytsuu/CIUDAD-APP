import { Syringe, Calendar, CheckCircle, Clock, AlertCircle, Calendar1 } from "lucide-react";
import { useState } from "react";

interface FollowUps {
  followupVaccines?: any[];
  childHealthFollowups?: any[];
}

export function FollowUpsCard({
  followupVaccines = [],
  childHealthFollowups = [],
}: FollowUps) {
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "missed">("pending");
  const [activeChildHealthTab, setActiveChildHealthTab] = useState<"pending" | "completed" | "missed">("pending");

  // Categorize follow-ups
  const categorizedFollowups = {
    pending: followupVaccines.filter((v) => v.followup_status === "pending"),
    completed: followupVaccines.filter((v) => v.followup_status === "completed"),
    missed: followupVaccines.filter((v) => v.missed_status === "missed" || v.followup_status === "missed"),
  };

  const categorizedChildHealths = {
    pending: childHealthFollowups.filter((v) => v.followup_status === "pending"),
    completed: childHealthFollowups.filter((v) => v.followup_status === "completed"),
    missed: childHealthFollowups.filter((v) => v.missed_status === "missed" || v.followup_status === "missed"),
  };

  const showFollowupSection = followupVaccines.length > 0;
  const showChildHealthSection = childHealthFollowups.length > 0;

  if (!showFollowupSection && !showChildHealthSection) {
    return null;
  }

  // Helper component for tab buttons
  const TabButton = ({
    active,
    type,
    count,
    onClick,
  }: {
    active: boolean;
    type: "pending" | "completed" | "missed";
    count: number;
    onClick: () => void;
  }) => {
    const config = {
      pending: { icon: Clock, color: "blue" },
      completed: { icon: CheckCircle, color: "green" },
      missed: { icon: AlertCircle, color: "red" },
    }[type];

    return (
      <button
        onClick={onClick}
        className={`flex-1 py-2 text-sm flex flex-row justify-center items-center gap-2 transition-colors border-b-2 ${
          active
            ? `border-${config.color}-600 text-${config.color}-700 font-medium`
            : "border-transparent text-gray-600 hover:border-gray-300"
        }`}
      >
        <config.icon
          className={`h-4 w-4 ${
            active ? `text-${config.color}-600` : "text-gray-500"
          }`}
        />
        <span className="capitalize">{type}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            active
              ? `bg-${config.color}-100 text-${config.color}-800`
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  // Helper component for empty state
  const EmptyState = ({
    type,
  }: {
    type: "pending" | "completed" | "missed";
  }) => {
    const Icon = {
      pending: Clock,
      completed: CheckCircle,
      missed: AlertCircle,
    }[type];

    const messages = {
      pending: {
        title: "No pending follow-ups",
        description: "No pending follow-ups found for this patient.",
      },
      completed: {
        title: "No completed follow-ups",
        description: "No completed follow-ups found for this patient.",
      },
      missed: {
        title: "No missed follow-ups",
        description: "No missed follow-ups found for this patient.",
      },
    }[type];

    return (
      <div className="flex items-center justify-center h-[250px]">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon className="h-5 w-5 text-gray-500" />
          </div>
          <p className="text-gray-700 font-medium">{messages.title}</p>
          <p className="text-sm text-gray-500 mt-1">{messages.description}</p>
        </div>
      </div>
    );
  };

  // Helper component for item display
  const FollowUpItem = ({
    item,
    type,
    isVaccine = true,
  }: {
    item: any;
    type: "pending" | "completed" | "missed";
    isVaccine?: boolean;
  }) => {
    const colorClass = {
      pending: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      missed: "bg-red-100 text-red-800 border-red-200",
    }[type];

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return (
      <li className="bg-white rounded-lg p-3 shadow-xs border border-gray-100 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0 ${
              type === "pending"
                ? "bg-blue-400"
                : type === "completed"
                ? "bg-green-500"
                : "bg-red-400"
            }`}
          />
          <span className="font-medium text-gray-800">
            {isVaccine ? item.vac_name : item.followup_description}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Show follow-up date for all types */}
          <div
            className={`px-3 py-1 text-xs rounded-full ${colorClass} border`}
          >
            {type === "completed" ? "Follow-Up" : "Follow-Up"}:{" "}
            {item.followup_date ? formatDate(item.followup_date) : "N/A"}
          </div>

          {/* For completed items */}
          {type === "completed" && item.completed_at && (
            <div
              className={`px-3 py-1 text-xs rounded-full ${colorClass} border`}
            >
              Completed: {formatDate(item.completed_at)}
            </div>
          )}

          {/* For missed items */}
          {type === "missed" && (
            <>
              {item.days_missed && (
                <div
                  className={`px-3 py-1 text-xs rounded-full ${colorClass} border`}
                >
                  Missed by: {item.days_missed} days
                </div>
              )}
              <div
                className={`px-3 py-1 text-xs rounded-full ${colorClass} border`}
              >
                {item.completed_at
                  ? `Completed on: ${formatDate(item.completed_at)}`
                  : "Not yet completed"}
              </div>
            </>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-4">
      {/* Follow-up Vaccines Section */}
      {showFollowupSection && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar1 className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
               Follow-ups
            </h2>
          </div>

          <div className="flex gap-2 mb-4">
            <TabButton
              active={activeTab === "pending"}
              type="pending"
              count={categorizedFollowups.pending.length}
              onClick={() => setActiveTab("pending")}
            />
            <TabButton
              active={activeTab === "completed"}
              type="completed"
              count={categorizedFollowups.completed.length}
              onClick={() => setActiveTab("completed")}
            />
            <TabButton
              active={activeTab === "missed"}
              type="missed"
              count={categorizedFollowups.missed.length}
              onClick={() => setActiveTab("missed")}
            />
          </div>

          <div className="h-[250px] overflow-y-auto">
            {categorizedFollowups[activeTab].length > 0 ? (
              <ul className="space-y-2 pr-2">
                {categorizedFollowups[activeTab].map((item, index) => (
                  <FollowUpItem key={index} item={item} type={activeTab} />
                ))}
              </ul>
            ) : (
              <EmptyState type={activeTab} />
            )}
          </div>
        </div>
      )}

      {/* Child Health Follow-ups Section */}
      {showChildHealthSection && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Health Check-ups
            </h2>
          </div>

          <div className="flex gap-2 mb-4">
            <TabButton
              active={activeChildHealthTab === "pending"}
              type="pending"
              count={categorizedChildHealths.pending.length}
              onClick={() => setActiveChildHealthTab("pending")}
            />
            <TabButton
              active={activeChildHealthTab === "completed"}
              type="completed"
              count={categorizedChildHealths.completed.length}
              onClick={() => setActiveChildHealthTab("completed")}
            />
            <TabButton
              active={activeChildHealthTab === "missed"}
              type="missed"
              count={categorizedChildHealths.missed.length}
              onClick={() => setActiveChildHealthTab("missed")}
            />
          </div>

          <div className="h-[250px] overflow-y-auto">
            {categorizedChildHealths[activeChildHealthTab].length > 0 ? (
              <ul className="space-y-2 pr-2">
                {categorizedChildHealths[activeChildHealthTab].map((item, index) => (
                  <FollowUpItem
                    key={index}
                    item={item}
                    type={activeChildHealthTab}
                    isVaccine={false}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState type={activeChildHealthTab} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}