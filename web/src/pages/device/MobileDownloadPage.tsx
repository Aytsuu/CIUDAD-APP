import React from 'react';

const MobileDownloadPage: React.FC = () => {
  const handleDownload = () => {
    window.location.href = 'https://drive.google.com/file/d/1iKXyQLFXsNgqePynS768_KBsOdrswAM4/view?usp=drive_link';
  };

  const handleContinueToWebsite = () => {
    // You can implement logic to hide the mobile page temporarily
    // For example, using localStorage to remember user's choice
    localStorage.setItem('hideMobilePrompt', 'true');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
        {/* App Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </svg>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">
          Mobile App
        </h1>
        <p className="text-gray-600 text-center mb-8 leading-relaxed">
          For the best experience, download our mobile application. Get access to exclusive features and faster performance.
        </p>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mb-4"
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Mobile App
          </div>
        </button>

        {/* Continue to Website Button */}
        <button
          onClick={handleContinueToWebsite}
          className="w-full border-2 border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 font-medium py-3 px-6 rounded-xl transition-all duration-200 mb-8"
        >
          Continue to Website
        </button>

        {/* Features List */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4 text-center">App Features</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Faster performance</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Push notifications</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Better user experience</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          The app will be downloaded from Google Drive
        </p>
      </div>
    </div>
  );
};

export default MobileDownloadPage;