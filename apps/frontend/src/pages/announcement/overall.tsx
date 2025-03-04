import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DialogLayout from '@/components/ui/dialog/dialog-layout';
import DeleteConfirmationModal from '@/pages/announcement/deletemodal'; // Ensure the import path is correct
import { SelectLayout } from '@/components/ui/select/select-layout';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    description: string;
    dateCreated: string;
    time: string;
}

const AnnouncementDashboard: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([
        {
            id: '1',
            title: 'Feeding Program',
            description: 'Providing meals to underprivileged children.',
            dateCreated: '2025-01-20',
            time: '08:00 AM'
        },
        {
            id: '2',
            title: 'Tree Planting Activity',
            description: 'A community effort to plant trees in our neighborhood.',
            dateCreated: '2025-02-15',
            time: '10:00 AM'
        },
        {
            id: '3',
            title: 'Operation Tuli',
            description: 'Libreng tuli San Roque Gym.',
            dateCreated: '2025-03-05',
            time: '10:00 AM'
        }
    ]);

    // const [selectedFilter, setSelectedFilter] = useState<string>("all");
    
    const [searchQuery, setSearchQuery] = useState("");
    const [, setIsDeleteModalOpen] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
      };
    const openDeleteModal = (announcement: Announcement) => {
        setAnnouncementToDelete(announcement);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setAnnouncementToDelete(null);
    };

    const handleDelete = () => {
        if (announcementToDelete) {
            setAnnouncements((prev) => prev.filter((a) => a.id !== announcementToDelete.id));
            console.log('Deleted announcement:', announcementToDelete.id);
            closeDeleteModal();
        }
    };

    // // Filter announcements based on the selected filter
    // const filteredAnnouncements = announcements.filter((announcement) => {
    //     if (selectedFilter === "all") return true;

    //     const announcementDate = new Date(announcement.dateCreated);
    //     const today = new Date();
    //     const startOfWeek = new Date();
    //     startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week
    //     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month

    //     if (selectedFilter === "today") {
    //         return announcementDate.toDateString() === today.toDateString();
    //     }
    //     if (selectedFilter === "thisweek") {
    //         return announcementDate >= startOfWeek;
    //     }
    //     if (selectedFilter === "thismonth") {
    //         return announcementDate >= startOfMonth;
    //     }

    //     return true;
    // }).filter((announcement) =>
    //     announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     announcement.description.toLowerCase().includes(searchQuery.toLowerCase())
    // );

    return (
        <div className="w-full h-full">
            <div className="flex flex-col justify-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Announcements
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view announcement information
                </p>
            </div>
            <hr className="border-gray mb-6 sm:mb-8" />
            
            
            <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-x-2">
          <div className="relative flex-1 bg-white">
          <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
                <SelectLayout
                    placeholder="Filter by"
                    label=""
                    className="bg-white"
                    options={[
                        { id: "all", name: "All" },
                        { id: "today", name: "Today" },
                        { id: "thisweek", name: "This Week" },
                        { id: "thismonth", name: "This Month" }
                    ]}
                    value={""}
                    onChange={() => { }}
                />

              </div>
                <Link to={`/createAnnouncement`}>
                    <Button className="w-full sm:w-auto mt-1 p-2 text-sm shadow-sm">
                        <Label>Add Announcement</Label>
                    </Button>
                </Link>
            </div>

            {/* Announcements List*/}
            <div className="space-y-4 w-full sm:px-10">
                {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                        <div key={announcement.id} className="border rounded-lg  w-full p-4 sm:p-6 bg-white shadow-sm">
                            <div className="grid grid-cols-1 w-full sm:grid-cols-[1fr_4fr_auto] items-center gap-4">
                                {/* Announcement Info */}
                                <div className='mr-5'>
                                    <p className='text-sm font-semibold'>Date created:</p>
                                    <p className="text-darkGray">{announcement.dateCreated}</p>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{announcement.title}</h3>
                                    <p className="text-gray-600">{announcement.description}</p>
                                </div>

                                {/* Buttons - Now Stack in Mobile */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                    {/* Edit button */}
                                    <Button
                                        variant="secondary"
                                        className="border border-gray-400 text-gray-700 hover:bg-gray-200 "
                                        onClick={() => console.log("Edit announcement:", announcement.id)}
                                    >
                                        Edit
                                    </Button>

                                    {/* Delete Button & Modal */}
                                    <DialogLayout
                                        trigger={
                                            <Button
                                                variant="destructive"
                                                className="bg-red-600 hover:bg-red-700"
                                                onClick={() => openDeleteModal(announcement)}
                                            >
                                                Delete
                                            </Button>
                                        }
                                        className="sm:max-w-[50%]"
                                        title="Confirm Deletion"
                                        description=""
                                        mainContent={
                                            <DeleteConfirmationModal
                                                announcement={announcement}
                                                onCancel={closeDeleteModal}
                                                onConfirm={handleDelete}
                                            />
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-600 text-lg font-semibold py-6">
                        No announcements
                    </div>
                )}
            </div>
        </div >
    );
};

export default AnnouncementDashboard;
