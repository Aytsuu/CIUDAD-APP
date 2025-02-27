import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import addImage from "/src/assets/images/addimage.png";

export default function CreateAnnouncement() {
  const [header, setHeader] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null);
  const [modes, setModes] = useState(["SMS", "EMAIL", "APP"]);
  const [recipients, setRecipients] = useState(["STAFF", "RESIDENTS"]);

  return (
    <div className="max-w-2xl mx-auto bg-[#f5f5f5] p-6 shadow-md">
      <h2 className="font-bold text-[#263D67]">Create Announcement</h2>

      <h2 className="font-bold mt-4">Announcement Header</h2>
      <div className="mt-4">
        <Input
          type="text"
          placeholder="Header"
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          className="w-full border-[#3F3F3F] p-2 rounded-md bg- h-12"
        />
      </div>
      
      <h2 className="font-bold mt-4">Announcement Details</h2>
      <div className="mt-4">
        <Textarea
          placeholder="Announcement details...."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full border-[#3F3F3F] p-2 rounded-md h-48 resize-none bg-white"
        />
        <p className="text-right text-gray-500 text-xs mt-1">{details.length}/200</p>
      </div>
      
      <h2 className="font-bold mt-4">Add Image</h2>
      <div className="w-full border border-[#3F3F3F] p-2 rounded-md h-48 mt-4 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden bg-white">
      {image ? (
          <img src={URL.createObjectURL(image)} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <img src={addImage} alt="Upload" className="w-16 h-16" />
            <p className="text-gray-500">Upload your Image here</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      
      <div className="mt-4">
        <Label className="font-bold">MODE</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {["ALL", "SMS", "EMAIL", "APP"].map((mode) => (
            <label key={mode} className="flex items-center space-x-2">
              <Checkbox
                id={mode}
                checked={modes.includes(mode)}
                onCheckedChange={() =>
                  setModes((prev) =>
                    prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
                  )
                }
              />
              <span>{mode}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <Label className="font-bold">RECIPIENT</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {["STAFF", "RESIDENTS"].map((recipient) => (
            <label key={recipient} className="flex items-center space-x-2">
              <Checkbox
                id={recipient}
                checked={recipients.includes(recipient)}
                onCheckedChange={() =>
                  setRecipients((prev) =>
                    prev.includes(recipient) ? prev.filter((r) => r !== recipient) : [...prev, recipient]
                  )
                }
              />
              <span>{recipient}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mt-6 text-right">
        <Button>POST</Button>
      </div>
    </div>
  );
}