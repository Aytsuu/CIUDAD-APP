


export interface ExamOption {
  pe_option_id: number;
  text: string;
  checked: boolean;
}

export interface ExamSection {
  pe_section_id: number;
  title: string;
  options: ExamOption[];
  isOpen: boolean;
}