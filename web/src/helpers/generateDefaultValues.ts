import { z } from "zod";

export const generateDefaultValues = (schema: z.ZodTypeAny) => {
  const shape = (schema as z.ZodObject<any>).shape;
  const defaults: Record<string, any> = {};

  for (const key in shape) {
    const field = shape[key];

    // Default to empty array for ZodArray, otherwise empty string
    if (field instanceof z.ZodArray) {
      defaults[key] = [];
    } else {
      defaults[key] = "";
    }
  }

  return defaults;
};
