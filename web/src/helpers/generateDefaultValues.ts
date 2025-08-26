import { z } from 'zod';

export const generateDefaultValues = (schema: z.ZodObject<any>): Record<string, any> => {
  const shape = schema.shape; // Get the shape of the schema
  const defaults: Record<string, any> = {};

  Object.keys(shape).forEach((key) => {
    const fieldSchema = shape[key];

    // Handle nested Zod objects
    if (fieldSchema instanceof z.ZodObject) {
      defaults[key] = generateDefaultValues(fieldSchema);
    }
    // Handle arrays of Zod objects
    else if (fieldSchema instanceof z.ZodArray) {
      if (fieldSchema.element instanceof z.ZodObject) {
        defaults[key] = [generateDefaultValues(fieldSchema.element)]; // Default to an array with one empty object
      } else {
        defaults[key] = []; // Default to an empty array
      }
    }
    // Handle default values specified in the schema
    else if (fieldSchema instanceof z.ZodDefault) {
      defaults[key] = fieldSchema._def.defaultValue();
    }
    // Handle all other fields (strings, numbers, etc.)
    else {
      defaults[key] = "";
    }
  });

  return defaults;
};