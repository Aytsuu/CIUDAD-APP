import { Button } from "@/components/ui/button/button"
import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { MoveLeft, Users, UserPlus, UsersRound, MoveRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { showErrorToast } from "@/components/ui/toast"

export function RegisterToExistingFam({ tab_params }: { tab_params: Record<string, any> }) {
  // -------------------- HANDLERS ----------------------
  // Submit function
  const handleContinue = async () => {
    if (!(await tab_params?.form.trigger(["familySchema"]))) {
      showErrorToast("Please fill out all required fields to continue")
      return
    }

    tab_params?.next(true)

    // setIsSubmitting(true)

    // try {
    //   const formIsValid = await form.trigger()
    //   if (!formIsValid) {
    //     showErrorToast("Please fill out all required fields to continue")
    //     return
    //   }

    //   const values = form.getValues()

    //   await addFamilyComposition([
    //     {
    //       fam: values.familyId,
    //       fc_role: capitalize(values.role),
    //       rp: tab_params?.residentId,
    //     },
    //   ])

    //   showSuccessToast("Successfully added to existing family!")
    //   tab_params.next?.(true)
    // } catch (error) {
    //   console.error("Error adding to family:", error)
    //   showErrorToast("Failed to add to family. Please try again.")
    // } finally {
    //   setIsSubmitting(false)
    // }
  }

  // -------------------- RENDER ----------------------
  return (
    <div className="w-full flex justify-center px-4">
      <Card className="w-full max-w-4xl max-h-[700px] shadow-none overflow-y-auto">
        {/* Navigation Button */}
        <div className="flex justify-start p-4 pb-0">
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            onClick={() => tab_params?.setHasFamily(false)}
          >
            <MoveLeft className="mr-2 w-4 h-4" />
            Register as Independent
          </Button>
        </div>

        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UsersRound className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Join Existing Family</h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Add this resident to an existing family unit. This is ideal for family members who want to be registered
            under the same family record.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Alert */}
          {/* <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Existing Family Registration:</strong> This option allows you to add the resident to a family that
              already exists in the system. Make sure you have the correct Family ID and role information.
            </AlertDescription>
          </Alert> */}

          <Separator />

          {/* Form Content */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <Form {...tab_params?.form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleContinue()
                }}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormInput
                      control={tab_params?.form.control}
                      name="familySchema.familyId"
                      label="Family ID"
                      placeholder="Enter the existing family ID"
                    />
                    <p className="text-xs text-gray-500">The unique identifier of the family you want to join</p>
                  </div>

                  <div className="space-y-2">
                    <FormSelect
                      control={tab_params?.form.control}
                      name="familySchema.role"
                      label="Family Role"
                      options={[
                        { id: "mother", name: "Mother" },
                        { id: "father", name: "Father" },
                        { id: "guardian", name: "Guardian" },
                        { id: "dependent", name: "Dependent" },
                      ]}
                    />
                    <p className="text-xs text-gray-500">The resident's role within the family structure</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-4">
                  <Button className="min-w-32">
                    Next <MoveRight />
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Help Section */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 mb-2">
              Need help finding the Family ID? Contact your administrator for assistance.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Family Connection
              </span>
              <span className="flex items-center gap-1">
                <UserPlus className="w-3 h-3" />
                Role Assignment
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
