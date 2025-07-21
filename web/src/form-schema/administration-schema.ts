import { z } from "zod";
import { usePositions } from "@/pages/record/administration/queries/administrationFetchQueries";
import { Type } from "@/pages/record/administration/administrationEnums";

export const useValidatePosition = () => {
  const { data: positions } = usePositions();

  const isPositionUnique = (title: string) => {
    if (!positions) false;
    return positions.some((position: any) => position.pos_title === title);
  };
  return { isPositionUnique };
};

export const positionAssignmentSchema = z.object({
  assignPosition: z.string().min(1, "Position is required."),
});

export const positionFormSchema = (isUnique: (val: string) => boolean, formType: string) =>
  z.object({
    pos_title: z
      .string()
      .min(1, "Title is required.")
      .min(3, "Title must be atleast 3 letters.")
      .refine((val) => {
        if(formType === Type.Edit) return true;
        return !isUnique(val)
      }, {
        message: "Position with this title already exists",
      }),

    pos_max: z.string().min(1, "Maximum holders is required."),
  });
