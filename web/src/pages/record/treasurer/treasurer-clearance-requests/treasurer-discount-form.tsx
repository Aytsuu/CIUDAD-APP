import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface DiscountAuthorizationFormProps {
    originalAmount: string | undefined;
    onAuthorize: (discountedAmount: string, discountReason: string) => void;
    onCancel: () => void;
}

const DiscountSchema = z.object({
    authCode: z.string().min(1, "Authorization code is required"),
    discountedAmount: z.string().min(1, "Discounted amount is required"),
    discountReason: z.string().min(1, "Reason for discount is required")
});

function DiscountAuthorizationForm({ originalAmount, onAuthorize }: DiscountAuthorizationFormProps) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [amountError, setAmountError] = useState<string>("");
    
    //auth code for demo purposes pero asa ni nako i storeeee
    const CAPTAIN_AUTH_CODE = "test";

    const form = useForm<z.infer<typeof DiscountSchema>>({
        resolver: zodResolver(DiscountSchema),
        defaultValues: {
            authCode: "",
            discountedAmount: originalAmount || "0",
            discountReason: ""
        }
    });

    const handleAuthCodeCheck = () => {
        const authCode = form.getValues("authCode");
        if (authCode === CAPTAIN_AUTH_CODE) {
            setIsAuthorized(true);
            setAmountError(""); // Clear any previous errors
            // Set initial discounted amount to the full rate
            form.setValue("discountedAmount", originalAmount || "0");
        } else {
            alert("Invalid authorization code");
        }
    };

    const handleDiscountedAmountChange = (value: string) => {
        const numValue = parseFloat(value);
        const maxAmount = parseFloat(originalAmount || "0");
        
        if (numValue > maxAmount) {
            setAmountError("Discounted amount cannot be higher than the original rate");
            form.setValue("discountedAmount", originalAmount || "0");
        } else if (numValue < 0) {
            setAmountError("");
            form.setValue("discountedAmount", "0");
        } else {
            setAmountError("");
            form.setValue("discountedAmount", value);
        }
    };

    const handleApplyDiscount = () => {
        const discountedAmount = form.getValues("discountedAmount");
        const discountReason = form.getValues("discountReason");
        onAuthorize(discountedAmount, discountReason);
    };

    return (
        <Form {...form}>
            <form className="space-y-6">
                {/* Certificate Amount Info */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Original Amount:</span>
                            <span className="text-primary font-semibold">₱{originalAmount}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Authorization Section */}
                <div className="space-y-4">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="authCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Authorization Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter captain's authorization code"
                                                {...field}
                                                disabled={isAuthorized}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button 
                            type="button"
                            onClick={handleAuthCodeCheck}
                            disabled={isAuthorized}
                            className="mb-[2px] bg-green-600 hover:bg-green-700 text-white"
                        >
                            Verify Code
                        </Button>
                    </div>

                    {/* Discounted Amount Section - Only shows when authorized */}
                    {isAuthorized && (
                        <>
                            <FormField
                                control={form.control}
                                name="discountedAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discounted Amount (₱)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => handleDiscountedAmountChange(e.target.value)}
                                                max={originalAmount}
                                                min="0"
                                            />
                                        </FormControl>
                                        {amountError && (
                                            <FormMessage>{amountError}</FormMessage>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Original amount: ₱{originalAmount} | Discount: ₱{(parseFloat(originalAmount || "0") - parseFloat(field.value || "0")).toFixed(2)}
                                        </p>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="discountReason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason for Discount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Enter reason for applying discount"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <Button 
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={!isAuthorized}
                    >
                        Apply
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default DiscountAuthorizationForm;
