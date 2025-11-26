// imports
import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import TableLoading from "@/components/ui/table-loading";

import { usePatientPostpartumCompleteRecord } from "../../../queries/maternalFetchQueries";
import { usePostpartumAssessements } from "../../../queries/maternalFetchQueries";
import { capitalize } from "@/helpers/capitalize";

// input line component
export const InputLine = ({
  className,
  value,
}: {
  className: string;
  value?: string;
}) => (
  <Input
    className={cn(
      "w-1/2 mr-2 border-0 border-b border-black rounded-none",
      className
    )}
    value={value || ""}
    readOnly
  />
);

const styles = {
  tableBody: "p-2 border border-black",
};

interface PostpartumViewingProps {
  pprId?: string;
}

// main component
export default function PostpartumViewing({ pprId }: PostpartumViewingProps) {
  const { data: postpartumForm, isLoading: formLoading, error: formError } = usePatientPostpartumCompleteRecord(pprId || "");
  const { data: assessmentsData, isLoading: assessmentsLoading, error: assessmentsError } = usePostpartumAssessements(postpartumForm?.patient_details?.pat_id || "");

  const printRef = React.useRef(null);


  type postpartumCare = {
    date: string;
    lochialDischarges: string;
    bp: string;
    feeding: string;
    findings: string;
    nursesNotes: string;
  };

  // Filter, transform assessments by ppr_id - MUST be before early returns
  const transformedAssessments = React.useMemo((): postpartumCare[] => {
    if (!assessmentsData?.postpartum_assessments) {
      return [];
    }

    // Get all assessments up to and including the accessed ppr_id
    const allAssessments = assessmentsData.postpartum_assessments;
    
    let filteredAssessments = allAssessments;
    
    if (pprId) {
      const accessedRecordIndex = allAssessments.findIndex(
        (a: any) => a.postpartum_record_info?.ppr_id === pprId
      );

      if (accessedRecordIndex !== -1) {
        // API is newest -> oldest; show clicked + all older (historical) assessments
        filteredAssessments = allAssessments.slice(accessedRecordIndex);
      }
    }

    // Sort from oldest to latest by visit date then transform
    const sortedAssessments = [...filteredAssessments].sort((a: any, b: any) => {
      const dateA = a.ppa_date_of_visit ? new Date(a.ppa_date_of_visit).getTime() : 0;
      const dateB = b.ppa_date_of_visit ? new Date(b.ppa_date_of_visit).getTime() : 0;
      return dateA - dateB; // oldest first
    });

    return sortedAssessments.map((assessment: any) => ({
      date: assessment.ppa_date_of_visit || "",
      lochialDischarges: assessment.postpartum_record_info?.ppr_lochial_discharges || "",
      bp: assessment.vital_signs
        ? `${assessment.vital_signs.vital_bp_systolic}/${assessment.vital_signs.vital_bp_diastolic}`
        : "",
      feeding: assessment.ppa_feeding || "",
      findings: assessment.ppa_findings || "",
      nursesNotes: assessment.ppa_nurses_notes || "",
    }));
  }, [assessmentsData, pprId]);

  const isLoading = formLoading || assessmentsLoading;
  const error = formError || assessmentsError;

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "letter",
    })

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Postpartum-${pprId || 'record'}.pdf`);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <TableLoading />
      </div>
    );
  }

  if (error || !postpartumForm) {
    return (
      <div className="text-center text-red-600 p-4">
        Failed to load postpartum record. Please try again.
      </div>
    );
  }

  // Extract data from API response
  const personalInfo = postpartumForm?.patient_details?.personal_info;
  const address = postpartumForm?.patient_details?.address;
  const family = postpartumForm?.patient_details?.family;
  const deliveryRecord = postpartumForm?.delivery_records?.[0];

  // Check if patient is resident and get spouse information
  const isResident =
    postpartumForm?.patient_details?.pat_type?.toLowerCase() === "resident";
  const fatherInfo =
    postpartumForm?.patient_details?.family?.family_heads?.father
      ?.personal_info;
  const spouseInfo = postpartumForm?.spouse;

  // Calculate age
  const age = personalInfo?.per_dob
    ? Math.floor(
        (new Date().getTime() - new Date(personalInfo.per_dob).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      ).toString()
    : "";

  return (
    <div className="w-full">
      <div className="flex justify-end max-w-6xl mt-8 mx-auto">
        <Button onClick={handleDownloadPDF} className="text-sm">
          <Download />
            PDF
        </Button>
      </div>

      <div className="flex max-w-6xl h-[80rem] mx-auto m-5 overflow-hidden border border-gray-500">
        <div ref={printRef} className="container">
          <div className="m-5 px-8">
            <div className="mt-[6rem]">
              <h4 className="text-center text-2xl m-4 pb-3">
                {" "}
                <b>POSTPARTUM RECORD</b>{" "}
              </h4>
            </div>

            {/* personal info */}
            <div className="flex w-full justify-end">
              <Label className="mt-4">FAMILY NO.</Label>
              <InputLine
                className="w-[150px]"
                value={family?.fam_id || ""}
              ></InputLine>
            </div>

            <div className="flex flex-col w-full">
              {/* Name and Age */}
              <div className="flex">
                <div className="flex items-center">
                  <Label className="mt-4">Name:</Label>
                  <InputLine
                    className="mr-8 w-[400px]"
                    value={capitalize(`${personalInfo?.per_lname || ""}, ${
                      personalInfo?.per_fname || ""
                    } ${personalInfo?.per_mname || ""}`.trim())}
                  />
                </div>
                <div className="flex items-center">
                  <Label className="mt-4">Age:</Label>
                  <InputLine className="w-32" value={age} />
                </div>
              </div>

              {/* Husband's Name and Address */}
              <div className="flex">
                <div className="flex items-center">
                  <Label className="mt-4">Husband's Name:</Label>
                  <InputLine
                    className="mr-8 w-[330px]"
                    value={
                      isResident && fatherInfo
                        ? `${fatherInfo.per_lname || ""}, ${
                            fatherInfo.per_fname || ""
                          } ${fatherInfo.per_mname || ""}`.trim()
                        : spouseInfo
                        ? `${spouseInfo.spouse_lname || ""}, ${
                            spouseInfo.spouse_fname || ""
                          } ${spouseInfo.spouse_mname || ""}`.trim()
                        : ""
                    }
                  />
                </div>
                <div className="flex items-center">
                  <Label className="mt-4">Address:</Label>
                  <InputLine
                    className="w-[300px]"
                    value={`${address?.add_street || ""} ${
                      address?.add_sitio || ""
                    } ${address?.add_barangay || ""} ${
                      address?.add_city || ""
                    } ${address?.add_province || ""}`.trim()}
                  />
                </div>
              </div>
            </div>

            {/* delivery info */}
            <div className="flex flex-col w-full">
              {/* Date & Time of Delivery and Place of Delivery */}
              <div className="flex">
                <Label className="mt-4">Date & Time of Delivery:</Label>
                <InputLine
                  className="mr-8 w-[286px]"
                  value={
                    deliveryRecord
                      ? `${deliveryRecord.ppdr_date_of_delivery || ""} ${
                          deliveryRecord.ppdr_time_of_delivery || ""
                        }`.trim()
                      : ""
                  }
                />
                <Label className="mt-4">Place of Delivery:</Label>
                <InputLine
                  className="w-[240px]"
                  value={deliveryRecord?.ppdr_place_of_delivery || ""}
                />
              </div>

              {/* Attended by and Outcome */}
              <div className="flex">
                <Label className="mt-4">Attended by:</Label>
                <InputLine
                  className="mr-8 w-[360px]"
                  value={deliveryRecord?.ppdr_attended_by || ""}
                />
                <Label className="mt-4">Outcome:</Label>
                <InputLine
                  className="w-[300px]"
                  value={deliveryRecord?.ppdr_outcome || ""}
                />
              </div>
            </div>

            {/* postpartum care info */}
            <div className="flex flex-col w-full">
              {/* TT Status and Iron Supplementation */}
              <div className="flex">
                <Label className="mt-4">TT Status:</Label>
                <InputLine
                  className="mr-8 w-[384px]"
                  value={postpartumForm?.tts_info?.tts_status || ""}
                />
                <Label className="mt-4">Iron Supplementation:</Label>
                <InputLine
                  className="w-[230px]"
                  value={postpartumForm?.tts_info?.tts_date_given || ""}
                />
              </div>

              {/* Lochial Discharges and Vit A Supplementation */}
              <div className="flex">
                <Label className="mt-4">Lochial Discharges:</Label>
                <InputLine
                  className="mr-8 w-[325px]"
                  value={postpartumForm?.ppr_lochial_discharges || ""}
                />
                <Label className="mt-4">Vit A Supplementation:</Label>
                <InputLine
                  className="w-[225px]"
                  value={postpartumForm?.ppr_vit_a_date_given || ""}
                />
              </div>

              {/* No. of pad/day and Mebendazole */}
              <div className="flex">
                <Label className="mt-4">No. of pad / day:</Label>
                <InputLine
                  className="mr-8 w-[330px]"
                  value={postpartumForm?.ppr_num_of_pads?.toString() || ""}
                />
                <Label className="mt-4">
                  Mebendazole given (if not given during prenatal):
                </Label>
                <InputLine
                  className="w-[130px]"
                  value={postpartumForm?.ppr_mebendazole_date_given || ""}
                />
              </div>

              {/* Date & Time initiated BF */}
              <div className="flex">
                <Label className="mt-4">Date & Time initiated BF:</Label>
                <InputLine
                  className="w-[288px]"
                  value={
                    postpartumForm
                      ? `${postpartumForm.ppr_date_of_bf || ""} ${
                          postpartumForm.ppr_time_of_bf || ""
                        }`.trim()
                      : ""
                  }
                />
              </div>
            </div>
          </div>

          {/* postpartum table */}
          <div className="flex mt-8 w-full">
            <table className="w-full mx-10 border border-black">
              <thead>
                <tr className="border border-black">
                  <th className="w-[100px] border border-black">Date</th>
                  <th className="p-2 w-[140px] border border-black">
                    Lochial Discharges
                  </th>
                  <th className="w-[100px] border border-black">B/P</th>
                  <th className="w-[150px] border border-black">Feeding</th>
                  <th className="w-[280px] border border-black">Findings</th>
                  <th className="w-[200px] border border-black">
                    Nurses Notes
                  </th>
                </tr>
              </thead>
              <tbody className="text-center">
                {transformedAssessments.length > 0 ? (
                  transformedAssessments.map((data, index) => (
                    <tr key={index} className="border border-black">
                      <td className={styles.tableBody}>{data.date}</td>
                      <td className={styles.tableBody}>
                        {data.lochialDischarges}
                      </td>
                      <td className={styles.tableBody}>{data.bp}</td>
                      <td className={styles.tableBody}>{data.feeding}</td>
                      <td className={styles.tableBody}>{data.findings}</td>
                      <td className={styles.tableBody}>{data.nursesNotes}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border border-black">
                    <td className={styles.tableBody} colSpan={6}>
                      No postpartum assessments recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
