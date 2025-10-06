// components/MobileDetect.tsx
import React from 'react';
import { isMobile } from 'react-device-detect';
import MobileDownloadPage from './MobileDownloadPage';

interface MobileDetectProps {
  children: React.ReactNode;
}

const MobileDetect: React.FC<MobileDetectProps> = ({ children }) => {
  const [showMobilePage, setShowMobilePage] = React.useState(false);

  React.useEffect(() => {
    if (isMobile) {
      setShowMobilePage(true);
    }
  }, []);

  if (showMobilePage) {
    return <MobileDownloadPage />;
  }

  return <>{children}</>;
};

export default MobileDetect;