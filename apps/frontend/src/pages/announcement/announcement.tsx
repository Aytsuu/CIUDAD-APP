import { useState } from "react";
import { FiSearch } from "react-icons/fi";

const initialAnnouncements = [
  { id: 1, title: "Waste Collection Schedule", time: "8:00 AM", date: "Today", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: 2, title: "Hotspots Schedule", time: "8:00 AM", date: "Today", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: 3, title: "Monthly Meeting", time: "8:00 AM", date: "Today", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: 4, title: "Waste Collection Schedule", time: "8:00 AM", date: "Today", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
];

export default function Announcements() {
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

//   const handleDelete = (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this announcement?");
//     if (confirmDelete) {
//       setAnnouncements(announcements.filter((announcement) => announcement.id !== id));
//     }
//   };

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4 items-center">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="border border-black p-2 pl-10 rounded shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="bg-[#263D67] text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 active:opacity-75 transition">Create Announcement</button>
        </div>
        <h1 className="text-3xl font-bold text-[#263D67]">ANNOUNCEMENT</h1>
      </div>
      <div className="bg-gray-100 p-6 rounded-lg shadow">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement, index) => (
            <div 
              key={announcement.id} 
              className={`py-6 ${index !== filteredAnnouncements.length - 1 ? 'border-b' : ''} flex justify-between items-start active:opacity-75 transition`}
            >
              <div className="flex flex-col text-left w-1/4">
                <p className="text-gray-600 text-sm font-medium">{announcement.date}</p>
                <p className="text-gray-600 text-sm">{announcement.time}</p>
              </div>
              <div className="flex-1 ml-6">
                <h2 className="text-2xl font-bold text-[#263D67]">{announcement.title}</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{announcement.content}</p>
              </div>
              <div className="text-[#263D67] font-medium text-sm">
                <button className="mr-4 hover:underline active:opacity-75 transition">Edit</button>
                <button className="mr-4 hover:underline active:opacity-75 transition">Delete</button>
                {/* <button className="hover:underline active:opacity-75 transition" onClick={() => handleDelete(announcement.id)}>Delete</button> */}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No announcements found.</p>
        )}
      </div>
    </div>
  );
}
