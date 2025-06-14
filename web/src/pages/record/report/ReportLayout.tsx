import { Card, CardContent } from "@/components/ui/card/card"
import { Link, Outlet, useLocation } from "react-router-dom"

const NavItemList = [
  { path: "incident", title: "Incident" },
  { path: "acknowledgement", title: "Acknowledgement" },
  { path: "weekly", title: "Weekly AR" },
  { path: "securado", title: "Securado" },
]

export default function ReportLayout() {
  const location = useLocation()
  const currentPath = location.pathname.split("/").pop() || ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="container mx-auto px-4 py-6 gap-2 flex flex-col">
        {/* Navigation Tabs */}
        <div className="relative">
          <div className="flex flex-wrap gap-1 mb-0 bg-slate-100/60 p-1 rounded-lg backdrop-blur-sm border border-slate-200/60">
            {NavItemList.map(({ path, title }) => {
              const isActive = path === currentPath

              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    relative flex items-center justify-center px-6 py-3 rounded-md text-sm font-medium
                    transition-all duration-300 ease-in-out border
                    ${
                      isActive
                        ? "bg-white text-primary shadow-md shadow-slate-200/60 border-slate-200/60"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border-transparent"
                    }
                  `}
                >
                  <span className="relative z-10 whitespace-nowrap">{title}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-md" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Content Card */}
        <Card className="mt-0 border-0 shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-sm rounded-xl">
          <CardContent className="p-8">
            <div className="animate-in fade-in-50 duration-300">
              <Outlet />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
