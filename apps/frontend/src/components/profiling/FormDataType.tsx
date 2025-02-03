export interface PersonalFormData {
    lastName: string;
    firstName: string;
    middleName?: string;
    suffix?: string;
    sex: string;
    status: string;
    dateOfBirth: string,
    birthPlace: string;
    citizenship: string;
    religion: string;
    contact: string;
  }
  
  export interface ParentsFormData {
    fatherFirstName: string;
    fatherLastName: string;
    fatherMiddleName?: string;
    motherFirstName: string;
    motherLastName: string;
    motherMiddleName?: string;
    fatherOccupation: string;
    motherOccupation: string;
    parentAddress: string;
  }
  
  export interface FormData {
    personalInfo: Partial<PersonalFormData>;
    parentsInfo: Partial<ParentsFormData>;
  }