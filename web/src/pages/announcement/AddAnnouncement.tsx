"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ImageIcon, Upload, Bell, Users, MessageSquare } from "lucide-react"
import { announcementFormSchema } from "../../form-schema/AnnouncementSchema"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form/form"

// Define the options as provided
const options = {
  modes: ["ALL", "SMS", "APP"],
  recipients: ["ALL", "STAFF", "RESIDENTS", "SENIOR CITIZENS", "PREGNANTS", "18-59 years old"],
}

export default function CreateAnnouncement() {
  const form = useForm({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: { header: "", details: "", image: "", modes: [], recipients: [] },
  })

  const detailsLength = form.watch("details")?.length || 0
  const maxLength = 200
  const progress = (detailsLength / maxLength) * 100

  return (
    <div className="max-w-[700px] mx-auto p-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg pb-4">
          <CardTitle className="text-[#263D67] text-2xl font-bold flex items-center justify-center gap-2">
            <Bell className="h-5 w-5" />
            Create Announcement
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => console.log("Announcement Data:", data))} className="space-y-6">
              {/* Header */}
              <FormField
                control={form.control}
                name="header"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-[#263D67]">Announcement Header</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter announcement title"
                        className="border border-gray-300 p-2 rounded-md w-full text-sm h-12 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Separator className="my-4" />

              {/* Details */}
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-[#263D67]">Announcement Details</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide detailed information about your announcement..."
                        className="border border-gray-300 p-3 rounded-md w-full text-sm min-h-[150px] focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                        maxLength={maxLength}
                        onChange={(e) => field.onChange(e.target.value.slice(0, maxLength))}
                      />
                    </FormControl>
                    <div className="mt-2">
                      <Progress value={progress} className="h-1.5 w-full bg-gray-200" />
                      <div className="flex justify-between items-center mt-1">
                        <FormDescription className="text-xs text-gray-500">
                          Keep it concise and informative
                        </FormDescription>
                        <p
                          className={`text-xs font-medium ${detailsLength > maxLength * 0.8 ? "text-amber-500" : "text-gray-500"}`}
                        >
                          {detailsLength}/{maxLength} characters
                        </p>
                      </div>
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Separator className="my-4" />

              {/* Add Image */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-[#263D67] flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Announcement Image
                    </FormLabel>
                    <FormControl>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 transition-all hover:bg-gray-50 cursor-pointer">
                        {field.value ? (
                          <div className="relative group">
                            <img
                              src={field.value || "/placeholder.svg"}
                              alt="Preview"
                              className="h-[200px] w-full object-cover rounded-md"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-md">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="bg-white text-gray-700 hover:bg-gray-100"
                                onClick={() => field.onChange("")}
                              >
                                Change Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-[200px] flex flex-col items-center justify-center gap-3 bg-gray-50 rounded-md">
                            <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                              <Upload className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-700">Drag and drop an image</p>
                              <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                            </div>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : "")
                          }
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500 mt-2">
                      Upload a relevant image to make your announcement more engaging
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Separator className="my-4" />

              {/* Delivery Modes */}
              <FormField
                control={form.control}
                name="modes"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel className="font-semibold text-[#263D67] flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Delivery Modes
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-500">
                        Select how this announcement will be delivered
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {options.modes.map((mode) => (
                        <FormField
                          key={mode}
                          control={form.control}
                          name="modes"
                          render={({ field }) => {
                            return (
                              <FormItem key={mode} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(mode)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, mode])
                                        : field.onChange(field.value?.filter((value) => value !== mode))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">{mode}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recipients */}
              <FormField
                control={form.control}
                name="recipients"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel className="font-semibold text-[#263D67] flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Recipients
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-500">
                        Select who will receive this announcement
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {options.recipients.map((recipient) => (
                        <FormField
                          key={recipient}
                          control={form.control}
                          name="recipients"
                          render={({ field }) => {
                            return (
                              <FormItem key={recipient} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(recipient)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, recipient])
                                        : field.onChange(field.value?.filter((value) => value !== recipient))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">{recipient}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 pt-2 pb-6 px-6 bg-gray-50 rounded-b-lg">
          <Button variant="outline" type="button" className="px-5">
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit((data) => console.log("Announcement Data:", data))}
            className="bg-[#263D67] hover:bg-[#1a2a4a] text-white px-6"
          >
            Post Announcement
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
