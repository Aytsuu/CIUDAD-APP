export interface PageProps {
  state: {
    month: string;
    monthName: string;
  };
  onBack: () => void;
  onNext: () => void;
}

export interface Page1Props {
  state: {
    month: string;
    monthName: string;
  };
  onNext: () => void;
}

export interface PagelastProps {
  state: {
    month: string;
    monthName: string;
  };
  onBack: () => void;
}
