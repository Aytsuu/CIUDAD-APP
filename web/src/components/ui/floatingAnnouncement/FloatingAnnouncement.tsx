import { useEffect, useState } from "react";

interface FloatingAnnouncementProps {
  announcement: {
    ann_title: string;
  } | null;
}

export default function FloatingAnnouncement({ announcement }: FloatingAnnouncementProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || !announcement) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white shadow-2xl text-[#17294A] rounded-lg w-80 p-4 border border-blue-200 animate-fade-in">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h4 className="font-bold text-sm uppercase text-blue-700 mb-1">New Announcement</h4>
          <p className="text-sm leading-snug line-clamp-3">{announcement.ann_title}</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
