import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    description: string;
    dateCreated: string;
    time: string;
}

const AnnouncementDashboard: React.FC = () => {
    const [announcements] = React.useState<Announcement[]>([
       
            
    ]);

    const handleDelete = (id: string) => {
        console.log('Delete announcement:', id);
    };

    const handleEdit = (id: string) => {
        console.log('Edit announcement:', id);
    };

    return (
        <div>
            <div className="flex gap-8 p-10 mt-2 ">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-32 mt-1 shadow-sm flex justify-between items-center bg-green-600 hover:bg-green-800">
                            Date
                            <ChevronDown className="h-4 w-4" />
                        </Button>

                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Daily</DropdownMenuItem>
                        <DropdownMenuItem>Weekly</DropdownMenuItem>
                        <DropdownMenuItem>Monthly</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex-1 mt-1">
                    <Input
                        type="text"
                        placeholder="Search"
                        className="rounded-lg border-gray-200 text-sm shadow-sm"
                    />
                </div>

                <Button className="bg-green-600 mt-1 p-2 text-sm hover:bg-green-800 shadow-sm">
                    <Label>Add Announcement</Label>
                </Button>
            </div>

            {/* Announcements List */}
            <div className="space-y-4 px-10">
                {announcements.map((announcement) => (
                    <div key={announcement.id} className="border rounded-lg p-6 bg-white shadow-sm">
                        <div className="flex">
                            <div className="w-48">
                                <div className="text-sm text-gray-500">
                                    Date Created: Today
                                </div>
                                <div className="text-sm text-gray-500">
                                    {announcement.dateCreated}
                                    <br />
                                    {announcement.time}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2">
                                    {announcement.title}
                                </h3>
                                <p className="text-gray-600">
                                    {announcement.description}
                                </p>
                            </div>

                            <div className="flex gap-2 ml-4">
                                <Button
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDelete(announcement.id)}
                                >
                                    Delete
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleEdit(announcement.id)}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnnouncementDashboard;