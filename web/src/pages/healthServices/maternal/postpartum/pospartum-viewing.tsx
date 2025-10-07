// Postpartum Form Viewing

// imports
import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";

const personalInfo = [
  {
    name: "Name:",
    value: "",
    className: "mr-8 w-[400px]"
  },
  {
    name: "Age:",
    value: "",
    className: "w-32"
  },
  {
    name: "Husband's Name:",
    value: "",
    className: "mr-8 w-[330px]"
  },
  {
    name: "Address:",
    value: "",
    className: "w-[300px]"
  }
];

const personalInfoFieldGroups = [
  // [personalInfo[0]], // family no.
  [personalInfo[0], personalInfo[1]], // name. age
  [personalInfo[2], personalInfo[3]] // husband's name, address
];

// delivery info
const deliveryInfo = [
  {
    name: "Date & Time of Delivery:",
    value: "",
    className: "mr-8 w-[286px]"
  },
  {
    name: "Place of Delivery:",
    value: "",
    className: "w-[240px]"
  },
  {
    name: "Attended by:",
    value: "",
    className: "mr-8 w-[360px]"
  },
  {
    name: "Outcome",
    value: "",
    className: "w-[300px]"
  }
];

const deliveryInfoFieldGroups = [
  [deliveryInfo[0], deliveryInfo[1]], // date & time of delivery, place of delivery
  [deliveryInfo[2], deliveryInfo[3]] // attended by, outcome
];

// postpartum care info
const postpartumCareInfo = [
  {
    name: "TT Status:",
    value: "",
    className: "mr-8 w-[384px]"
  },
  {
    name: "Iron Supplementation:",
    value: "",
    className: "w-[230px]"
  },
  {
    name: "Lochial Discharges:",
    value: "",
    className: "mr-8 w-[325px]"
  },
  {
    name: "Vit A Supplementation:",
    value: "",
    className: "w-[225px]"
  },
  {
    name: "No. of pad / day:",
    value: "",
    className: "mr-8 w-[330px]"
  },
  {
    name: "Mebenendazole given (if not given during prenatal):",
    value: "",
    className: "w-[130px]"
  },
  {
    name: "Date & Time initiated BF:",
    value: "",
    className: "w-[288px]"
  }
];

const postpartumCareInfoFieldGroups = [
  [postpartumCareInfo[0], postpartumCareInfo[1]], // tt status, iron supplementation
  [postpartumCareInfo[2], postpartumCareInfo[3]], // lochial discharges, vit a supplementation
  [postpartumCareInfo[4], postpartumCareInfo[5]], // no. of pad/day, mebendazole
  [postpartumCareInfo[6]] // date & time initiated bf
];

// input line component
export const InputLine = ({ className }: { className: string }) => <Input className={cn("w-1/2 mr-2 border-0 border-b border-black rounded-none", className)} readOnly />;

const styles = {
  tableBody: "p-2 border border-black"
};

export default function PostpartumViewing() {
  type postpartumCare = {
    date: string;
    lochialDischarges: string;
    bp: string;
    feeding: string;
    findings: string;
    nursesNotes: string;
  };

  const sampleData: postpartumCare[] = [
    {
      date: "10/01/2025",
      lochialDischarges: "Rubra",
      bp: "120/80",
      feeding: "Breastfeeding",
      findings: "Normal",
      nursesNotes: "None"
    },
    {
      date: "12/01/2025",
      lochialDischarges: "Rubra",
      bp: "120/80",
      feeding: "Breastfeeding",
      findings: "Normal",
      nursesNotes: "None"
    },
    {
      date: "10/01/2025",
      lochialDischarges: "Rubra",
      bp: "120/80",
      feeding: "Breastfeeding",
      findings: "Normal",
      nursesNotes: "None"
    },
    {
      date: "10/01/2025",
      lochialDischarges: "Rubra",
      bp: "120/80",
      feeding: "Breastfeeding",
      findings: "Normal",
      nursesNotes: "None"
    }
  ];

  return (
    <div>
      <div className="flex">
        <Link to="/maternalindividualrecords">
          <Button className="text-black p-2 self-start" variant={"outline"}>
            <ChevronLeft />
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row ml-3 justify-between items-start sm:items-center gap-4">
          <div className="flex-col items-center mb-4">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Postpartum Care Viewing</h1>
            <p className="text-xs sm:text-sm text-darkGray">View mother's postpartum information</p>
          </div>
        </div>
      </div>

      <div className="flex w-full mx-auto m-3 p-10 border border-gray-300 bg-white">
        <div className="container ">
          <div className="m-5">
            <div className="mt-[50px]">
              <h4 className="text-center text-2xl m-4 pb-3">
                {" "}
                <b>POSTPARTUM RECORD</b>{" "}
              </h4>
            </div>

            {/* personal info */}
            <div className="flex w-full justify-end">
              <Label className="mt-4">FAMILY NO.</Label>
              <InputLine className="w-[150px]"></InputLine>
            </div>

            <div className="flex flex-col w-full">
              {personalInfoFieldGroups.map((group, index) => (
                <div className="flex" key={index}>
                  {group.map((info, i) => (
                    <div className="flex items-center">
                      <React.Fragment key={i}>
                        <Label className="mt-4">{info.name}</Label>
                        <InputLine className={info.className}></InputLine>
                      </React.Fragment>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* delivery info */}
            <div className="flex flex-col w-full">
              {deliveryInfoFieldGroups.map((group, index) => (
                <div className="flex" key={index}>
                  {group.map((info, i) => (
                    <React.Fragment key={i}>
                      <Label className="mt-4">{info.name}</Label>
                      <InputLine className={info.className}></InputLine>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>

            {/* postpartum care info */}
            <div className="flex flex-col w-full">
              {postpartumCareInfoFieldGroups.map((group, index) => (
                <div className="flex" key={index}>
                  {group.map((info, i) => (
                    <React.Fragment key={i}>
                      <Label className="mt-4">{info.name}</Label>
                      <InputLine className={info.className}></InputLine>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* postpartum table */}
          <div className="flex mt-8 w-full">
            <table className="w-full m-5 border border-black">
              <thead>
                <tr className="border border-black">
                  <th className="w-[100px] border border-black">Date</th>
                  <th className="p-2 w-[140px] border border-black">Lochial Discharges</th>
                  <th className="w-[100px] border border-black">B/P</th>
                  <th className="w-[150px] border border-black">Feeding</th>
                  <th className="w-[280px] border border-black">Findings</th>
                  <th className="w-[200px] border border-black">Nurses Notes</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {sampleData.map((data, index) => (
                  <tr key={index} className="border border-black">
                    <td className={styles.tableBody}>{data.date}</td>
                    <td className={styles.tableBody}>{data.lochialDischarges}</td>
                    <td className={styles.tableBody}>{data.bp}</td>
                    <td className={styles.tableBody}>{data.feeding}</td>
                    <td className={styles.tableBody}>{data.findings}</td>
                    <td className={styles.tableBody}>{data.nursesNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
