import { Sidebar } from "lucide-react"
import { SidebarContent, SidebarHeader } from "../ui/sidebar"

const DashboardSidebar = () => {
    return (
        <div>
            <Sidebar>
                <SidebarHeader className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">Code Share</p>
                </SidebarHeader>
                <SidebarContent className="px-2">
                        {/* nav items go here */}
                </SidebarContent>
            </Sidebar>
        </div>
    )
}
export default DashboardSidebar