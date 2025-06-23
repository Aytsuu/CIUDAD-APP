"use client"

import React from "react"
import { Form } from "@/components/ui/form/form"
import PersonalInfoForm from "./PersonalInfoForm"
import { useResidentForm } from "./useResidentForm"
import { Type } from "../../profilingEnums"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { useAddResidentProfile } from "../../queries/profilingAddQueries"
import { useAuth } from "@/context/AuthContext"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { useDeleteRequest } from "../../queries/profilingDeleteQueries"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button/button"
import { Check, X, ImageIcon, User, FileText, Loader2, ZoomIn } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ResidentRequestForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mutateAsync: addResidentProfile } = useAddResidentProfile()
  const { mutateAsync: deleteRequest } = useDeleteRequest()
  const { form, handleSubmitError, handleSubmitSuccess } = useResidentForm(params.data?.per)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [isRejecting, setIsRejecting] = React.useState<boolean>(false)
  const files = params.data?.files || []

  // ==================== HANDLERS ====================
  const reject = async () => {
    setIsRejecting(true)
    try {
      await deleteRequest(params.data.req_id)
      navigate(-1)
      handleSubmitError("Request rejected successfully")
    } catch (error) {
      handleSubmitError("Failed to reject request")
    } finally {
      setIsRejecting(false)
    }
  }

  const submit = async () => {
    setIsSubmitting(true)
    const isValid = await form.trigger()
    if (!isValid) {
      setIsSubmitting(false)
      handleSubmitError("Please fill out all required fields")
      return
    }

    try {
      addResidentProfile({
        personalId: params.data?.per.per_id,
        staffId: user?.djangoUser?.resident_profile?.staff?.staff_id || "",
      })

      deleteRequest(params.data.req_id)
      navigate(-1)
      handleSubmitSuccess("New record created successfully")
    } catch (error) {
      handleSubmitError("Failed to process request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    // ==================== RENDER ====================
    <LayoutWithBack title={params.title} description={params.description}>
      <div className="space-y-6">
        {/* Request Status Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Registration Request</CardTitle>
                  <p className="text-sm text-gray-600">Review and process resident registration</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Pending Review
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Uploaded Documents */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg">Uploaded Documents</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                {files.length} document{files.length > 1 ? "s" : ""} uploaded with this request
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file: any, index: number) => {
                  const photoUrl = file.file.file_url
                  return (
                    <div key={index} className="relative group">
                      <DialogLayout
                        trigger={
                          <div className="relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
                            <img
                              src={photoUrl || "/placeholder.svg"}
                              alt={`Document ${index + 1}`}
                              className="object-cover h-24 w-full group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        }
                        mainContent={
                          <div className="max-w-4xl max-h-[80vh] overflow-auto">
                            <img
                              src={photoUrl || "/placeholder.svg"}
                              alt={`Document ${index + 1} - Full Size`}
                              className="object-contain w-full h-full"
                            />
                          </div>
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">Document {index + 1}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Information Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </div>
            <p className="text-sm text-gray-600">Review and verify the submitted information</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <PersonalInfoForm
                form={form}
                formType={Type.Request}
                isSubmitting={isSubmitting}
                submit={submit}
                isReadOnly={false}
                reject={reject}
              />
            </Form>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={reject}
                disabled={isSubmitting || isRejecting}
                className="flex-1 sm:flex-none border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Reject Request
                  </>
                )}
              </Button>
              <Button
                onClick={submit}
                disabled={isSubmitting || isRejecting}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Approve & Create Record
                  </>
                )}
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="text-xs text-gray-500 text-center">
              <p>
                By approving this request, you confirm that all information has been reviewed and verified. This action
                will create a new resident record and remove the request from the pending list.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWithBack>
  )
}
