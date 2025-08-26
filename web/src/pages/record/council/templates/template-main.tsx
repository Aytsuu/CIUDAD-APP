import { useState } from 'react';
import { Button } from "@/components/ui/button/button";
import { Input } from '@/components/ui/input';
import { Plus, SquarePen, Search } from 'lucide-react';
import CardLayout from "@/components/ui/card/card-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import TemplateCreateForm from "./template-create";
import TemplateUpdateForm from "./template-update";
import { useGetTemplateRecord } from './queries/template-FetchQueries';
import TemplatePreview from './template-preview';
import { Skeleton } from "@/components/ui/skeleton";



type Template = {
  temp_title: string;
  temp_subtitle?: string;
  temp_belowHeaderContent?: string;
  temp_barangayLogo: string;
  temp_cityLogo: string;
  temp_email?: string;
  temp_telNum: string;
  temp_paperSize: string;
  temp_margin: string;
  temp_filename: string;
  temp_summon?: boolean;
  temp_w_sign_right: boolean;
  temp_w_sign_left: boolean;
  temp_w_sign_applicant: boolean;
  temp_w_seal: boolean;
  temp_body: string;
  temp_id?: number; // Added optional temp_id for consistency
}


function TemplateMainPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false); 
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data: templates = [], isLoading } = useGetTemplateRecord();

  // Find the barangay logo directly
  const barangayLogo = templates[0]?.template_files.find(file => file.tf_logoType === "barangayLogo")?.tf_url || "";

  // Find the city logo directly  
  const cityLogo = templates[0]?.template_files.find(file => file.tf_logoType === "cityLogo")?.tf_url || "";

  console.log("TEMPLATES: ", templates)

  const TemplateRecords: Template[] = [
    {
      temp_id: 1,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Identification",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*IDENTIFICATION (ID) PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },     
    {
      temp_id: 2,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Loan",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*LOAN PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },    
    {
      temp_id: 3,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Social Security System (SSS)",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*SOCIAL SECURITY SYSTEM (SSS) PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },    
    {
      temp_id: 4,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "BIR",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*BUREAU OF INTERNAL REVENUE (BIR) PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },  
    {
      temp_id: 5,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Bank Requirement",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*BANK REQUIREMENTS PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },     
    {
      temp_id: 6,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Employment",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*EMPLOYMENT PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },   
    {
      temp_id: 7,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Electrical Connection",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*ELECTRICAL CONNECTION PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },   
    {
      temp_id: 8,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "MCWD",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*MCWD PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    }, 
    {
      temp_id: 9,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Scholarship",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*SCHOLARSHIP PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },        
    {
      temp_id: 10,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Postal ID",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*POSTAL ID PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },    
    {
      temp_id: 11,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "NBI",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*NATIONAL BUREAU OF INVESTIGATION (NBI) PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },        
    {
      temp_id: 12,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Board Examination",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*BOARD EXAMINATION PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },          
    {
      temp_id: 13,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Tesda Requirement",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*TESDA REQUIREMENTS PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },  
    {
      temp_id: 14,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "School Requirement",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*SCHOOL REQUIREMENTS PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },      
    {
      temp_id: 15,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "PWD Application",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*PWD APPLICATION PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },        
    {
      temp_id: 16,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Señior Citizen Application",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*SEÑIOR CITIZEN IDENTIFICATION PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },  
    {
      temp_id: 17,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Señior Citizen Assistance",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*SEÑIOR CITIZEN FINANCIAL ASSISTANCE PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },        
    {
      temp_id: 18,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Bail Bond",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*BAIL BOND PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },  
    {
      temp_id: 19,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Fire Victim",
      temp_w_sign_right: false,
      temp_w_sign_left: true,
      temp_w_sign_applicant: false,
      temp_w_seal: false,
      temp_body: "TO WHOM IT MAY CONCERN:\n\nThis is to CERTIFY that [ NAME ] of legal age, is a resident of [ ADDRESS ], Barangay San Roque (Ciudad) Cebu City.\n\n" +
      "This is to CERTIFY further that the above-mentioned person has been affected by Conflagration/Fire which occured on [MONTH] [DAY], [YEAR] at [HOUR:MINS] in the [afternoon]. " +
      "That his/her house/property including her important documents in the said area were totally damaged.\n\n" +
      "This CERTIFICATION issued upon the request of the interested party as a supporting document for /*ALS PURPOSES ONLY.*/" 
    },    
    {
      temp_id: 20,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Building Permit",
      temp_w_sign_right: false,
      temp_w_sign_left: true,
      temp_w_sign_applicant: false,
      temp_w_seal: false,
      temp_body: "/*TO WHOM IT MAY CONCERN:*/\n\nThis is to certify that [ NAME OF BUILDING ], located at [ LOCATION ] , Barangay San Roque Ciudad Cebu City.\n\n" +
      "That upon inspection and verification we found such application to be in order. Therefore, I grant the issuance of this /*BUILDING PERMIT*/ in " +
      "compliance of the government requirements for whatever purpose this may serve.\n\nBarangay Certification is hereby issued upon the requirements " +
      "of the above mentioned-name. However this clearance may be cancelled or revoked anytime the public safety and interest so required.\n\n" +
      "Given this [ DAY [st/nd/rd/th] ] day of [ AUGUST ] [2025] at Barangay San Roque (Ciudad) Cebu City."
    },   
    {
      temp_id: 21,
      temp_title: "CERTIFICATION",
      temp_subtitle: "(Cohabitation)",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Cohabitation",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Cidudad:\n\nThis is to certify that " +
      "[ NAME OF PERSON ] and [ NAME OF PERSON ], legal age and resident of R. Palma St., Barangay San Roque Ciudad Cebu City.\n\n" +
      "This is to certify further that the above mentioned name are common-law partner and living together under the same roof for 2 years.\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application [ PURPOSE ] /*PURPOSES ONLY*/.  " +
      "Affixed below is the name and signature of the above mentioned name.\n\nIssued this [ DAY [st/nd/rd/th] ] day of [ MONTH ] [ YEAR ] at Barangay San Roque (Ciudad) " +
      "Cebu City, Cebu Philippines." 
    },     
    {
      temp_id: 22,
      temp_title: "BARANGAY BUSINESS CLEARANCE",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Business Clearance",
      temp_w_sign_right: true,
      temp_w_sign_left: false,
      temp_w_sign_applicant: false,
      temp_w_seal: false,
      temp_body: "\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that [ NAME OF BUSINESS ] residence / office address at [ ADDRESS OF THE BUSINESS],  /*Barangay San Roque (Ciudad), Cebu City*/. Which " +
      "is within the Territorial Jurisdiction of the Barangay in accordance with Section # 152 of Republic Act No. 7160, otherwise known as Local Government Code 1991.\n\n\n" +
      "\t\tThis clearance is issued upon the request of the subject person / establishment for\n\n" +
      "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/*BARANGAY BUSINESS PERMIT*/\n\n" +
      "\tIssued this [ DAY [st/nd/rd/th] ] day [MONTH] [YEAR] at Barangay San Roque (Ciudad), Cebu City"
    },      
    {
      temp_id: 23,
      temp_belowHeaderContent: "                                            Barangay Case No.[ Case No. ]\n" +
      "Brgy, San Roque Ciudad Cebu City            For: [ Reason ]\n" +
      "[ Name of Complainant ]\n\n" +
      "      - AGAINTS -\n\n" +
      "Brgy, San Roque Ciudad Cebu City\n" +
      "[ Name of Respondent ]\n\n",
      temp_title: "CERTIFICATION TO FILE ACTION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "narrow",
      temp_filename: "File Action",
      temp_summon: true,
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: false,
      temp_w_seal: false,
      temp_body: "\nThis is to certify that:\n\n" +
      "1. There was a complaint filled in this Office on [SEPTEMBER] [10], [2025];\n\n" +
      "2. There has been a personal confrontation between the parties before the Punong Barangay but mediation failed;\n\n" +
      "3. The Pangkat ng Tagapangkasundo was constituted but the personal confrontation before the Pangkat likewise did not result into settlement;\n\n" +
      "4. Therefore, the corresponding complaint for the dispute may now be filed in the court/government office.\n\n" +
      "This [ DAY [st/nd/rd/th] ] day of [MONTH] [YEAR] in Barangay San Roque Ciudad Cebu City." 
    },       
    {
      temp_id: 24,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Marriage",
      temp_summon: false,
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad.\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +      
      "This is to certify further that they are living together in one household live-in partners for more than [ YEARS ] years in Barangay " +
      "San Roque Ciudad Cebu City.\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for /*MARRIAGE LICENCSE PURPOSES ONLY.*/\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },  
    {
      temp_id: 25,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "DWUP",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that [PLACE] located at [ADDRESS], Barangay SAn Roque (Ciudad) Cebu City.\n\n" +
      "This is to CERTIFY further that the above-mentioned person has been affected by demolished which occured on year [YEAR DEMOLISHED]\n\n" +
      "This certication issued of the interested party as supporting document for /*DWUP Requirement*/ /*Purposes Only.*/\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },          
    {
      temp_id: 26,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Probation",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*PROBATION PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },    
    {
      temp_id: 27,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Police Clearance",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*POLICE CLEARANCE PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },     
    {
      temp_id: 28,
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Burial Assistance",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*BURIAL ASSISTANCE PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },  
    {
      temp_id: 29,
      temp_title: "CERTIFICATE OF INDIGENCY",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "PHILHEALTH",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*[PURPOSE] PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name. They are one of those who belong to an indigent family, no income/low income.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },           
    {
      temp_id: 30,
      temp_title: "BARANGAY CERTIFICATION",
      temp_subtitle: "(First Time Jobseeker Assistance Act-R.A 11261)",      
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "First Time Jobseeker",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: false,
      temp_body: "This is to certify that [ NAME ], a resident of [ ADDRESS ], Barangay San Roque (Ciudad) Cebu City for 1 year is qualified availee of R.A 11261 of the First Time Jobseekers Act of 2019.\n\n" +
      "I further certify that the holder/bearer was informed of his/her rights Oath of Undertaking he/she has signed and executed in the presence of our Barangay Official.\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for /*EMPLOYMENT PURPOSES ONLY*/. Affixed below is the name and signature of the above mentioned name.\n\n" +
      "Signed this [ DAY [st/nd/rd/th] ] day of [MONTH] [YEAR] in Barangay San Roque (Ciudad) Cebu City,\n\n" +
      "This certification is valid only one (1) year from the issuance."
    },   
    {
      temp_id: 31,
      temp_title: "BARANGAY CLEARANCE", 
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Barangay Clearance",
      temp_w_sign_right: true,
      temp_w_sign_left: false,
      temp_w_sign_applicant: false,
      temp_w_seal: false,
      temp_body: "\n/*TO WHOM IT MAY CONCERN:*/\n\n" +
      "This is to certify that [NAME] with business located at [ADRESS], after complying with the requirements prescribed by this office, is hereby issues a Barangay Clearnce for the purpose of " +
      "securing/obtaining /*WORK PERMIT*/ and be able to work within the barangay jusrisdiction. However, this Barangay Clearance may be cancelled or revoked anytime the public safety and interest so required.\n\n" +
      "Issued this [ DAY [st/nd/rd/th] ] day of [MONTH] [YEAR] at Barangay San Roque (Ciudad), Cebu City"
    },      
    {
      temp_id: 32,
      temp_title: "CERTIFICATION", 
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Proof of Custody",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "TO WHOM IT MAY CONCERN:\n\n" +
      "This is to certify that [NAME] of legal age, [GENDER], is a resident of [ADDRESS], Barangay San Roque Ciudad, Cebu City.\n\n" +
      "This is to certify that [his/her] [Number in words] [(No.)] grandchild listed below are minors and are under her care and custody and supported them financially, morally and spiritually.\n\n" +
      "[No.] [Name]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for /*PSA PURPOSES ONLY*/. Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [ DAY [st/nd/rd/th] ] day of [MONTH] [YEAR] at Barangay San Roque (Ciudad), Cebu City, Cebu Philippines."
    },       
  ];  


  const filteredTemplates = TemplateRecords.filter(template => 
    template.temp_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.temp_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }


  const isTemplateEmpty = (template: Template) => {
    return !template.temp_body || !template.temp_title || !template.temp_barangayLogo;
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Document Templates</h1>
        <p className="text-xs sm:text-sm text-darkGray">Manage and view document templates</p>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <div className="w-full flex flex-col sm:flex-row justify-between items-center pb-7 gap-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={17}
          />
          <Input 
            placeholder="Search templates..." 
            className="pl-10 w-full bg-white text-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Edit/Add Details Button */}
        {templates.length > 0 ? (
          <DialogLayout
            trigger={
              <Button className="w-full sm:w-auto">
                <SquarePen size={20} /> Edit Details
              </Button>
            }
            className="max-w-[30%] max-h-[80%] flex flex-col overflow-auto scrollbar-custom"
            title="Template Common Details"
            description="Edit the needed details"
            mainContent={
              <div className="w-full h-full">
                <TemplateUpdateForm 
                  temp_id={templates[0].temp_id}
                  temp_contact_num={templates[0].temp_contact_num}
                  temp_email={templates[0].temp_email}
                  template_files={templates[0].template_files}
                  onSuccess={() => setIsDialogOpen(false)} 
                />
              </div>
            }
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        ) : (
          <DialogLayout
            trigger={
              <Button className="w-full sm:w-auto">
                <Plus size={20} /> Add Details
              </Button>
            }
            className="max-w-[30%] max-h-[80%] flex flex-col overflow-auto scrollbar-custom"
            title="Template Common Details"
            description="please provide the needed details"
            mainContent={
              <div className="w-full h-full">
                <TemplateCreateForm onSuccess={() => setIsDialogOpen(false)} />
              </div>
            }
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        )}
      </div>

      <div className="rounded bg-white min-h-[200px] p-10 mb-40">
        {filteredTemplates.length === 0 ? (
          <p className="text-center text-gray-500">No template found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {filteredTemplates
              // Sort templates alphabetically by filename
              .sort((a, b) => a.temp_filename.localeCompare(b.temp_filename))
              .map((template) => (
                <div 
                  key={template.temp_id} 
                  className={`relative group ${isTemplateEmpty(template) ? 'opacity-70' : ''}`}
                >
                  <div 
                    onClick={() => !isTemplateEmpty(template) && setPreviewTemplate(template)} 
                    className={`cursor-pointer ${isTemplateEmpty(template) ? 'cursor-not-allowed' : ''}`}
                  >
                    <CardLayout
                      title=""
                      description=""
                      contentClassName="p-0"
                      content={
                        <div className="relative h-40 w-full flex items-center justify-center rounded-xl overflow-hidden">
                          <div className="absolute inset-0 bg-gray-100" />
                          <div className="z-10 text-gray-400 text-4xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                          <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-xs sm:text-sm text-center py-1 px-2 z-20">
                            {template.temp_filename}
                            {isTemplateEmpty(template) && (
                              <span className="block text-xs text-yellow-200">Please provide the necessary details first.</span>
                            )}
                          </div>
                        </div>
                      }
                      cardClassName={`p-0 shadow hover:shadow-lg transition-shadow rounded-xl ${
                        isTemplateEmpty(template) ? 'hover:shadow-none' : ''
                      }`}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {previewTemplate && (
        <DialogLayout
          isOpen={!!previewTemplate}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
          className="max-w-full h-full flex flex-col overflow-auto scrollbar-custom"
          title=""
          description=""
          mainContent={
            <div className="w-full h-full">
              <TemplatePreview
                barangayLogo={previewTemplate.temp_barangayLogo}
                cityLogo={previewTemplate.temp_cityLogo}
                email={previewTemplate.temp_email}
                telNum={previewTemplate.temp_telNum}
                belowHeaderContent={previewTemplate.temp_belowHeaderContent}
                title={previewTemplate.temp_title}
                subtitle={previewTemplate.temp_subtitle}
                body={previewTemplate.temp_body}
                withSummon={previewTemplate.temp_summon}
                withSeal={previewTemplate.temp_w_seal}
                withSignRight={previewTemplate.temp_w_sign_right}
                withSignLeft={previewTemplate.temp_w_sign_left}
                withSignatureApplicant={previewTemplate.temp_w_sign_applicant}
                paperSize={previewTemplate.temp_paperSize} 
                margin={previewTemplate.temp_margin}
              />
            </div>
          }          
        />
      )}
    </div>
  );
}

export default TemplateMainPage;