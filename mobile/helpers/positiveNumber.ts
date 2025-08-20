
import z from "zod";
export const positiveNumberSchema = z.union([
  z.string()
    .min(1, "Value is required")
    .transform(val => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error("Invalid number");
      return num;
    }),
  z.number()
]).refine(val => val >= 0, {
  message: "Value must be a positive number"
});