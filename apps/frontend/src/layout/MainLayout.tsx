import SidebarLayout from "@/components/ui/sidebar/sidebar-layout";

export function MainLayout() {
  return (
    <div className="">
        {/* Sidebar and Navbar */}
      <div>
        <SidebarLayout children />
      </div>
      <div>
        {/*Main */}
      </div>
    </div>
  );
}
