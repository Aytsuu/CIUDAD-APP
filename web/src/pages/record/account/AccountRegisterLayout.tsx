"use client"

import React from "react"
import { Form } from "@/components/ui/form/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { accountFormSchema } from "@/form-schema/account-schema"
import AccountRegistrationForm from "./AccountRegistrationForm"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
import { Mail, Lock, User, CircleUserRound } from "lucide-react"
import { useAddAccount } from "./queries/accountAddQueries"
import { useSafeNavigate } from "@/hooks/use-safe-navigate"
import { Button } from "@/components/ui/button/button"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useLocation } from "react-router"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast"

export default function AccountRegistrationLayout({ tab_params }: { tab_params?: Record<string, any> }) {
  const location = useLocation()
  const { safeNavigate } = useSafeNavigate()
  const params = React.useMemo(() => location.state?.params, [location.state])
  const residentId = React.useMemo(() => params?.residentId, [params])

  const { mutateAsync: addAccount } = useAddAccount()

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)

  const defaultValues = React.useRef(generateDefaultValues(accountFormSchema)).current
  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
    mode: "onChange",
  })

  // ==================== HANDLERS ======================
  const submit = async () => {
    setIsSubmitting(true)

    try {
      const formIsValid = await form.trigger()

      if (!formIsValid) {
        showErrorToast("Please fill out all required fields and fix any validation errors")
        return
      }

      const accountInfo = form.getValues()

      await addAccount({
        accountInfo,
        residentId: tab_params?.isRegistrationTab ? tab_params.residentId : residentId,
      })

      showSuccessToast("Account created successfully!")

      // Navigate based on context
      if (tab_params?.isRegistrationTab) {
        tab_params.next?.()
      } else {
        safeNavigate.back()
      }
    } catch (error) {
      console.error("Error creating account:", error)
      showErrorToast("Failed to create account. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (tab_params?.isRegistrationTab) {
      tab_params.next?.()
    } else {
      safeNavigate.back()
    }
  }

  // ==================== RENDER HELPERS ======================

  return (
    <div className="w-full flex justify-center px-4">
      <Card className="w-full max-w-2xl shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50/30">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <CircleUserRound className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Account Registration</h2>
          <p className="max-w-xl mx-auto leading-relaxed">
            Create a secure account for this resident. This will enable them to access digital services and maintain
            their personal information.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert className="border-indigo-200 bg-indigo-50">

            <AlertDescription className="text-indigo-800">
              <strong>Account Creation:</strong> This step is optional but recommended. Creating an account allows the
              resident to access their information online and receive important updates.
            </AlertDescription>
          </Alert>

          <Separator />

          {/* Form Content */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <Form {...form}>
              <form className="space-y-6">
                <AccountRegistrationForm form={form} />
              </form>
            </Form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="ghost" className="flex-1 h-11" type="button" onClick={handleSkip} disabled={isSubmitting}>
              Skip for Now
            </Button>

            <ConfirmationModal
              trigger={
                <Button
                  className="flex-1 h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                    </>
                  )}
                </Button>
              }
              title="Confirm Account Registration"
              description="Are you sure you want to create this account? The resident will be able to use these credentials to access their information."
              actionLabel="Yes, Create Account"
              onClick={submit}
            />
          </div>

          {/* Security Notice */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              <strong>Security Notice:</strong> All account information is encrypted and stored securely. The resident
              will receive their login credentials via secure channels.
            </AlertDescription>
          </Alert>

          {/* Help Section */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">
              Need help with account creation? Contact your system administrator for assistance.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Profile Setup
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email Verification
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Secure Access
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
