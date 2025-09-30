import { useGetSidebarAnalytics } from "./profiling-analytics-queries";
import { Card } from "@/components/ui/card";
import { Clock, ChevronRight, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link, useNavigate } from "react-router";
import { formatTimeAgo } from "@/helpers/dateHelper";
import React from "react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

export const ProfilingSidebar = () => {
  const navigate = useNavigate();
  const { data: profilingSidebar, isLoading } = useGetSidebarAnalytics();
  const formatName = (
    firstName: string,
    middleName: string,
    lastName: string
  ) => {
    const middle = middleName ? `${middleName[0]}.` : "";
    return `${firstName} ${middle} ${lastName}`;
  };

  const formatRequestList = React.useCallback(() => {
    const formatted = profilingSidebar?.map((request: any) => {
      if (request?.compositions?.length == 1) {
        const personal = request.compositions[0];
        return {
          req_id: request.req_id,
          req_created_at: request.req_created_at,
          acc: personal.acc,
          per_id: personal.per_id,
          per_lname: personal.per_lname,
          per_fname: personal.per_fname,
          per_mname: personal.per_mname,
          per_suffix: personal.per_suffix,
          per_dob: personal.per_dob,
          per_sex: personal.per_sex,
          per_status: personal.per_status,
          per_edAttainment: personal.per_edAttainment,
          per_religion: personal.per_religion,
          per_contact: personal.per_contact,
          per_disability: personal.per_disability,
          per_addresses: personal.per_addresses,
        };
      } else {
        console.log(request)
        const respondent = request.compositions.filter(
          (comp: any) => comp.acc !== null
        )[0];
        return {
          req_id: request.req_id,
          req_created_at: request.req_created_at,
          respondent: respondent,
          compositions: request.compositions,
        };
      }
    });

    return formatted || [];
  }, [profilingSidebar]);

  const handleClick = (data: Record<string, any>) => {
    console.log(data)
    if(data?.respondent) {
      navigate("/profiling/request/pending/family/registration", {
        state: {
          params: {
            data: data,
          },
        }
      })
    } else {
      navigate("/profiling/request/pending/individual/registration", {
        state: {
          params: {
            title: "Registration Request",
            description:
              "This is a registration request submitted by the user. Please review the details and approve accordingly.",
            data: data,
          },
        },
      }); 
    }
  };

  return (
    <Card className="w-full bg-white h-full flex flex-col border-none">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : profilingSidebar?.length > 0 ? (
          <div className="p-4 space-y-3">
            {formatRequestList().map((data: any, index: number) => (
              <Card
                key={data.req_id || index}
                className="p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                onClick={() => handleClick(data)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-14">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-700 truncate mb-1">
                        {formatName(
                          data?.per_fname || data.respondent?.per_fname,
                          data?.per_mname || data.respondent?.per_mname,
                          data?.per_lname || data.respondent?.per_lname
                        )}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatTimeAgo(data.req_created_at)}</span>
                        <p className="text-orange-500 font-semibold">
                          Pending Request
                        </p>
                      </div>
                    </div>
                    {data?.respondent && (
                      <TooltipLayout 
                        trigger={
                          <div className="flex gap-1">
                            <UsersRound size={18} className="text-blue-600"/>
                            <p className="text-sm font-medium text-blue-700">+{data?.compositions?.length - 1}</p>
                          </div>
                        }
                        content={`Family registration request with ${data?.compositions?.length} members`}
                      />
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">
              No recent requests
            </h3>
            <p className="text-sm text-gary-500">
              Registration requests recently submitted will appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {profilingSidebar?.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Link to="/profiling/request/pending/individual">
            <Button variant={"link"}>View All Requests</Button>
          </Link>
        </div>
      )}
    </Card>
  );
};
