// components/HealthHistoryAccordions.tsx
import { ChildHealthHistoryRecord } from "@/pages/healthServices/childservices/viewrecords/types";
import { SectionRenderer } from "@/components/ui/section-renderer";
import { EbfRenderer } from "@/components/ui/ebf-renderer";
import {
  ClipboardList,
  User,
  AlertTriangle,
  HeartPulse,
  Soup,
  Syringe,
  Pill,
} from "lucide-react";
import {
  recordOverviewFields,
  findingsFields,
  disabilitiesFields,
  vitalSignsFields,
  nutritionStatusesFields,
  notesFields,
  supplementsFields,
  exclusiveBfCheckFields,
  immunizationTrackingFields,
} from "@/pages/healthServices/childservices/viewrecords/Config";
import { AccordionSection } from "@/components/ui/accordion-section";

interface HealthHistoryAccordionsProps {
  recordsToDisplay: ChildHealthHistoryRecord[];
  chhistId: string;
  supplementStatusesFields: any[];
}

export function HealthHistoryAccordions({
  recordsToDisplay,
  chhistId,
  supplementStatusesFields,
}: HealthHistoryAccordionsProps) {
  return (
    <>
      <AccordionSection
        value="record-overview"
        title="TT status of the mother"
        icon={<ClipboardList className="h-5 w-5" />}
      >
        <SectionRenderer
          fields={recordOverviewFields}
          recordsToDisplay={recordsToDisplay}
          chhistId={chhistId}
        />
      </AccordionSection>


      {/* <AccordionSection
        value="parent-newborn"
        title="Parent & Newborn Screening"
        icon={<Users className="h-5 w-5" />}
      >
        <SectionRenderer
          fields={familyHeadInfoFields}
          recordsToDisplay={recordsToDisplay}
          chhistId={chhistId}
        />
      </AccordionSection> */}

      <AccordionSection
        value="exclusive-bf-checks"
        title="Exclusive Breastfeeding Checks"
        icon={<HeartPulse className="h-5 w-5" />}
      >
        <EbfRenderer
          field={exclusiveBfCheckFields[0]}
          recordsToDisplay={recordsToDisplay}
          chhistId={chhistId}
        />
      </AccordionSection>


      <AccordionSection
        value="find-details"
        title="Findings Details"
        icon={<User className="h-5 w-5" />}
      >
        <SectionRenderer
          fields={findingsFields}
          recordsToDisplay={recordsToDisplay}
          chhistId={chhistId}
        />
      </AccordionSection>
      
      <AccordionSection
        value="disabilities"
        title="Disabilities"
        icon={<AlertTriangle className="h-5 w-5" />}
      >
        <SectionRenderer
          fields={disabilitiesFields}
          recordsToDisplay={recordsToDisplay}
          chhistId={chhistId}
        />
      </AccordionSection>

      <AccordionSection
        value="vital-signs-notes"
        title="Vital Signs & Notes"
        icon={<HeartPulse className="h-5 w-5" />}
      >
        <SectionRenderer
          fields={[...vitalSignsFields, ...notesFields]}
          recordsToDisplay={recordsToDisplay}
          chhistId={chhistId}
        />
      </AccordionSection>

      <AccordionSection
        value="nutritional-status"
        title="Nutritional Status"
        icon={<Soup className="h-5 w-5" />}
      >
        <SectionRenderer
          fields={nutritionStatusesFields}
          recordsToDisplay={recordsToDisplay}
          chhistId={chhistId}
        />
      </AccordionSection>

      <AccordionSection
        value="immunization"
        title="Immunization"
        icon={<Syringe className="h-5 w-5" />}
      >
        <SectionRenderer
          fields={immunizationTrackingFields}
          recordsToDisplay={recordsToDisplay}
          chhistId={chhistId}
        />
      </AccordionSection>

      <AccordionSection
        value="supplements-status"
        title="Supplements & Supplement Status"
        icon={<Pill className="h-5 w-5" />}
      >
        <SectionRenderer
          fields={[...supplementsFields, ...supplementStatusesFields]}
          recordsToDisplay={recordsToDisplay}
          chhistId={chhistId}
        />
      </AccordionSection>
    </>
  );
}