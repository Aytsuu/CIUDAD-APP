import React from 'react';
import { isMobile } from 'react-device-detect';
import MobileDownloadPage from './MobileDownloadPage';

export const MobileDetect = ({ children }: {children: React.ReactNode}) => {
  const [showMobilePage, setShowMobilePage] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    // Check if user previously chose to continue to website
    const hideMobilePrompt = localStorage.getItem('hideMobilePrompt');
    
    if (isMobile && !hideMobilePrompt) {
      setShowMobilePage(true);
    }
    
    setIsChecking(false);
  }, []);

  // Show loading state or nothing while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showMobilePage) {
    return <MobileDownloadPage />;
  }

  return <>{children}</>;
};
