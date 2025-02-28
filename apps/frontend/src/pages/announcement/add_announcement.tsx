import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CreateAnnouncement() {
  const [header, setHeader] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [modes, setModes] = useState<string[]>(["SMS", "EMAIL", "APP"]);
  const [recipients, setRecipients] = useState<string[]>(["STAFF", "RESIDENTS"]);


  const toggleSelection = (value: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-xl border border-gray-200">
      <h2 className="font-bold text-[#263D67] text-2xl text-center mb-6">Create Announcement</h2>
      
      <div className="mb-6">
        <Label className="font-semibold text-lg">Announcement Header</Label>
        <Input
          type="text"
          placeholder="Enter header..."
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-indigo-300"
        />
      </div>
      
      <div className="mb-6">
        <Label className="font-semibold text-lg">Announcement Details</Label>
        <Textarea
          placeholder="Enter details..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-indigo-300 h-48"
          maxLength={200}
        />
        <p className="text-right text-gray-500 text-sm mt-1">{details.length}/200</p>
      </div>
    
      <div className="mb-6">
        <Label className="font-semibold text-lg">Mode</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {["ALL", "SMS", "EMAIL", "APP"].map((mode) => (
            <label key={mode} className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg shadow-sm hover:bg-gray-200 transition cursor-pointer">
              <Checkbox
                id={mode}
                checked={modes.includes(mode)}
                onCheckedChange={() => toggleSelection(mode, modes, setModes)}
              />
              <span className="text-gray-700">{mode}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <Label className="font-semibold text-lg">Recipient</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {["STAFF", "RESIDENTS"].map((recipient) => (
            <label key={recipient} className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg shadow-sm hover:bg-gray-200 transition cursor-pointer">
              <Checkbox
                id={recipient}
                checked={recipients.includes(recipient)}
                onCheckedChange={() => toggleSelection(recipient, recipients, setRecipients)}
              />
              <span className="text-gray-700">{recipient}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="text-center mt-8">
        <Button className="px-6 py-3 rounded-lg ">POST</Button>
      </div>
    </div>
  );
}
