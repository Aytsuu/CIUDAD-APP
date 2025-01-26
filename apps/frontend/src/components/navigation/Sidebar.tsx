import { ChevronDown, LogOut } from "lucide-react"; // Ensure to import the ChevronDown properly.

const menuItems = [
  {
    label: "Dashboard",
    link: "dashboard",
  },
  {
    label: "Administration",
    link: "administration",
  },
  {
    label: "Council & Legislative",
    link: "council&Legislative",
  },
  {
    label: "Clerk",
    subItems: [
      { label: "Records", link: "record" },
      { label: "Announcement", link: "announcement" },
    ],
  },
  {
    label: "Finance",
    subItems: [
      { label: "Records", link: "record" },
      { label: "Announcement", link: "announcement" },
    ],
  },
  {
    label: "Gender & Development",
    subItems: [
      { label: "Records", link: "record" },
      { label: "Announcement", link: "announcement" },
    ],
  },
  {
    label: "Waste Management",
    link: "wasteManagement",
  },
  {
    label: "Educational Grant",
    link: "educationalGrant",
  },
  {
    label: "Report",
    link: "report",
  },
];

export function Sidebar() {
  return (
    <div className="flex h-screen flex-col justify-between bg-white">
      <div className="px-4">
        <ul className="mt-6 space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.subItems ? (
                <details className="group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-[#2D4A72] hover:bg-[#1273B8]/10 hover:text-[#1273B8]">
                    <span className="text-sm font-['Poppins'] font-medium">
                      {" "}
                      {item.label}
                    </span>
                    <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                      <ChevronDown size={20} />
                    </span>
                  </summary>
                  <ul className="mt-2 space-y-1 px-4">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        {
                          <a
                            href={subItem.link}
                            className="block rounded-lg px-4 py-2 text-sm font-medium text-[#2D4A72] hover:bg-[#1273B8]/10 hover:text-[#1273B8]"
                          >
                            {subItem.label}
                          </a>
                        }
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <a
                  href={item.link}
                  className="block rounded-l px-4 py-2 text-sm font-['Poppins'] font-medium text-[#2D4A72] hover:text-[#1273B8] hover:bg-[#1273B8]/10 hover:rounded-[10px]"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 px-4 pb-2 pt-2">
        <div className="flex cursor-pointer items-center justify-center space-x-4 py-2 px-4 text-[#2D4A72]  hover:text-[#1273B8] hover:bg-[#1273B8]/10 hover:rounded-[10px] font-['Poppins'] font-medium">
          <LogOut />
          <span>Signout</span>
        </div>
      </div>
    </div>
  );
}
