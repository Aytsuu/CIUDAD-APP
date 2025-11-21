import { Form } from "@/components/ui/form/form";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  groupPositionSchema,
  useValidatePosition,
} from "@/form-schema/administration-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/form/form-input";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Users, Trash2, Badge as Position } from "lucide-react";
import { useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useAddPositionBulk } from "./queries/administrationAddQueries";
import { renderActionButton } from "./AdministrationActionConfig";
import type { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { capitalizeAllFields } from "@/helpers/capitalize";
import {
  showErrorToast,
  showPlainToast,
  showSuccessToast,
} from "@/components/ui/toast";
import { Type } from "./AdministrationEnums";
import { useUpdatePositionGroup } from "./queries/administrationUpdateQueries";
import { Label } from "@/components/ui/label";

export default function GroupPositionForm() {
  // =============== STATE INITIALIZATION ===============
  const { user } = useAuth();
  const { mutateAsync: addPositionBulk } = useAddPositionBulk();
  const { mutateAsync: updaetPositionGroup } = useUpdatePositionGroup();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [positions, setPositions] = React.useState<Record<string, any>[]>([]);
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const formType = React.useMemo(() => params?.type || "", [params]);
  const data = React.useMemo(() => params?.data, [params]);
  const { isPositionUnique } = useValidatePosition();
  const schema = groupPositionSchema(isPositionUnique);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      pos_group: "",
      positions: {
        list: [],
        new: {
          pos_title: "",
          pos_max: "1",
        },
      },
    },
  });

  const { append } = useFieldArray({
    control: form.control,
    name: "positions.list",
  });

  // for editing
  const hasChanges = form.formState.isDirty;

  // =============== SIDE EFFECTS ===============
  // Prevent typing negative values and 0
  React.useEffect(() => {
    const max_holders = form.watch("positions.new.pos_max");
    const maxHoldersNumber = Number(max_holders);
    if (max_holders === "0" || maxHoldersNumber < 0) {
      form.setValue("positions.new.pos_max", "1");
    }
  }, [form.watch("positions.new.pos_max")]);

  React.useEffect(() => {
    const list = form.watch("positions.list");
    if (list) {
      setPositions(list);
    }
  }, [form.watch("positions.list")]);

  React.useEffect(() => {
    if (!data) return;

    form.reset(
      {
        pos_group: data?.category,
        positions: {
          list: data?.categoryPositions?.map((pos: any) => ({
            pos_id: pos.pos_id,
            pos_title: pos.pos_title,
            pos_max: pos.pos_max,
            isPredefined: pos.pos_is_predefined,
          })),
        },
      },
      { keepDirty: false }
    );
  }, [data]);

  // =============== HANDLERS ===============
  const handleRemovePosition = (title: string) => {
    const new_list = positions.filter((pos: any) => pos.pos_title !== title);
    form.setValue("positions.list", new_list as any);
  };

  const handleAddPosition = async () => {
    const formIsValid = await form.trigger("positions.new");
    if (!formIsValid) {
      return;
    }

    const values = form.getValues("positions.new");
    const duplicate = positions.some(
      (pos: any) =>
        pos.pos_title.toLowerCase() === values.pos_title.toLowerCase()
    );

    if (duplicate) {
      showErrorToast("Position has already been added.");
      return;
    }

    append(values);
    // Clear the form after adding
    form.setValue("positions.new.pos_title", "");
    form.setValue("positions.new.pos_max", "1");
  };

  // Create new group
  const submit = async () => {
    const formIsValid = await form.trigger("pos_group");

    if (!formIsValid) {
      showErrorToast("Please fill out all required fields");
      return;
    }

    if (positions.length === 0) {
      showSuccessToast("Please add at least one (1) position");
      return;
    }

    const values = form.getValues();
    const data = positions.map((pos: any) =>
      capitalizeAllFields({
        pos_title: pos.pos_title,
        pos_max: parseInt(pos.pos_max),
        pos_group: values.pos_group,
        pos_category:
          user?.staff?.staff_type?.toLowerCase() == "barangay staff"
            ? "BARANGAY POSITION"
            : "HEALTH POSITION",
        staff: user?.staff?.staff_id,
      })
    );

    try {
      setIsSubmitting(true);
      // Add positions (API handles dual database insertion)
      await addPositionBulk(data);
      form.reset();
      showSuccessToast("Group position added successfully");
    } catch (error) {
      showErrorToast("Failed to create group position");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update group position
  const update = async () => {
    if (!hasChanges) {
      showPlainToast("No changes made");
      return;
    }

    const formIsValid = await form.trigger("pos_group");
    if (!formIsValid) {
      showErrorToast("Please fill out all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const values = form.getValues();
      const { pos_group, positions } = values;
      const data = positions.list?.map((pos: any) => ({
        ...pos,
        pos_group: pos_group,
      }));
      await updaetPositionGroup(data);
      showSuccessToast("Updated Successfully!");
      form.reset(values, { keepDirty: false });
    } catch (err) {
      showErrorToast("Failed to update group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============== RENDER ===============
  return (
    <main className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <LayoutWithBack title={params.title} description={params.description}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
                    General Information
                  </CardTitle>
                  <CardDescription>
                    {formType != Type.Edit &&
                      "Create a new position group and add positions to it"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                      }}
                      className="space-y-6"
                    >
                      {/* Group Name Section */}
                      <div className="space-y-4">
                        <FormInput
                          control={form.control}
                          name="pos_group"
                          label="Group Name"
                          placeholder="Enter the name of the group"
                        />
                      </div>

                      <Separator />

                      {/* Add Position Section */}
                      {formType == Type.Add && (
                        <>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-lg text-gray-700 flex items-center">
                                Add Positions
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Add positions that belong to this group
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormInput
                                control={form.control}
                                name="positions.new.pos_title"
                                label="Position Title"
                                placeholder="e.g., Response Team Head, Councilor"
                              />
                              <FormInput
                                control={form.control}
                                name="positions.new.pos_max"
                                label="Maximum Holders"
                                placeholder="Enter maximum holders"
                                type="number"
                              />
                            </div>

                            <Button
                              type="button"
                              onClick={handleAddPosition}
                              className="w-full md:w-auto"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Position
                            </Button>
                          </div>
                          <Separator />
                        </>
                      )}

                      {/* Submit Section */}
                      <div className="flex justify-end pt-4">
                        {renderActionButton({
                          formType,
                          isSubmitting,
                          submit,
                          update,
                        })}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Positions Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader className="mb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Position className="h-5 w-5" />
                    Positions Preview
                    {positions.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {positions.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Positions that will be created in this group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {positions.length === 0 ? (
                    <div className="text-center py-8">
                      <Position className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        No positions added yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add positions using the form on the left
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {positions.map((pos: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {pos.pos_title.toUpperCase()}
                            </h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Max: {pos.pos_max} holder
                              {pos.pos_max !== "1" ? "s" : ""}
                            </p>
                          </div>
                          {!pos.isPredefined && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemovePosition(pos.pos_title)
                              }
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove position</span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </LayoutWithBack>
      </div>
    </main>
  );
}
