import { Button } from "@/components/ui/button/button"
import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { MoveLeft, UsersRound, MoveRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { showErrorToast } from "@/components/ui/toast"

export function RegisterToExistingFam({ tab_params }: { tab_params: Record<string, any> }) {
  // -------------------- HANDLERS ----------------------
  // Submit function
  const handleContinue = async () => {
    console.log(tab_params?.form.getValues().familySchema)
    if (!(await tab_params?.form.trigger(["familySchema"]))) {
      showErrorToast("Please fill out all required fields to continue")
      return
    }

    tab_params?.next(true)
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
        </CardContent>
      </Card>
    </div>
  )
}
