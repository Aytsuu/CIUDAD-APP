import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { FaFacebook, FaPhoneAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import SignIn from "@/pages/landing/signin/signin";
import CebuCitySeal from "@/assets/images/cebucity_seal.svg";
import SanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import { BadgeCheck, Check, SquarePen } from "lucide-react";
import Home from "@/pages/landing/Home";
import About from "@/pages/landing/About";
import Announcements from "@/pages/landing/Announcements";
import MobileApp from "@/pages/landing/MobileApp";
import React from "react";
import { Footer } from "@/pages/landing/Footer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLandingDetails } from "@/pages/landing/queries/landingFetchQueries";
import { useUpdateLandingPage } from "@/pages/landing/queries/landingUpdateQueries";
import { SheetLayout } from "@/components/ui/sheet/sheet-layout";
import { useForm } from "react-hook-form";
import z from "zod";
import { landingEditFormSchema } from "@/form-schema/landing-page-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { Form } from "@/components/ui/form/form";
import LandingEditForm from "@/pages/landing/LandingEditForm";
import { Separator } from "@/components/ui/separator";
import { MediaUploadType } from "@/components/ui/media-upload";

export default function LandingLayout() {
  const { user } = useAuth();
  const homeRef = React.useRef<HTMLDivElement>(null);
  const aboutRef = React.useRef<HTMLDivElement>(null);
  const announcementRef = React.useRef<HTMLDivElement>(null);
  const mobileAppRef = React.useRef<HTMLDivElement>(null);
  const [hideEditButton, setHideEditButton] = React.useState<boolean>(false);
  const [carousel, setCarousel] = React.useState<MediaUploadType>([]);

  const NavItemList = [
    { path: homeRef, title: "Home" },
    { path: aboutRef, title: "Our Barangay" },
    { path: announcementRef, title: "Announcement" },
    { path: mobileAppRef, title: "Mobile App" },
  ];

  const { data: landingData } = useLandingDetails(1);
  const { mutateAsync: updateLandingPage } = useUpdateLandingPage();

  const form = useForm<z.infer<typeof landingEditFormSchema>>({
    resolver: zodResolver(landingEditFormSchema),
    defaultValues: generateDefaultValues(landingEditFormSchema),
  });

  React.useEffect(() => {
    if (landingData) {
      form.reset({
        cpt_name: landingData.cpt_name,
        cpt_photo: {
          name: "",
          type: "",
          file: "",
          url: landingData.cpt_photo || "",
        },
        contact: landingData.contact,
        email: landingData.email,
        address: landingData.address,
        quote: landingData.quote,
        mission: landingData.mission,
        vision: landingData.vision,
        values: landingData.values,
      });

      setCarousel(landingData.files)
    }
  }, [landingData, form]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      homeRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const update = async () => {
    if (!(await form.trigger())) {
      console.log(form.getValues());
      return;
    }

    try {
      const values = form.getValues();
      const { cpt_photo, ...restVal } = values as any;
      const { url, ...restCptPhoto } = cpt_photo;

      if(landingData.files.length !== carousel.length) {
        restVal.carousel = carousel.map((media) => ({
          name: media.name,
          type: media.type,
          file: media.file
        }))
      }

      await updateLandingPage({
        ...restVal,
        ...(restCptPhoto.type !== "" && { cpt_photo: restCptPhoto }),
      });
    } catch (err) {}
  };

  return (
    <div className="relative w-full min-h-screen bg-snow">
      {/* Fixed Headers Container */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Top Header */}
        <header className="w-full bg-darkBlue1 flex justify-center px-4 py-3">
          <div className="w-[90%] text-white/80 flex items-center gap-5">
            <Label className="font-poppins border-r-2 pr-4 flex items-center gap-1">
              <BadgeCheck size={16} className="fill-green-600" /> The Official
              Website of Barangay San Roque (Ciudad)
            </Label>
            <div className="flex gap-3">
              <FaFacebook
                className="hover:text-white cursor-pointer"
                onClick={() => {
                  window.open(
                    "https://www.facebook.com/brgysanroqueciudad",
                    "_black"
                  );
                }}
              />
              <Popover>
                <PopoverTrigger>
                  <FaPhoneAlt className="hover:text-white cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent className="bg-gray-600 border-0">
                  <p className="text-sm text-white">{landingData?.contact}</p>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <img
            src={CebuCitySeal}
            alt="Cebu city official seal"
            className="w-[30px] h-[30px]"
          />
        </header>
        {/* Main Header */}
        <header className="w-full bg-white flex justify-center shadow-lg">
          <div className="w-full h-full flex justify-between items-center">
            <div className="w-1/3 h-full flex items-center slope-right p-3 bg-[#1273B8]">
              <div className="w-full flex justify-center items-center gap-3">
                <img
                  src={SanRoqueLogo}
                  alt="San Roque Logo"
                  className="w-[50px] h-[50px]"
                />
                <div className="grid text-white">
                  <Label className="text-[15px]">
                    BARANGAY SAN ROQUE (CIUDAD)
                  </Label>
                  <Label className="font-poppins">Cebu City</Label>
                </div>
              </div>
            </div>
            {/* Navigation */}
            <nav className="w-1/2 flex items-center gap-3">
              {NavItemList.map(({ path, title }) => (
                <div key={title} onClick={() => scrollTo(path)}>
                  <Label className="p-[10px] rounded-lg hover:bg-lightBlue cursor-pointer">
                    {title}
                  </Label>
                </div>
              ))}
              {user?.staff?.staff_id ? (
                <Link to={"/dashboard"}>
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <DialogLayout
                  trigger={<Button>Sign in</Button>}
                  className="p-0 m-0 border-0 bg-transparent shadow-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none max-w-none w-auto h-auto"
                  mainContent={<SignIn />}
                />
              )}
            </nav>
          </div>
        </header>
      </div>

      {/* Floating Edit Button */}
      {user?.staff?.pos?.toLowerCase() == "admin" &&
        user?.staff?.staff_type?.toLowerCase() == "barangay staff" && (
          <SheetLayout
            contentClassname="sm:max-w-[600px]"
            onOpenChange={() => {
              form.reset();
              setHideEditButton((prev) => !prev);
            }}
            trigger={
              !hideEditButton && (
                <button className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group">
                  <SquarePen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              )
            }
            content={
              <div className="p-4 h-screen">
                <header className="flex justify-between items-center mb-4">
                  <div>
                    <Label className="text-xl text-darkBlue1">
                      Edit Landing Page
                    </Label>
                    <p className="text-[15px] text-gray-600">
                      Configure your landing page content here.
                    </p>
                  </div>
                  {(form.formState.isDirty || carousel.length !== landingData?.files.length) && (
                    <Button
                      className="mt-6 rounded-full"
                      type="button"
                      onClick={update}
                    >
                      <Check />
                      Save
                    </Button>
                  )}
                </header>
                <Separator className="mb-4" />
                <div className="overflow-y-auto h-[85%] pr-4 pl-1">
                  <Form {...form}>
                    <form>
                      <LandingEditForm
                        form={form}
                        carousel={carousel}
                        setCarousel={setCarousel}
                      />
                    </form>
                  </Form>
                </div>
              </div>
            }
          />
        )}

      {/* Scrollable Page Content - Added pt-[120px] to account for fixed headers */}
      <main className="w-full pt-[120px]">
        <section
          ref={homeRef}
          className="w-full h-screen flex justify-center items-center"
        >
          <Home carousel={carousel} />
        </section>
        <section
          ref={aboutRef}
          className="w-full h-[150vh] flex justify-center items-center"
        >
          <About data={landingData} />
        </section>
        <section
          ref={announcementRef}
          className="w-full flex justify-center items-center"
        >
          <Announcements />
        </section>
        <section
          ref={mobileAppRef}
          className="w-full min-h-screen flex justify-center items-center"
        >
          <MobileApp />
        </section>
        <Footer data={landingData} />
      </main>
    </div>
  );
}