import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState, useEffect, useRef } from "react";
import { RefreshCw, UserPlus } from "lucide-react";
import { VaccineSchema, VaccineSchemaType } from "@/form-schema/vaccineSchema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface VaccinationFormProps {
  recordType: string; // Adjust the type if it's not always a string
}
export default function VaccinationForm({ recordType }: VaccinationFormProps) {
  // Form handling
  const form = useForm<VaccineSchemaType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      vaccinetype: "",
      datevaccinated: "",
      lname: "",
      fname: "",
      mname: "",
      age: "",
      sex: "",
      dob: "",
      houseno: "",
      street: "",
      sitio: "",
      barangay: "",
      province: "",
      city: "",
      assignto: "",
      signature: "",
      isTransient: "Resident",
    },
  });

  // Text fields configuration
  const nameFields = [
    { name: "fname", label: "First Name", placeholder: "First Name" },
    { name: "mname", label: "Middle Name", placeholder: "Middle Name" },
    { name: "lname", label: "Last Name", placeholder: "Last Name" },
  ];

  const addressFields = [
    { name: "houseno", label: "House No.", placeholder: "Enter house number" },
    { name: "street", label: "Street", placeholder: "Enter street" },
    { name: "sitio", label: "Sitio", placeholder: "Enter sitio" },
    { name: "barangay", label: "Barangay", placeholder: "Enter barangay" },
    { name: "city", label: "City", placeholder: "Enter city" },
    { name: "province", label: "Province", placeholder: "Enter province" },
  ];

  // Handle form submission
  const onSubmit = async (data: VaccineSchemaType) => {
    try {
      // Validate the form data against the schema
      const validatedData = VaccineSchema.parse(data);
      console.log("Form submitted", validatedData);

      // Reset the form after successful submission
      form.reset();
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Form submission failed. Please check the form for errors.");
    }
  };


  // Canvas state for signature
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  // Initialize the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000000";
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
      }

      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, [hasSignature]);

  // Get exact canvas coordinates
  const getCanvasCoordinates = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
      | TouchEvent
      | MouseEvent
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return { x, y };
  };

  // Handle drawing functions
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const position = getCanvasCoordinates(e);
    setLastPosition(position);
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
      }
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if ("touches" in e) {
      e.preventDefault();
    }

    const position = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(position.x, position.y);
    ctx.stroke();

    setLastPosition(position);
    setHasSignature(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);

    if (hasSignature) {
      const canvas = canvasRef.current;
      if (canvas) {
        const signatureData = canvas.toDataURL("image/png");
        form.setValue("signature", signatureData);
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        form.setValue("signature", "");
      }
    }
  };

  const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full m-1">
              {recordType === "existingPatient" || (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                  <div className="w-full sm:w-[400px]">
                    <Input
                      className="w-full"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Label className="hidden sm:block">or</Label>
                  <button className="flex items-center gap-2 underline text-blue">
                    <UserPlus className="h-4 w-4" />
                    <span>Add Resident</span>
                  </button>
                </div>
              )}

         
              <div className="flex justify-end w-full sm:w-auto sm:ml-auto">
                <FormField
                  control={form.control}
                  name="isTransient"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "transient"}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? "transient" : "resident");
                          }}
                        />
                      </FormControl>
                      <FormLabel className="leading-none">Transient</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <h1 className="font-extrabold text-darkBlue1">STEP 1</h1>
            {/* Vaccine Type and Date Vaccinated */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vaccinetype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccine Type</FormLabel>
                    <FormControl>
                      <SelectLayout
                        className="w-full"
                        label="Vaccine Type"
                        placeholder="Select"
                        options={[
                          { id: "flu", name: "Flu" },
                          { id: "covid", name: "Covid" },
                        ]}
                        value={String(field.value)}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datevaccinated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Vaccinated</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="w-full"
                        {...field}
                        value={currentDate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nameFields.map(({ name, label, placeholder }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof VaccineSchemaType}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          value={String(field.value)}
                          placeholder={placeholder}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            {/* Age and Sex Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <FormControl>
                      <SelectLayout
                        className="w-full"
                        label="Sex"
                        placeholder="Select"
                        options={[
                          { id: "female", name: "Female" },
                          { id: "male", name: "Male" },
                        ]}
                        value={String(field.value)}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <h2 className="font-bold">Address</h2>
            {/* Address Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addressFields.map(({ name, label, placeholder }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof VaccineSchemaType}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          value={String(field.value)}
                          placeholder={placeholder}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Signature Field */}
            <FormField
              control={form.control}
              name="signature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signature</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="border border-gray-300 rounded-md w-full aspect-[4/1] relative overflow-hidden">
                        <canvas
                          ref={canvasRef}
                          className="w-full h-full touch-none cursor-crosshair"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={endDrawing}
                          onMouseLeave={endDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={endDrawing}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearSignature}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Clear Signature
                      </Button>
                      <input type="hidden" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormField
                control={form.control}
                name="assignto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Step 2 to</FormLabel>
                    <FormControl>
                      <SelectLayout
                        className=""
                        label="Assigned to"
                        placeholder="Select"
                        options={[{ id: "1", name: "Keneme" }]}
                        value={String(field.value)}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
              <Button type="submit" className="w-[120px]">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
