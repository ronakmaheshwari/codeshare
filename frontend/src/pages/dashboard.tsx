import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { RocketIcon } from "lucide-react";

const Dashboard = () => {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full overflow-hidden bg-slate-50">
                <Sidebar className="bg-zinc-800">
                    <SidebarHeader className="px-3 py-3">
                        <div className="bg-zinc-700 text-zinc-50 flex justify-center items-center gap-2 w-full h-10 rounded-md">
                            <RocketIcon className="w-6 h-6 bg-purple-600 text-white p-1 rounded-md" />
                            <p className="text-md font-semibold text-zinc-50">Code Share</p>
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="px-2">
                        <Button className="">Home</Button>
                    </SidebarContent>
                </Sidebar>

                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-white lg:hidden">
                        <SidebarTrigger />
                        <p className="text-sm font-medium text-slate-900">Menu</p>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto p-4">
                        {/* main dashboard content goes here */}
                    </div>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default Dashboard;