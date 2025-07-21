import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Info, 
  ChevronRight, 
  Bell, 
  MessageCircle, 
  ShieldCheck 
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path); // Navigation logic
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6 relative font-poppins">
      {/* Back Button */}
      <button
        className="absolute top-6 right-10 flex items-center gap-2 text-gray-500 hover:text-gray-700 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences.</p>
      </div>

      {/* Content Section */}
      <div className="bg-white shadow-md rounded-md w-full max-w-2xl p-6 space-y-4">

        {/* Notifications */}
        <div
          className="flex justify-between items-center cursor-pointer p-4 border-b"
          onClick={() => handleNavigation('/settings/notifications')}
        >
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-blue-500" />
            <span className="text-gray-700">Notifications</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        {/* Feedback & Support */}
        <div
          className="flex justify-between items-center cursor-pointer p-4 border-b"
          onClick={() => handleNavigation('/settings/feedback')}
        >
          <div className="flex items-center gap-3">
            <MessageCircle size={20} className="text-green-500" />
            <span className="text-gray-700">Feedback & Support</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        {/* Legal Compliance */}
        <div
          className="flex justify-between items-center cursor-pointer p-4"
          onClick={() => handleNavigation('/settings/legal')}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-red-500" />
            <span className="text-gray-700">Legal Compliance</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-8 text-sm text-gray-500 text-center flex items-center gap-2">
        <Info size={18} className="text-blue-500" />
        <span>
          Only you can see the settings. You might also want to review your settings for
          <span className="font-medium text-gray-700">
            {" "}Personal Info, Privacy, Security, and Notifications.
          </span>
        </span>
      </div>
    </div>
  );
};

export default Settings;