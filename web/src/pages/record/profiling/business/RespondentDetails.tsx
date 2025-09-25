import React from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table/data-table";
import { useLoading } from "@/context/LoadingContext";
import { Loader2, Building2 } from "lucide-react";
import { useLocation } from "react-router";
import { Type } from "../ProfilingEnums";
import {
  useOwnedBusinesses,
  useRespondentInfo,
} from "../queries/profilingFetchQueries";
import { businessDetailsColumns } from "../resident/ResidentColumns";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { formatDate } from "@/helpers/dateHelper";
import { calculateAge } from "@/helpers/ageCalculator";

// Loading Component
const ActivityIndicator = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

// Empty State Component
const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="rounded-full bg-gray-100 p-4">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <div className="text-center space-y-1">
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

export default function RespondentDetails() {
  // ============= STATE INITIALIZATION ===============
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  // const { user } = useAuth()
  const { showLoading, hideLoading } = useLoading();
  // const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [formType, _setFormType] = React.useState<Type>(params?.type);
  const [_isReadOnly, setIsReadOnly] = React.useState<boolean>(false);
  const { data: respondentInfo, isLoading: isLoadingRespondentInfo } =
    useRespondentInfo(params?.data.respondentId);
  const { data: ownedBusinesses, isLoading: isLoadingBusinesses } =
    useOwnedBusinesses({
      br: params?.data.respondentId,
    });

  const businesses = ownedBusinesses?.results || [];
  console.log(respondentInfo);

  // ================= SIDE EFFECTS ==================
  React.useEffect(() => {
    if (isLoadingRespondentInfo || isLoadingBusinesses) showLoading();
    else hideLoading();
  }, [isLoadingRespondentInfo, isLoadingBusinesses]);

  React.useEffect(() => {
    // Set the form values when the component mounts
    if (formType == Type.Viewing) {
      setIsReadOnly(true);
    }
    formType === Type.Editing && setIsReadOnly(false);
  }, [formType, respondentInfo]);

  // ============== ====== HANDLERS ====================
  // const submit = async () => {
  //   if (!(await form.trigger())) {
  //     handleSubmitError("Please fill out all required fields")
  //     return
  //   }

  //   try {
  //     const values = form.getValues()
  //     const {per_age, ...personalInfoRest } = respondentInfo
  //     if (
  //       checkDefaultValues(
  //         values,
  //         personalInfoRest,
  //       )
  //     ) {
  //       setIsSubmitting(false)
  //       setFormType(Type.Viewing)
  //       handleSubmitError("No changes made")
  //       return
  //     }

  //     handleSubmitSuccess("Profile updated successfully")
  //     setFormType(Type.Viewing)
  //   } catch (err) {
  //     showErrorToast("Failed to update profile. Please try again.")
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  // Render Business Card Content
  const renderBusinessContent = () => {
    if (isLoadingBusinesses) {
      return <ActivityIndicator message="Loading business information..." />;
    }
    if (!businesses || businesses.length === 0) {
      return (
        <EmptyState
          icon={Building2}
          title="No businesses found"
          description="This respondent has no registered business ownership."
        />
      );
    }
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-5xl mt-5 border">
          <DataTable
            columns={businessDetailsColumns()}
            data={businesses.filter((b: any) => b.bus_status !== "Pending")}
            headerClassName="bg-transparent hover:bg-transparent"
            isLoading={false}
          />
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================
  return (
    <LayoutWithBack
      title="Respondent"
      description={`Complete details of business respondent #${respondentInfo?.br_id}, including the associated businesses.`}
    >
      <div className="grid gap-4">
        <Card className="w-full p-10">
          {isLoadingRespondentInfo ? (
            <ActivityIndicator message="Loading personal information..." />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm">
                      {respondentInfo?.br_fname || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Middle Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Middle Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm">
                      {respondentInfo?.br_mname || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm">
                      {respondentInfo?.br_lname || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Sex */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Sex
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm capitalize">
                      {respondentInfo?.br_sex?.toLowerCase() || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm">
                      {formatDate(respondentInfo?.br_dob, "long")}
                    </p>
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm">
                      {calculateAge(respondentInfo?.br_dob)} years old
                    </p>
                  </div>
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm">
                      {respondentInfo?.br_contact || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Date Registered */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Date Registered
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm">
                      {formatDate(respondentInfo?.br_date_registered, "long")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="w-full p-10">
          <div className="pb-4">
            <h2 className="text-lg font-semibold">Business</h2>
            <p className="text-xs text-black/50">
              Shows owned business of this respondent
            </p>
          </div>
          {renderBusinessContent()}
        </Card>
      </div>
    </LayoutWithBack>
  );
}
