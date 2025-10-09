// import { useState, useEffect } from 'react';
// import { Button } from "@/components/ui/button/button";
// import { Input } from '@/components/ui/input';
// import { Plus, SquarePen, Search } from 'lucide-react';
// import CardLayout from "@/components/ui/card/card-layout";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import TemplateCreateForm from "./template-create";
// import TemplateUpdateForm from "./template-update";
// import { useGetTemplateRecord } from './queries/template-FetchQueries';
// import TemplatePreview from './template-preview';
// import { Skeleton } from "@/components/ui/skeleton";
// import {formatTimestampToDate } from '@/helpers/summonTimestampFormatter';

// interface RequestProps {
//   fname?: string;
//   lname?: string;
//   age?: string;
//   birthdate?: string;
//   address?: string;
//   purpose?: string;
//   issuedDate?: string;
// }

// type Template = {
//   temp_title: string;
//   temp_subtitle?: string;
//   temp_belowHeaderContent?: string;
//   temp_barangayLogo: string;
//   temp_cityLogo: string;
//   temp_email?: string;
//   temp_telNum: string;
//   temp_paperSize: string;
//   temp_margin: string;
//   temp_filename: string;
//   temp_summon?: boolean;
//   temp_w_sign_right: boolean;
//   temp_w_sign_left: boolean;
//   temp_w_sign_applicant: boolean;
//   temp_w_seal: boolean;
//   temp_body: string;
//   temp_id?: string; // Added optional temp_id for consistency
// }


// function TemplateMainPage({fname, lname, age, birthdate, address, purpose, issuedDate} : RequestProps ) {
//   const [isDialogOpen, setIsDialogOpen] = useState(false); 
//   const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   // Fetch data
//   const { data: templates = [], isLoading } = useGetTemplateRecord();

//   // Find the barangay logo directly
//   const barangayLogo = templates[0]?.template_files.find(file => file.tf_logoType === "barangayLogo")?.tf_url || "";

//   // Find the city logo directly  
//   const cityLogo = templates[0]?.template_files.find(file => file.tf_logoType === "cityLogo")?.tf_url || "";

//   //birthdate format
//   const FormattedIssuanceDate =  issuedDate ? formatTimestampToDate(issuedDate) : "";

//   // Auto-select template based on purpose when component mounts or purpose changes
//   useEffect(() => {
//     if (purpose) {
//       const matchedTemplate = TemplateRecords.find(template => 
//         template.temp_id?.toLowerCase() === purpose.toLowerCase()
//       );
      
//       if (matchedTemplate) {
//         setPreviewTemplate(matchedTemplate);
//       }
//     }
//   }, [purpose]);  

//   console.log("TEMPLATES: ", templates)

//   const TemplateRecords: Template[] = [
//     {
//       temp_id: "identification",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Identification",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       `NAME                     :           ${lname}, ${fname}\n` +
//       `AGE                        :            ${age}\n` +
//       `BIRTHDATE\t  :           ${birthdate}\n` +
//       `ADDRESS              :            ${address}\n\n` +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*IDENTIFICATION (ID) PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       `Issued this ${FormattedIssuanceDate} of Barangay San Roque Ciudad, Cebu City, Philippines.`
//     },     
//     {
//       temp_id: "loan",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Loan",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       `NAME                     :           ${lname}, ${fname}\n` +
//       `AGE                        :            ${age}\n` +
//       `BIRTHDATE\t  :           ${birthdate}\n` +
//       `ADDRESS              :            ${address}\n\n` +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*LOAN PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       `Issued this ${FormattedIssuanceDate} of Barangay San Roque Ciudad, Cebu City, Philippines.`
//     },    
//     {
//       temp_id: "sss",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Social Security System (SSS)",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       `NAME                     :           ${lname}, ${fname}\n` +
//       `AGE                        :            ${age}\n` +
//       `BIRTHDATE\t  :           ${birthdate}\n` +
//       `ADDRESS              :            ${address}\n\n` +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*SOCIAL SECURITY SYSTEM (SSS) PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       `Issued this ${FormattedIssuanceDate} of Barangay San Roque Ciudad, Cebu City, Philippines.`
//     },    
//     {
//       temp_id: "bir",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "BIR",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*BUREAU OF INTERNAL REVENUE (BIR) PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },  
//     {
//       temp_id: "bank",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Bank Requirement",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*BANK REQUIREMENTS PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },     
//     {
//       temp_id: "employment",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Employment",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       `NAME                     :           ${lname}, ${fname}\n` +
//       `AGE                        :            ${age}\n` +
//       `BIRTHDATE\t  :           ${birthdate}\n` +
//       `ADDRESS              :            ${address}\n\n` +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*EMPLOYMENT PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       `Issued this ${FormattedIssuanceDate} of Barangay San Roque Ciudad, Cebu City, Philippines.`
//     },   
//     {
//       temp_id: "Electrical Connection",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Electrical Connection",
//       temp_w_sign_right: false,
//       temp_w_sign_left: true,
//       temp_w_sign_applicant: false,
//       temp_w_seal: true,
//       temp_body: "/*TO WHOM IT MAY CONCERN:*/\n\n" +
//       `This is to certify that businessname located at ${address}, Barangay San Roque Ciudad, Cebu City.\n\n` +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*ELECTRICAL CONNECTION PURPOSES ONLY.*/\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },    
//     {
//       temp_id: "mcwd",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "MCWD",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*MCWD PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     }, 
//     {
//       temp_id: "scholarship",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Scholarship",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*SCHOLARSHIP PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },        
//     {
//       temp_id: "postID",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Postal ID",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*POSTAL ID PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },    
//     {
//       temp_id: "nbi",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "NBI",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*NATIONAL BUREAU OF INVESTIGATION (NBI) PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },        
//     {
//       temp_id: "board",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Board Examination",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*BOARD EXAMINATION PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },          
//     {
//       temp_id: "tesda",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Tesda Requirement",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*TESDA REQUIREMENTS PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },  
//     {
//       temp_id: "schoolRequire",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "School Requirement",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*SCHOOL REQUIREMENTS PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },      
//     {
//       temp_id: "pwdApp",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "PWD Application",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*PWD APPLICATION PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },        
//     {
//       temp_id: "seniorApp",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Señior Citizen Application",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*SEÑIOR CITIZEN IDENTIFICATION PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },  
//     {
//       temp_id: "seniorAss",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Señior Citizen Assistance",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*SEÑIOR CITIZEN FINANCIAL ASSISTANCE PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },        
//     {
//       temp_id: "bail",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Bail Bond",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*BAIL BOND PURPOSES ONLY.*/  " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },  
//     {
//       temp_id: "fire",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Fire Victim",
//       temp_w_sign_right: false,
//       temp_w_sign_left: true,
//       temp_w_sign_applicant: false,
//       temp_w_seal: false,
//       temp_body: "TO WHOM IT MAY CONCERN:\n\nThis is to CERTIFY that [ NAME ] of legal age, is a resident of [ ADDRESS ], Barangay San Roque (Ciudad) Cebu City.\n\n" +
//       "This is to CERTIFY further that the above-mentioned person has been affected by Conflagration/Fire which occured on [MONTH] [DAY], [YEAR] at [HOUR:MINS] in the [afternoon]. " +
//       "That his/her house/property including her important documents in the said area were totally damaged.\n\n" +
//       "This CERTIFICATION issued upon the request of the interested party as a supporting document for /*ALS PURPOSES ONLY.*/" 
//     },    
//     {
//       temp_id: "building",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Building Permit",
//       temp_w_sign_right: false,
//       temp_w_sign_left: true,
//       temp_w_sign_applicant: false,
//       temp_w_seal: false,
//       temp_body: "/*TO WHOM IT MAY CONCERN:*/\n\nThis is to certify that [ NAME OF BUILDING ], located at [ LOCATION ] , Barangay San Roque Ciudad Cebu City.\n\n" +
//       "That upon inspection and verification we found such application to be in order. Therefore, I grant the issuance of this /*BUILDING PERMIT*/ in " +
//       "compliance of the government requirements for whatever purpose this may serve.\n\nBarangay Certification is hereby issued upon the requirements " +
//       "of the above mentioned-name. However this clearance may be cancelled or revoked anytime the public safety and interest so required.\n\n" +
//       "Given this [ DAY [st/nd/rd/th] ] day of [ AUGUST ] [2025] at Barangay San Roque (Ciudad) Cebu City."
//     },   
//     {
//       temp_id: "cohabitation",
//       temp_title: "CERTIFICATION",
//       temp_subtitle: "(Cohabitation)",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Cohabitation",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Cidudad:\n\nThis is to certify that " +
//       "[ NAME OF PERSON ] and [ NAME OF PERSON ], legal age and resident of R. Palma St., Barangay San Roque Ciudad Cebu City.\n\n" +
//       "This is to certify further that the above mentioned name are common-law partner and living together under the same roof for 2 years.\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application [ PURPOSE ] /*PURPOSES ONLY*/.  " +
//       "Affixed below is the name and signature of the above mentioned name.\n\nIssued this [ DAY [st/nd/rd/th] ] day of [ MONTH ] [ YEAR ] at Barangay San Roque (Ciudad) " +
//       "Cebu City, Cebu Philippines." 
//     },     
//     {
//       temp_id: "bussClear",
//       temp_title: "BARANGAY BUSINESS CLEARANCE",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Business Clearance",
//       temp_w_sign_right: true,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: false,
//       temp_w_seal: false,
//       temp_body: "\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that [ NAME OF BUSINESS ] residence / office address at [ ADDRESS OF THE BUSINESS],  /*Barangay San Roque (Ciudad), Cebu City*/. Which " +
//       "is within the Territorial Jurisdiction of the Barangay in accordance with Section # 152 of Republic Act No. 7160, otherwise known as Local Government Code 1991.\n\n\n" +
//       "\t\tThis clearance is issued upon the request of the subject person / establishment for\n\n" +
//       "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/*BARANGAY BUSINESS PERMIT*/\n\n" +
//       "\tIssued this [ DAY [st/nd/rd/th] ] day [MONTH] [YEAR] at Barangay San Roque (Ciudad), Cebu City"
//     },      
//     {
//       temp_id: "fileAction",
//       temp_belowHeaderContent: "\t\t\t\t\t\t\t\t\t\t\t\t\t\tBarangay Case No.[ Case No. ]\n" +
//       "[ Name of Complainant ]\n" +
//       "[ Address ], Brgy. San Roque Ciudad Cebu City\n" +
//       "Complainant/s\n\n" +
//       "      - AGAINTS -\n\n" +
//       "[ Name of Respondent ]\n" +
//       "[ Address ], Brgy. San Roque Ciudad Cebu City\n" +
//       "Respondent/s\n",
//       temp_title: "CERTIFICATION TO FILE ACTION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "narrow",
//       temp_filename: "File Action",
//       temp_summon: true,
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: false,
//       temp_w_seal: false,
//       temp_body: "This is to certify that:\n\n" +
//       "1. There was a complaint filled in this Office on [SEPTEMBER] [10], [2025];\n\n" +
//       "2. There has been a personal confrontation between the parties before the Punong Barangay but mediation failed;\n\n" +
//       "3. The Pangkat ng Tagapangkasundo was constituted but the personal confrontation before the Pangkat likewise did not result into settlement;\n\n" +
//       "4. Therefore, the corresponding complaint for the dispute may now be filed in the court/government office.\n\n" +
//       "This [ DAY [st/nd/rd/th] ] day of [MONTH] [YEAR] in Barangay San Roque Ciudad Cebu City." 
//     },       
//     {
//       temp_id: "marriage",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Marriage",
//       temp_summon: false,
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad.\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +      
//       "This is to certify further that they are living together in one household live-in partners for more than [ YEARS ] years in Barangay " +
//       "San Roque Ciudad Cebu City.\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for /*MARRIAGE LICENCSE PURPOSES ONLY.*/\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },  
//     {
//       temp_id: "dwup",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "DWUP",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that [PLACE] located at [ADDRESS], Barangay SAn Roque (Ciudad) Cebu City.\n\n" +
//       "This is to CERTIFY further that the above-mentioned person has been affected by demolished which occured on year [YEAR DEMOLISHED]\n\n" +
//       "This certication issued of the interested party as supporting document for /*DWUP Requirement*/ /*Purposes Only.*/\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },          
//     {
//       temp_id: "probation",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Probation",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*PROBATION PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },    
//     {
//       temp_id: "policeClear",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Police Clearance",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*POLICE CLEARANCE PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },     
//     {
//       temp_id: "burial",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Burial Assistance",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*BURIAL ASSISTANCE PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },  
//     {
//       temp_id: "philhealth",
//       temp_title: "CERTIFICATE OF INDIGENCY",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "PHILHEALTH",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*[PURPOSE] PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name. They are one of those who belong to an indigent family, no income/low income.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },           
//     {
//       temp_id: "jobseeker",
//       temp_title: "BARANGAY CERTIFICATION",
//       temp_subtitle: "(First Time Jobseeker Assistance Act-R.A 11261)",      
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "First Time Jobseeker",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: false,
//       temp_body: "This is to certify that [ NAME ], a resident of [ ADDRESS ], Barangay San Roque (Ciudad) Cebu City for 1 year is qualified availee of R.A 11261 of the First Time Jobseekers Act of 2019.\n\n" +
//       "I further certify that the holder/bearer was informed of his/her rights Oath of Undertaking he/she has signed and executed in the presence of our Barangay Official.\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for /*EMPLOYMENT PURPOSES ONLY*/. Affixed below is the name and signature of the above mentioned name.\n\n" +
//       "Signed this [ DAY [st/nd/rd/th] ] day of [MONTH] [YEAR] in Barangay San Roque (Ciudad) Cebu City,\n\n" +
//       "This certification is valid only one (1) year from the issuance."
//     },   
//     {
//       temp_id: "barangayClear",
//       temp_title: "BARANGAY CLEARANCE", 
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Barangay Clearance",
//       temp_w_sign_right: true,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: false,
//       temp_w_seal: false,
//       temp_body: "\n/*TO WHOM IT MAY CONCERN:*/\n\n" +
//       "This is to certify that [NAME] with business located at [ADRESS], after complying with the requirements prescribed by this office, is hereby issues a Barangay Clearnce for the purpose of " +
//       "securing/obtaining /*WORK PERMIT*/ and be able to work within the barangay jusrisdiction. However, this Barangay Clearance may be cancelled or revoked anytime the public safety and interest so required.\n\n" +
//       "Issued this [ DAY [st/nd/rd/th] ] day of [MONTH] [YEAR] at Barangay San Roque (Ciudad), Cebu City"
//     },      
//     {
//       temp_id: "custody",
//       temp_title: "CERTIFICATION", 
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Proof of Custody",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "TO WHOM IT MAY CONCERN:\n\n" +
//       "This is to certify that [NAME] of legal age, [GENDER], is a resident of [ADDRESS], Barangay San Roque Ciudad, Cebu City.\n\n" +
//       "This is to certify that [his/her] [Number in words] [(No.)] grandchild listed below are minors and are under her care and custody and supported them financially, morally and spiritually.\n\n" +
//       "[No.] [Name]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for /*PSA PURPOSES ONLY*/. Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [ DAY [st/nd/rd/th] ] day of [MONTH] [YEAR] at Barangay San Roque (Ciudad), Cebu City, Cebu Philippines."
//     },       
//     {
//       temp_id: "Good Moral",
//       temp_title: "CERTIFICATION",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Good Moral",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This is to certify further that the above mention name has never been a subject of any crime complain nor was she/he is accused of any crime " +
//       "as per record of this office on file. She/he is personally known as a person of good moral character, has no derogatory record on file law-abiding citizen.\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*PWD FINANCIAL ASSISTANCE PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name.\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },     
//     {
//       temp_id: "Indigency (for minors)",
//       temp_title: "CERTIFICATE OF INDIGENCY",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "legal",
//       temp_margin: "normal",
//       temp_filename: "INDIGENCY (for minors)",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "Further certifies that the above-mentioned name is the child of \n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*PWD FINANCIAL ASSISTANCE PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name. They belong to an /*indigent family, no income/low income.*/\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },     
//     {
//       temp_id: "Indigency",
//       temp_title: "CERTIFICATE OF INDIGENCY",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "INDIGENCY",
//       temp_w_sign_right: false,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: true,
//       temp_w_seal: true,
//       temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
//       "NAME                     :           [ NAME ]\n" +
//       "AGE                        :            [ AGE ]\n" +
//       "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
//       "ADDRESS              :            [ ADDRESS ]\n\n" +
//       "This certification is being issued upon the request of the above mentioned name to support the application for the /*PWD FINANCIAL ASSISTANCE PURPOSES ONLY.*/   " +
//       "Affixed below is the name and signature of the above-mentioned name. They belong to an /*indigent family, no income/low income.*/\n\n" +
//       "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
//     },     
//     {
//       temp_id: "Barangay Sinulog Permit",
//       temp_title: "BARANGAY BUSINESS CLEARANCE",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Barangay Sinulog Permit",
//       temp_w_sign_right: true,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: false,
//       temp_w_seal: false,
//       temp_body: `\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that {businessName} residence / office address at ${address},  /*Barangay San Roque (Ciudad), Cebu City*/. Which ` +
//       "is within the Territorial Jurisdiction of the Barangay in accordance with Section # 152 of Republic Act No. 7160, otherwise known as Local Government Code 1991.\n\n\n" +
//       "\t\tThis clearance is issued upon the request of the subject person / establishment for\n\n" +
//       "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/*BARANGAY SINULOG PERMIT*/\n\n" +
//       `\tIssued this ${FormattedIssuanceDate} at Barangay San Roque (Ciudad), Cebu City`
//     },
//     {
//       temp_id: "Barangay Fiesta Permit",
//       temp_title: "BARANGAY BUSINESS CLEARANCE",
//       temp_barangayLogo: barangayLogo,
//       temp_cityLogo: cityLogo,
//       temp_email: templates[0]?.temp_email,  
//       temp_telNum: templates[0]?.temp_contact_num,
//       temp_paperSize: "letter",
//       temp_margin: "normal",
//       temp_filename: "Barangay Fiesta Permit",
//       temp_w_sign_right: true,
//       temp_w_sign_left: false,
//       temp_w_sign_applicant: false,
//       temp_w_seal: false,
//       temp_body: `\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that {businessName} residence / office address at ${address},  /*Barangay San Roque (Ciudad), Cebu City*/. Which ` +
//       "is within the Territorial Jurisdiction of the Barangay in accordance with Section # 152 of Republic Act No. 7160, otherwise known as Local Government Code 1991.\n\n\n" +
//       "\t\tThis clearance is issued upon the request of the subject person / establishment for\n\n" +
//       "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/*BARANGAY FIESTA PERMIT*/\n\n" +
//       `\tIssued this ${FormattedIssuanceDate} at Barangay San Roque (Ciudad), Cebu City`
//     },    
//   ];  


//   const filteredTemplates = TemplateRecords.filter(template => 
//     template.temp_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     template.temp_title.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (isLoading) {
//     return (
//       <div className="w-full h-full">
//         <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
//         <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
//         <Skeleton className="h-10 w-full mb-4 opacity-30" />
//         <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
//       </div>
//     );
//   }


//   const isTemplateEmpty = (template: Template) => {
//     return !template.temp_body || !template.temp_title || !template.temp_barangayLogo;
//   };

//   return (
//     <div className="w-full h-full">
//       <div className="flex flex-col mb-4">
//         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Document Templates</h1>
//         <p className="text-xs sm:text-sm text-darkGray">Manage and view document templates</p>
//       </div>
//       <hr className="border-gray mb-6 sm:mb-10" />

//       <div className="w-full flex flex-col sm:flex-row justify-between items-center pb-7 gap-4">
//         {/* Search Input */}
//         <div className="relative w-full">
//           <Search
//             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//             size={17}
//           />
//           <Input 
//             placeholder="Search templates..." 
//             className="pl-10 w-full bg-white text-sm" 
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
        
//         {/* Edit/Add Details Button */}
//         {templates.length > 0 ? (
//           <DialogLayout
//             trigger={
//               <Button className="w-full sm:w-auto">
//                 <SquarePen size={20} /> Edit Details
//               </Button>
//             }
//             className="max-w-[30%] max-h-[80%] flex flex-col overflow-auto scrollbar-custom"
//             title="Template Common Details"
//             description="Edit the needed details"
//             mainContent={
//               <div className="w-full h-full">
//                 <TemplateUpdateForm 
//                   temp_id={templates[0].temp_id}
//                   temp_contact_num={templates[0].temp_contact_num}
//                   temp_email={templates[0].temp_email}
//                   template_files={templates[0].template_files}
//                   onSuccess={() => setIsDialogOpen(false)} 
//                 />
//               </div>
//             }
//             isOpen={isDialogOpen}
//             onOpenChange={setIsDialogOpen}
//           />
//         ) : (
//           <DialogLayout
//             trigger={
//               <Button className="w-full sm:w-auto">
//                 <Plus size={20} /> Add Details
//               </Button>
//             }
//             className="max-w-[30%] max-h-[80%] flex flex-col overflow-auto scrollbar-custom"
//             title="Template Common Details"
//             description="please provide the needed details"
//             mainContent={
//               <div className="w-full h-full">
//                 <TemplateCreateForm onSuccess={() => setIsDialogOpen(false)} />
//               </div>
//             }
//             isOpen={isDialogOpen}
//             onOpenChange={setIsDialogOpen}
//           />
//         )}
//       </div>

//       <div className="rounded bg-white min-h-[200px] p-10 mb-40">
//         {filteredTemplates.length === 0 ? (
//           <p className="text-center text-gray-500">No template found.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
//             {filteredTemplates
//               // Sort templates alphabetically by filename
//               .sort((a, b) => a.temp_filename.localeCompare(b.temp_filename))
//               .map((template) => (
//                 <div 
//                   key={template.temp_id} 
//                   className={`relative group ${isTemplateEmpty(template) ? 'opacity-70' : ''}`}
//                 >
//                   <div 
//                     onClick={() => !isTemplateEmpty(template) && setPreviewTemplate(template)} 
//                     className={`cursor-pointer ${isTemplateEmpty(template) ? 'cursor-not-allowed' : ''}`}
//                   >
//                     <CardLayout
//                       title=""
//                       description=""
//                       contentClassName="p-0"
//                       content={
//                         <div className="relative h-40 w-full flex items-center justify-center rounded-xl overflow-hidden">
//                           <div className="absolute inset-0 bg-gray-100" />
//                           <div className="z-10 text-gray-400 text-4xl">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//                               <polyline points="14 2 14 8 20 8" />
//                             </svg>
//                           </div>
//                           <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-xs sm:text-sm text-center py-1 px-2 z-20">
//                             {template.temp_filename}
//                             {isTemplateEmpty(template) && (
//                               <span className="block text-xs text-yellow-200">Please provide the necessary details first.</span>
//                             )}
//                           </div>
//                         </div>
//                       }
//                       cardClassName={`p-0 shadow hover:shadow-lg transition-shadow rounded-xl ${
//                         isTemplateEmpty(template) ? 'hover:shadow-none' : ''
//                       }`}
//                     />
//                   </div>
//                 </div>
//               ))}
//           </div>
//         )}
//       </div>

//       {previewTemplate && (
//         <DialogLayout
//           isOpen={!!previewTemplate}
//           onOpenChange={(open) => !open && setPreviewTemplate(null)}
//           className="max-w-full h-full flex flex-col overflow-auto scrollbar-custom"
//           title=""
//           description=""
//           mainContent={
//             <div className="w-full h-full">
//               <TemplatePreview
//                 barangayLogo={previewTemplate.temp_barangayLogo}
//                 cityLogo={previewTemplate.temp_cityLogo}
//                 email={previewTemplate.temp_email}
//                 telNum={previewTemplate.temp_telNum}
//                 belowHeaderContent={previewTemplate.temp_belowHeaderContent}
//                 title={previewTemplate.temp_title}
//                 subtitle={previewTemplate.temp_subtitle}
//                 body={previewTemplate.temp_body}
//                 withSummon={previewTemplate.temp_summon}
//                 withSeal={previewTemplate.temp_w_seal}
//                 withSignRight={previewTemplate.temp_w_sign_right}
//                 withSignLeft={previewTemplate.temp_w_sign_left}
//                 withSignatureApplicant={previewTemplate.temp_w_sign_applicant}
//                 paperSize={previewTemplate.temp_paperSize} 
//                 margin={previewTemplate.temp_margin}
//               />
//             </div>
//           }          
//         />
//       )}
//     </div>
//   );
// }

// export default TemplateMainPage;

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button/button";
import { Plus } from 'lucide-react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import TemplateCreateForm from "./template-create";
import TemplateUpdateForm from "./template-update";
import { useGetTemplateRecord } from './queries/template-FetchQueries';
import TemplatePreview from './template-preview';
import { Skeleton } from "@/components/ui/skeleton";
import {formatTimestampToDate } from '@/helpers/summonTimestampFormatter';


interface RequestProps {
  fname?: string;
  lname?: string;
  age?: string;
  birthdate?: string;
  address?: string;
  deceasedName?: string;
  deceasedAge?: string;
  deceasedBirthdate?: string;
  deceasedAddress?: string;
  childName?: string;
  childAge?: string;
  childBirtdate?: string;
  partnerName?: string;
  liveInYears?: number;
  dateOfConflagration?: string;
  dateDemolished?: string;
  purpose?: string;
  specificPurpose?: string;
  issuedDate?: string;
  isNonResident?: boolean;
  businessName?: string;
  Signatory?: string | null;
  showAddDetails?: boolean; // ako gi add kay makita ang add details nga button sa cert
}

type Template = {
  temp_title: string;
  temp_subtitle?: string;
  temp_no_header?: boolean;
  temp_belowHeaderContent?: string;
  temp_barangayLogo: string;
  temp_cityLogo: string;
  temp_email?: string;
  temp_telNum: string;
  temp_paperSize: string;
  temp_margin: string;
  temp_filename: string;
  temp_applicantName?: string;
  temp_summon?: boolean;
  temp_w_sign_right: boolean;
  temp_w_sign_left: boolean;
  temp_w_sign_applicant: boolean;
  temp_w_seal: boolean;
  temp_body: string;
  temp_id?: string; 
}


function TemplateMainPage({fname, lname, age, birthdate, address, partnerName, liveInYears, childName, childAge, childBirtdate, deceasedName, deceasedAge, deceasedBirthdate, deceasedAddress, dateOfConflagration, dateDemolished, purpose, issuedDate, businessName, Signatory, specificPurpose, showAddDetails = true} : RequestProps ) {
  const [isDialogOpen, setIsDialogOpen] = useState(false); 
  const [previewTemplates, setPreviewTemplates] = useState<Template[]>([]);

  console.log("NISUDDDDD SAA TEMPLATE MAINNNNNNNNN")

  // Fetch data
  const { data: templates = [], isLoading } = useGetTemplateRecord();

  
  // Extract data from API response
  const templateData = templates[0] || {};
  const barangayLogo = templateData.template_files?.find((file: any) => file.tf_logoType === "barangayLogo")?.tf_url || "";
  const cityLogo = templateData.template_files?.find((file: any) => file.tf_logoType === "cityLogo")?.tf_url || "";
  const email = templateData.temp_email || "";
  const telNum = templateData.temp_contact_num || "";


  //Issuance Date Format
  const FormattedIssuanceDate =  issuedDate ? formatTimestampToDate(issuedDate) : "";

  //Conflagration/Fire Date Format
  const FormattedConflagrationDate =  dateOfConflagration ? formatTimestampToDate(dateOfConflagration) : "";  

  //Demolished Date Format
  const FormattedDemolishedDate =  dateDemolished ? formatTimestampToDate(dateDemolished) : "";  
  
  //birthdate format
  const FormattedBirthdate = birthdate ? new Date(birthdate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "";


  //Decased birthdate format
  const FormattedDeceasedBirthdate = deceasedBirthdate ? new Date(deceasedBirthdate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "";  


  //child/Minor birthdate format
  const FormattedChildBirthdate = childBirtdate ? new Date(childBirtdate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "";  

  const getBurialTemplates = (): Template[] => [
    {
      temp_id: "Burial",
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
      temp_applicantName: `${fname} ${lname}`,      
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      `NAME                     :           /*${lname}, ${fname} (CLAIMANT)*/\n` +
      `AGE                        :            /*${age}*/\n` +
      `BIRTHDATE\t  :                  /*${FormattedBirthdate}*/\n` +
      `ADDRESS              :            /*${address}, Brgy. San Roque Ciudad Cebu City*/\n\n` +
      `This certification is being issued upon the request of the above mentioned name to support the application for the /*${specificPurpose?.toUpperCase()} PURPOSES ONLY.*/   ` +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },
    {
      temp_id: "Burial Deceased",
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Burial Assistance",
      temp_w_sign_right: false,
      temp_w_sign_left: true,
      temp_applicantName: `${fname} ${lname}`,      
      temp_w_sign_applicant: false,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      `NAME                     :           /*${deceasedName} (DECEASED)*/\n` +
      `AGE                        :            /*${deceasedAge}*/\n` +
      `BIRTHDATE\t  :                  /*${FormattedDeceasedBirthdate}*/\n` +
      `ADDRESS              :            /*${deceasedAddress}, Brgy. San Roque Ciudad Cebu City*/\n\n` +
      `This certification is being issued upon the request of the above mentioned name to support the application for the /*${specificPurpose?.toUpperCase()} PURPOSES ONLY.*/   \n\n` +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    }
  ];


  const getFirstTimeJobseekerTemplate = (): Template[] => [
    {
      temp_id: "First Time Jobseeker",
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
      temp_applicantName: `${fname} ${lname}`,      
      temp_w_sign_applicant: true,
      temp_w_seal: false,
      temp_body: `This is to certify that /*${lname}, ${fname}*/, a resident of ${address}, Barangay San Roque (Ciudad) Cebu City for 1 year is qualified availee of R.A 11261 of the First Time Jobseekers Act of 2019.\n\n` +
      "I further certify that the holder/bearer was informed of his/her rights Oath of Undertaking he/she has signed and executed in the presence of our Barangay Official.\n\n" +
      `This certification is being issued upon the request of the above mentioned name to support the application for /*${specificPurpose?.toUpperCase()} PURPOSES ONLY*/. Affixed below is the name and signature of the above mentioned name.\n\n` +
      `Signed this ${FormattedIssuanceDate} in Barangay San Roque (Ciudad) Cebu City,\n\n` +
      "This certification is valid only one (1) year from the issuance."
    }, 
    {
      temp_id: "Oath of Undertaking",
      temp_title: "OATH OF UNDERTAKING",
      temp_no_header: true,
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Oath of Undertaking",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_applicantName: `${fname} ${lname}`,      
      temp_w_sign_applicant: true,
      temp_w_seal: false,
      temp_body: `This is to certify that /*${lname}, ${fname}*/, ${age} years of age, a resident of ${address}, Barangay San Roque (Ciudad) Cebu City for 1 year availing the benefits of Republic Act 11261, otherwise known as First Time Jobseeker Act of 2019. ` +
      "do hereby declare, agree and undertake to abide and be bound by the following:\n\n" +
      "1. That this is the first time that I will actively look for a job and therefore requesting that a Barangay Certification be issued in my favor to avail the benefits of laws;\n" +
      "2. That I am aware that the benefit and previliges under that said law shall be valid only for one (1) year from the date that the Barangay Certification is issued;\n" +
      "3. That I can avail the benefits of the law only once;\n" +
      "4. That I understand that my personal information shall be included in the Roster/List of First Time Jobseekers and will not be used to any unlawful purpose;\n" +
      "5. That I will inform and/or report to the Barangay personally through text or other means or through my family/relatives once I get employed and;\n" +
      "6. That I am not a beneficiaries of the Job Start Program under R.A No. 10869 and other laws that give similar exemptions for the documents or transactions exempted unde R.A No. 11261;\n" +
      "7. That if issued the requested Certification, I will not use the same in any fraud neither falsify nor help and/or assist in the fabrication of the said certification;\n" +
      "8. That this undertaking is made solely for the purpose of obtaining a Barangay certification consisting with objective of R.A No. 112261 and not any other purpose;\n" +
      "9. That I concent to the use of my personal information pursuant to the Data Provicy Act and other applicable laws, rules and regulation;\n\n" +
      `Signed this /*${FormattedIssuanceDate}*/ in Barangay San Roque (Ciudad) Cebu City.`
    }, 
  ]



  const TemplateRecords = (): Template[] => [
    {
      temp_id: "Identification",
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
      `NAME                     :           /*${lname}, ${fname}*/\n` +
      `AGE                        :            /*${age}*/\n` +
      `BIRTHDATE\t  :                      /*${birthdate}*/\n` +
      `ADDRESS              :            /*${address}*/\n\n` +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*IDENTIFICATION (ID) PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },     
    {
      temp_id: "Loan",
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
      `NAME                     :           /*${lname}, ${fname}*/\n` +
      `AGE                        :            /*${age}*/\n` +
      `BIRTHDATE\t  :           /*${birthdate}*/\n` +
      `ADDRESS              :            /*${address}*/\n\n` +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*LOAN PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },    
    {
      temp_id: "SSS",
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
      `NAME                     :           ${lname}, ${fname}\n` +
      `AGE                        :            ${age}\n` +
      `BIRTHDATE\t  :           ${birthdate}\n` +
      `ADDRESS              :            ${address}\n\n` +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*SOCIAL SECURITY SYSTEM (SSS) PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      `Issued this ${FormattedIssuanceDate} of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },    
    {
      temp_id: "BIR",
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
      temp_id: "Bank Requirement",
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
      `NAME                     :           /*${lname}, ${fname}*/\n` +
      `AGE                        :            /*${age}*/\n` +
      `BIRTHDATE\t  :           /*${birthdate}*/\n` +
      `ADDRESS              :            /*${address}*/\n\n` +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*BANK REQUIREMENTS PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },     
    {
      temp_id: "Employment",
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: email,  
      temp_telNum: telNum,
      temp_applicantName: `${fname} ${lname}`,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Employment",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      `NAME                     :           /*${lname}, ${fname}*/\n` +
      `AGE                        :            /*${age}*/\n` +
      `BIRTHDATE\t  :                  /*${FormattedBirthdate}*/\n` +
      `ADDRESS              :            /*${address}, Brgy. San Roque Ciudad Cebu City*/\n\n` +
      `This certification is being issued upon the request of the above mentioned name to support the application for the /*${specificPurpose?.toUpperCase()} PURPOSES ONLY.*/  ` +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },   
    {
      temp_id: "Electrical Connection",
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Electrical Connection",
      temp_w_sign_right: false,
      temp_w_sign_left: true,
      temp_w_sign_applicant: false,
      temp_w_seal: true,
      temp_body: "/*TO WHOM IT MAY CONCERN:*/\n\n" +
      `This is to certify that ${businessName?.toUpperCase()} located at ${address}, Barangay San Roque Ciudad, Cebu City.\n\n` +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*ELECTRICAL CONNECTION PURPOSES ONLY.*/\n\n" +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },   
    {
      temp_id: "MCWD Requirements",
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
      temp_id: "Scholarship",
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
      temp_id: "Postal ID",
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
      temp_id: "NBI",
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
      temp_id: "Board Examination",
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
      temp_id: "TESDA",
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
      temp_id: "PWD Identification",
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "PWD IDENTIFICATION",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*PWD IDENTIFICATION PURPOSES ONLY.*/  " +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },        
    {
      temp_id: "Señior Citizen Identification",
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Señior Citizen's Identification",
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
      temp_id: "Señior Citizen Financial Assistance",
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
      temp_id: "Bail Bond",
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
      temp_id: "Fire Victim",
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
      temp_body: `TO WHOM IT MAY CONCERN:\n\nThis is to CERTIFY that /*${lname}, ${fname}*/, is a resident of ${address}, Barangay San Roque (Ciudad) Cebu City.\n\n` +
      `This is to CERTIFY further that the above-mentioned person has been affected by Conflagration/Fire which occured on /*${FormattedConflagrationDate}.*/  ` +
      "That his/her house/property including her important documents in the said area were totally damaged.\n\n" +
      `This Certification issued upon the request of the above mentioned name as a supporting document for /*${specificPurpose?.toUpperCase()} PURPOSES ONLY.*/` 
    },    
    {
      temp_id: "Building Permit",
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
      temp_id: "Cohabitation",
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
      `/*${lname}, ${fname}*/ and /*${partnerName}*/, legal age and resident of R. Palma St., Barangay San Roque Ciudad Cebu City.\n\n` +
      `This is to certify further that the above mentioned name are common-law partner and living together under the same roof for ${liveInYears} years.\n\n` +
      `This certification is being issued upon the request of the above mentioned name to support the application /*${specificPurpose?.toUpperCase()} PURPOSES ONLY.*/  ` +
      `Affixed below is the name and signature of the above mentioned name.\n\nIssued this /*${FormattedIssuanceDate}*/ at Barangay San Roque (Ciudad) ` +
      "Cebu City, Cebu Philippines." 
    },     
    {
      temp_id: "Business Clearance",
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
      temp_body: `\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that ${businessName} residence / office address at ${address},  /*Barangay San Roque (Ciudad), Cebu City*/. Which ` +
      "is within the Territorial Jurisdiction of the Barangay in accordance with Section # 152 of Republic Act No. 7160, otherwise known as Local Government Code 1991.\n\n\n" +
      "\t\tThis clearance is issued upon the request of the subject person / establishment for\n\n" +
      "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/*BARANGAY BUSINESS PERMIT*/\n\n" +
      `\tIssued this ${FormattedIssuanceDate} at Barangay San Roque (Ciudad), Cebu City`
    },
    // {
    //   temp_id: "bussClear",
    //   temp_title: "BARANGAY BUSINESS CLEARANCE",
    //   temp_barangayLogo: barangayLogo,
    //   temp_cityLogo: cityLogo,
    //   temp_email: templates[0]?.temp_email,  
    //   temp_telNum: templates[0]?.temp_contact_num,
    //   temp_paperSize: "letter",
    //   temp_margin: "normal",
    //   temp_filename: "Business Clearance",
    //   temp_w_sign_right: true,
    //   temp_w_sign_left: false,
    //   temp_w_sign_applicant: false,
    //   temp_w_seal: false,
    //   temp_body: "\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that [ NAME OF BUSINESS ] residence / office address at [ ADDRESS OF THE BUSINESS ],  /*Barangay San Roque (Ciudad), Cebu City*/. Which " +
    //   "is within the Territorial Jurisdiction of the Barangay in accordance with Section # 152 of Republic Act No. 7160, otherwise known as Local Government Code 1991.\n\n\n" +
    //   "\t\tThis clearance is issued upon the request of the subject person / establishment for\n\n" +
    //   "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/*BARANGAY BUSINESS PERMIT*/\n\n" +
    //   "\tIssued this [ DAY [st/nd/rd/th] ] day [MONTH] [YEAR] at Barangay San Roque (Ciudad), Cebu City"
    // },
    {
      temp_id: "File Action",
      temp_belowHeaderContent: "\t\t\t\t\t\t\t\t\t\t\t\t\t\tBarangay Case No.[ Case No. ]\n" +
      "[ Name of Complainant ]\n" +
      "[ Address ], Brgy. San Roque Ciudad Cebu City\n" +
      "Complainant/s\n\n" +
      "      - AGAINTS -\n\n" +
      "[ Name of Respondent ]\n" +
      "[ Address ], Brgy. San Roque Ciudad Cebu City\n" +
      "Respondent/s\n",
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
      temp_body: "This is to certify that:\n\n" +
      "1. There was a complaint filled in this Office on [SEPTEMBER] [10], [2025];\n\n" +
      "2. There has been a personal confrontation between the parties before the Punong Barangay but mediation failed;\n\n" +
      "3. The Pangkat ng Tagapangkasundo was constituted but the personal confrontation before the Pangkat likewise did not result into settlement;\n\n" +
      "4. Therefore, the corresponding complaint for the dispute may now be filed in the court/government office.\n\n" +
      `This ${FormattedIssuanceDate} in Barangay San Roque Ciudad Cebu City.` 
    },       
    {
      temp_id: "Marriage Certification",
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
      `NAME                     :           /*${lname}, ${fname}*/\n` +
      `AGE                        :            /*${age}*/\n` +
      `BIRTHDATE\t  :                  /*${FormattedBirthdate}*/\n` +
      `ADDRESS              :            /*${address}, Brgy. San Roque Ciudad Cebu City*/\n\n` +
      `This is to certify further that they are living together in one household live-in partners for more than ${liveInYears} years in Barangay ` +
      "San Roque Ciudad Cebu City.\n\n" +
      `This certification is being issued upon the request of the above mentioned name to support the application for /*${specificPurpose?.toUpperCase()} PURPOSES ONLY.*/  \n\n` +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },  
    {
      temp_id: "DWUP",
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
      temp_body: `\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that /*${lname}, ${fname}*/ located at ${address}, Barangay SAn Roque (Ciudad) Cebu City.\n\n` +
      `This is to CERTIFY further that the above-mentioned person has been affected by demolished which occured on ${FormattedDemolishedDate}\n\n` +
      `This certication issued of the interested party as supporting document for /*${specificPurpose?.toUpperCase()}*/ /*Purposes Only.*/\n\n` +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },          
    {
      temp_id: "Probation",
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
      `NAME                     :           /*${lname}, ${fname}*/\n` +
      `AGE                        :            /*${age}*/\n` +
      `BIRTHDATE\t  :                  /*${FormattedBirthdate}*/\n` +
      `ADDRESS              :            /*${address}, Brgy. San Roque Ciudad Cebu City*/\n\n` +
      `This certification is being issued upon the request of the above mentioned name to support the application for the /*${specificPurpose?.toUpperCase()} PURPOSES ONLY.*/   ` +
      `Affixed below is the name and signature of the above-mentioned name.\n\n` +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },    
    {
      temp_id: "Police Clearance",
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
      temp_id: "Burial",
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
      temp_applicantName: `${fname} ${lname}`,      
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
      temp_id: "PHILHEALTH",
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
      temp_id: "First Time Jobseeker",
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
      temp_applicantName: `${fname} ${lname}`,      
      temp_w_sign_applicant: true,
      temp_w_seal: false,
      temp_body: "This is to certify that [ NAME ], a resident of [ ADDRESS ], Barangay San Roque (Ciudad) Cebu City for 1 year is qualified availee of R.A 11261 of the First Time Jobseekers Act of 2019.\n\n" +
      "I further certify that the holder/bearer was informed of his/her rights Oath of Undertaking he/she has signed and executed in the presence of our Barangay Official.\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for /*EMPLOYMENT PURPOSES ONLY*/. Affixed below is the name and signature of the above mentioned name.\n\n" +
      "Signed this [ DAY [st/nd/rd/th] ] day of [MONTH] [YEAR] in Barangay San Roque (Ciudad) Cebu City,\n\n" +
      "This certification is valid only one (1) year from the issuance."
    },   
    {
      temp_id: "Barangay Clearance",
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
      temp_id: "Proof of Custody",
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
    {
      temp_id: "PWD Financial Assistance",
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "PWD FINANCIAL ASSISTANCE",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      `NAME                     :           /*${lname}, ${fname}*/\n` +
      `AGE                        :            /*${age}*/\n` +
      `BIRTHDATE\t  :                  /*${FormattedBirthdate}*/\n` +
      `ADDRESS              :            /*${address}, Brgy. San Roque Ciudad Cebu City*/\n\n` +
      `This certification is being issued upon the request of the above mentioned name to support the application for the /*${specificPurpose?.toUpperCase()} PURPOSES ONLY.*/  ` +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },      
    {
      temp_id: "Good Moral",
      temp_title: "CERTIFICATION",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Good Moral",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      `NAME                     :           /*${lname}, ${fname}*/\n` +
      `AGE                        :            /*${age}*/\n` +
      `BIRTHDATE\t  :                  /*${FormattedBirthdate}*/\n` +
      `ADDRESS              :            /*${address}, Brgy. San Roque Ciudad Cebu City*/\n\n` +
      "This is to certify further that the above mention name has never been a subject of any crime complain nor was she/he is accused of any crime " +
      "as per record of this office on file. She/he is personally known as a person of good moral character, has no derogatory record on file law-abiding citizen.\n\n" +
      `This certification is being issued upon the request of the above mentioned name to support the application for the /*${specificPurpose?.toUpperCase()} PURPOSES ONLY.*/  ` +
      "Affixed below is the name and signature of the above-mentioned name.\n\n" +
      `Issued this /*${FormattedIssuanceDate}*/ of Barangay San Roque Ciudad, Cebu City, Philippines.`
    },  
    {
      temp_id: "Indigency (for minors)",
      temp_title: "CERTIFICATE OF INDIGENCY",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Indigency (for minors)",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_applicantName: `${fname} ${lname}`,    
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "Further certifies that the above-mentioned name is the child of \n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*PWD FINANCIAL ASSISTANCE PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name. They belong to an /*indigent family, no income/low income.*/\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },      
    {
      temp_id: "Indigency (for minors)",
      temp_title: "CERTIFICATE OF INDIGENCY",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "legal",
      temp_margin: "normal",
      temp_filename: "INDIGENCY (for minors)",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      `NAME                     :           /*${childName}*/\n` +
      `AGE                        :            /*${childAge}*/\n` +
      `BIRTHDATE\t  :                  /*${FormattedChildBirthdate}*/\n` +
      `ADDRESS              :            /*${address}, Brgy. San Roque Ciudad Cebu City*/` +
      "Further certifies that the above-mentioned name is the child of \n\n" +
      `NAME                     :           /*${lname}, ${fname}*/\n` +
      `AGE                        :            /*${age}*/\n` +
      `BIRTHDATE\t  :                  /*${FormattedBirthdate}*/\n` +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*PWD FINANCIAL ASSISTANCE PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name. They belong to an /*indigent family, no income/low income.*/\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },     
    {
      temp_id: "Indigency",
      temp_title: "CERTIFICATE OF INDIGENCY",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "INDIGENCY",
      temp_w_sign_right: false,
      temp_w_sign_left: false,
      temp_w_sign_applicant: true,
      temp_w_seal: true,
      temp_body: "This serves as certification to the accuracy of details on one of our residents in the barangay of San Roque Ciudad:\n\n" +
      "NAME                     :           [ NAME ]\n" +
      "AGE                        :            [ AGE ]\n" +
      "BIRTHDATE\t  :           [ BIRTHDATE ]\n" +
      "ADDRESS              :            [ ADDRESS ]\n\n" +
      "This certification is being issued upon the request of the above mentioned name to support the application for the /*PWD FINANCIAL ASSISTANCE PURPOSES ONLY.*/   " +
      "Affixed below is the name and signature of the above-mentioned name. They belong to an /*indigent family, no income/low income.*/\n\n" +
      "Issued this [DAY[st/nd/rd/th]] day of [YEAR] [MONTH] of Barangay San Roque Ciudad, Cebu City, Philippines."
    },     
    {
      temp_id: "Barangay Sinulog Permit",
      temp_title: "BARANGAY BUSINESS CLEARANCE",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Barangay Sinulog Permit",
      temp_w_sign_right: true,
      temp_w_sign_left: false,
      temp_w_sign_applicant: false,
      temp_w_seal: false,
      temp_body: `\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that ${businessName} residence / office address at ${address},  /*Barangay San Roque (Ciudad), Cebu City*/. Which ` +
      "is within the Territorial Jurisdiction of the Barangay in accordance with Section # 152 of Republic Act No. 7160, otherwise known as Local Government Code 1991.\n\n\n" +
      "\t\tThis clearance is issued upon the request of the subject person / establishment for\n\n" +
      "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/*BARANGAY SINULOG PERMIT*/\n\n" +
      `\tIssued this ${FormattedIssuanceDate} at Barangay San Roque (Ciudad), Cebu City`
    },
    {
      temp_id: "Barangay Fiesta Permit",
      temp_title: "BARANGAY BUSINESS CLEARANCE",
      temp_barangayLogo: barangayLogo,
      temp_cityLogo: cityLogo,
      temp_email: templates[0]?.temp_email,  
      temp_telNum: templates[0]?.temp_contact_num,
      temp_paperSize: "letter",
      temp_margin: "normal",
      temp_filename: "Barangay Fiesta Permit",
      temp_w_sign_right: true,
      temp_w_sign_left: false,
      temp_w_sign_applicant: false,
      temp_w_seal: false,
      temp_body: `\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that ${businessName} residence / office address at ${address},  /*Barangay San Roque (Ciudad), Cebu City*/. Which ` +
      "is within the Territorial Jurisdiction of the Barangay in accordance with Section # 152 of Republic Act No. 7160, otherwise known as Local Government Code 1991.\n\n\n" +
      "\t\tThis clearance is issued upon the request of the subject person / establishment for\n\n" +
      "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/*BARANGAY FIESTA PERMIT*/\n\n" +
      `\tIssued this ${FormattedIssuanceDate} at Barangay San Roque (Ciudad), Cebu City`
    },           
  ];  


  useEffect(() => {
    if (!purpose) {
      setPreviewTemplates([]);
      return;
    }

    // Special case for BURIAL - return multiple templates
    if (purpose.toLowerCase() === 'burial') {
      setPreviewTemplates(getBurialTemplates());
      return;
    }


    if (purpose.toLowerCase() === 'first time jobseeker') {
      setPreviewTemplates(getFirstTimeJobseekerTemplate());
      return;
    }    

    // For other purposes, find single template
    const matchedTemplate = TemplateRecords().find(
      template => template.temp_id?.toLowerCase() === purpose.toLowerCase()
    );

    setPreviewTemplates(matchedTemplate ? [matchedTemplate] : []);
  }, [purpose, templates, deceasedName, deceasedAge, deceasedBirthdate, deceasedAddress]);


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


  // const isTemplateEmpty = (template: Template) => {
  //   return !template.temp_body || !template.temp_title || !template.temp_barangayLogo;
  // };

  return (
    <div className="w-full h-full">
      {/* <div className="flex flex-col mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Document Templates</h1>
        <p className="text-xs sm:text-sm text-darkGray">Manage and view document templates</p>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" /> */}

      <div className="w-full flex flex-col sm:flex-row justify-between items-center pb-7 gap-4">
        {/* Search Input */}
        <div className="relative w-full">
          {/* <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={17}
          />
          <Input 
            placeholder="Search templates..." 
            className="pl-10 w-full bg-white text-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          /> */}
        </div>
        
        {/* Edit/Add Details Button */}
        {showAddDetails && (templates.length > 0 ? (
          <DialogLayout
            trigger={''
              // <Button className="w-full sm:w-auto">
              //   <SquarePen size={20} /> Edit Details
              // </Button>
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
        ))}
      </div>
    

      {previewTemplates.length > 0 ? (
        <DialogLayout
          isOpen={previewTemplates.length > 0}
          onOpenChange={() => setPreviewTemplates([])}
          className="max-w-full h-full flex flex-col overflow-auto scrollbar-custom p-9"
          title=""
          description=""
          mainContent={
            <div className="w-full h-full">
              <TemplatePreview
                templates={previewTemplates} // Pass the entire array
                signatory={Signatory?.toUpperCase()}
              />
            </div>
          }
        />
      ) : purpose ? (
        (() => {
          // toast.error(`No template for ${purpose}`, { duration: 2000 });
          return null;
        })()
      ) : null}      

    </div>
  );
}

export default TemplateMainPage;