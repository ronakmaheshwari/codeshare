import { queryClient } from "@/App";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import getUserIdFromToken from "@/lib/jwtTokenParser";
import { useAuth } from "@/provider/authContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Crown,
    Download,
    ExternalLink,
    Globe,
    Lock,
    LogOut,
    Pencil,
    Plus,
    RocketIcon,
    Trash2,
    Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DashboardRoom {
    id: string;
    link: string;
    language: string;
    title: string | null;
    isPublic: boolean;
    isEditable: boolean;
    ownerId: string;
    participants: { role: string }[];
}

interface DashboardRoomsResponse {
    error: boolean;
    message: string;
    data: DashboardRoom[];
    participatedRooms: number;
    roomsOwned: number;
}

interface RoomDetails {
    id: string;
    link: string;
    title: string | null;
    language: string;
    content: string;
    isEditable: boolean;
    isPublic: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    participants: {
        id: string;
        userId: string;
        roomId: string;
        role: string;
        joinedAt: string;
    }[];
}

interface Participant {
    id: string;
    isOnline: boolean;
    user: {
        id: string;
        name: string;
        email: string;
    };
    role: string;
    joinedAt: string;
}

const ROLES = ["viewer", "editor"] as const;

const Dashboard = () => {
    const { token, setToken } = useAuth();
    const navigate = useNavigate();
    const userId = getUserIdFromToken(token);

    const [selectedLink, setSelectedLink] = useState<string | null>(null);

    const authHeaders = { Authorization: `Bearer ${token}` };

    const {
        data: dashboardData,
        isLoading: roomsLoading,
        isError: roomsError,
    } = useQuery({
        queryKey: ["dashboard", "rooms"],
        queryFn: async () => {
            const result = await api.get<DashboardRoomsResponse>("/dashboard/rooms", {
                headers: authHeaders,
            });
            return result.data;
        },
    });

    const { data: roomDetails, isLoading: detailsLoading } = useQuery({
        queryKey: ["room", selectedLink],
        queryFn: async () => {
            const result = await api.get(`/room/${selectedLink}`, {
                headers: authHeaders,
            });
            return result.data.data as RoomDetails;
        },
        enabled: !!selectedLink,
    });

    const { data: participantsData, isLoading: participantsLoading } = useQuery({
        queryKey: ["room", selectedLink, "participants"],
        queryFn: async () => {
            const result = await api.get(`/room/participants/${selectedLink}`, {
                headers: authHeaders,
            });
            return result.data as { data: Participant[]; count: number };
        },
        enabled: !!selectedLink,
        refetchInterval: 10000,
    });

    const refreshDashboard = () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard", "rooms"] });
    };

    const refreshRoom = (link: string) => {
        queryClient.invalidateQueries({ queryKey: ["room", link] });
        queryClient.invalidateQueries({ queryKey: ["room", link, "participants"] });
    };

    const createRoomMutation = useMutation({
        mutationFn: async () => {
            const result = await api.post("/room/create", {}, { headers: authHeaders });
            return result.data;
        },
        onSuccess: (data) => {
            toast.success(data.message ?? "Room created");
            refreshDashboard();
            navigate(`/code/${data.link}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message ?? "Failed to create room");
        },
    });

    const downloadMutation = useMutation({
        mutationFn: async (link: string) => {
            const result = await api.get(`/room/download/${link}`, {
                headers: authHeaders,
                responseType: "text",
            });
            return { content: result.data as string, link };
        },
        onSuccess: ({ content, link }) => {
            const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${link}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success("Download started");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message ?? "Download failed");
        },
    });

    const roleMutation = useMutation({
        mutationFn: async ({ link, updatedUser, role }: { link: string; updatedUser: string; role: string }) => {
            const result = await api.post(
                `/room/role/${link}`,
                { updatedUser, role },
                { headers: authHeaders }
            );
            return { data: result.data, link };
        },
        onSuccess: ({ data, link }) => {
            toast.success(data.message);
            refreshRoom(link);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message ?? "Failed to update role");
        },
    });

    const upgradeMutation = useMutation({
        mutationFn: async ({ link, mode }: { link: string; mode: boolean }) => {
            const result = await api.patch(
                `/room/upgrade/${link}`,
                { mode },
                { headers: authHeaders }
            );
            return { data: result.data, link };
        },
        onSuccess: ({ data, link }) => {
            toast.success(data.message);
            refreshRoom(link);
            refreshDashboard();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message ?? "Failed to upgrade room");
        },
    });

    const editMutation = useMutation({
        mutationFn: async ({ link, editable }: { link: string; editable: boolean }) => {
            const result = await api.patch(
                `/room/edit/${link}`,
                { editable },
                { headers: authHeaders }
            );
            return { data: result.data, link };
        },
        onSuccess: ({ data, link }) => {
            toast.success(data.message);
            refreshRoom(link);
            refreshDashboard();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message ?? "Failed to update room");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (link: string) => {
            const result = await api.delete(`/room/${link}`, { headers: authHeaders });
            return { data: result.data, link };
        },
        onSuccess: ({ data, link }) => {
            toast.success(data.message);
            setSelectedLink(null);
            refreshDashboard();
            queryClient.removeQueries({ queryKey: ["room", link] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message ?? "Failed to delete room");
        },
    });

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
    };

    const isOwner = (room: DashboardRoom | RoomDetails | undefined) =>
        room?.ownerId === userId;

    const selectedDashboardRoom = dashboardData?.data.find((r) => r.link === selectedLink);

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full overflow-hidden bg-slate-50">
                <Sidebar className="bg-neutral-900 border-r border-neutral-800">
                    <SidebarHeader className="px-3 py-3">
                        <div className="bg-white text-black flex justify-center items-center gap-2 w-full h-10 rounded-md">
                            <RocketIcon className="w-6 h-6 bg-purple-600 text-white p-1 rounded-md" />
                            <p className="text-lg font-semibold text-black">Code Share</p>
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="px-2 flex flex-col gap-2">
                        <Button className="text-black bg-white hover:bg-zinc-100 justify-start">
                            Home
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-zinc-300 hover:text-white hover:bg-zinc-800 justify-start"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </Button>
                    </SidebarContent>
                </Sidebar>

                <div className="flex-1 min-w-0 flex flex-col bg-zinc-950">
                    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="text-zinc-300 lg:hidden" />
                            <p className="text-lg font-semibold text-zinc-50">Dashboard</p>
                        </div>
                        <Button
                            onClick={() => createRoomMutation.mutate()}
                            disabled={createRoomMutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {createRoomMutation.isPending ? "Creating..." : "New Room"}
                        </Button>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatCard
                                label="Rooms Joined"
                                value={dashboardData?.participatedRooms}
                                loading={roomsLoading}
                            />
                            <StatCard
                                label="Rooms Owned"
                                value={dashboardData?.roomsOwned}
                                loading={roomsLoading}
                            />
                        </div>

                        <div>
                            <h2 className="text-white font-semibold text-xl mb-4">Your Rooms</h2>

                            {roomsLoading && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="h-36 rounded-lg bg-zinc-800" />
                                    ))}
                                </div>
                            )}

                            {roomsError && (
                                <p className="text-red-400 text-sm">Failed to load rooms. Please try again.</p>
                            )}

                            {!roomsLoading && dashboardData?.data.length === 0 && (
                                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
                                    <p className="text-zinc-400 mb-4">No rooms yet. Create one to get started.</p>
                                    <Button
                                        onClick={() => createRoomMutation.mutate()}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Room
                                    </Button>
                                </div>
                            )}

                            {!roomsLoading && dashboardData && dashboardData.data.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {dashboardData.data.map((room) => (
                                        <RoomCard
                                            key={room.id}
                                            room={room}
                                            isOwner={room.ownerId === userId}
                                            onSelect={() => setSelectedLink(room.link)}
                                            onOpen={() => navigate(`/code/${room.link}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Sheet open={!!selectedLink} onOpenChange={(open) => !open && setSelectedLink(null)}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100 overflow-y-auto"
                >
                    <SheetHeader className="border-b border-zinc-800 pb-4">
                        <SheetTitle className="text-zinc-50 text-lg">
                            {roomDetails?.title ?? selectedDashboardRoom?.title ?? "Room Details"}
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400">
                            Link: <span className="font-mono text-purple-400">{selectedLink}</span>
                        </SheetDescription>
                    </SheetHeader>

                    {detailsLoading ? (
                        <div className="space-y-3 p-4">
                            <Skeleton className="h-6 w-3/4 bg-zinc-800" />
                            <Skeleton className="h-20 w-full bg-zinc-800" />
                        </div>
                    ) : roomDetails && (
                        <div className="space-y-6 p-4">
                            <section className="space-y-2">
                                <h3 className="text-sm font-medium text-zinc-300">Room Info</h3>
                                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-2 text-sm">
                                    <InfoRow label="Language" value={roomDetails.language} />
                                    <InfoRow
                                        label="Visibility"
                                        value={roomDetails.isPublic ? "Public" : "Private"}
                                    />
                                    <InfoRow
                                        label="Mode"
                                        value={roomDetails.isEditable ? "Editable" : "View only"}
                                    />
                                    <InfoRow
                                        label="Your Role"
                                        value={
                                            roomDetails.participants[0]?.role ?? "unknown"
                                        }
                                    />
                                    <InfoRow
                                        label="Content Preview"
                                        value={
                                            roomDetails.content.length > 80
                                                ? `${roomDetails.content.slice(0, 80)}...`
                                                : roomDetails.content || "(empty)"
                                        }
                                    />
                                </div>
                            </section>

                            <section className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={() => selectedLink && navigate(`/code/${selectedLink}`)}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Editor
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                                    onClick={() => selectedLink && downloadMutation.mutate(selectedLink)}
                                    disabled={downloadMutation.isPending}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </section>

                            {isOwner(roomDetails) && (
                                <section className="space-y-3">
                                    <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-amber-400" />
                                        Owner Controls
                                    </h3>
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                                                onClick={() =>
                                                    selectedLink &&
                                                    upgradeMutation.mutate({ link: selectedLink, mode: true })
                                                }
                                                disabled={upgradeMutation.isPending}
                                            >
                                                <Pencil className="w-4 h-4 mr-2" />
                                                Upgrade to Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                                                onClick={() =>
                                                    selectedLink &&
                                                    upgradeMutation.mutate({ link: selectedLink, mode: false })
                                                }
                                                disabled={upgradeMutation.isPending}
                                            >
                                                <Lock className="w-4 h-4 mr-2" />
                                                Upgrade to View
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                                                onClick={() =>
                                                    selectedLink &&
                                                    editMutation.mutate({ link: selectedLink, editable: true })
                                                }
                                                disabled={editMutation.isPending}
                                            >
                                                Set Editable
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                                                onClick={() =>
                                                    selectedLink &&
                                                    editMutation.mutate({ link: selectedLink, editable: false })
                                                }
                                                disabled={editMutation.isPending}
                                            >
                                                Set View Only
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300"
                                            onClick={() => selectedLink && deleteMutation.mutate(selectedLink)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Room
                                        </Button>
                                    </div>
                                </section>
                            )}

                            <section className="space-y-3">
                                <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Participants ({participantsData?.count ?? 0})
                                </h3>
                                {participantsLoading && (
                                    <Skeleton className="h-24 w-full bg-zinc-800" />
                                )}
                                {!participantsLoading && participantsData?.data.length === 0 && (
                                    <p className="text-sm text-zinc-500">No participants found.</p>
                                )}
                                <div className="space-y-2">
                                    {participantsData?.data.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-zinc-100 truncate">
                                                    {p.user.name}
                                                    {p.user.id === userId && (
                                                        <span className="ml-2 text-xs text-zinc-500">(you)</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-zinc-500 truncate">{p.user.email}</p>
                                            </div>
                                            {p.user.id !== userId && isOwner(roomDetails) ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="shrink-0 capitalize text-xs font-medium px-2.5 py-1.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-colors outline-none">
                                                        {p.role}
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-36 bg-zinc-900 border border-zinc-700"
                                                    >
                                                        {ROLES.map((role) => (
                                                            <DropdownMenuItem
                                                                key={role}
                                                                className="capitalize text-zinc-200 focus:bg-zinc-800"
                                                                onClick={() => {
                                                                    selectedLink &&
                                                                        roleMutation.mutate({
                                                                            link: selectedLink,
                                                                            updatedUser: p.user.id,
                                                                            role,
                                                                        });
                                                                }}
                                                            >
                                                                {role}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <span className="shrink-0 capitalize text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                                    {p.role}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </SidebarProvider>
    );
};

function StatCard({
    label,
    value,
    loading,
}: {
    label: string;
    value: number | undefined;
    loading: boolean;
}) {
    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">{label}</p>
            {loading ? (
                <Skeleton className="h-8 w-16 mt-1 bg-zinc-800" />
            ) : (
                <p className="text-3xl font-bold text-zinc-50 mt-1">{value ?? 0}</p>
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-zinc-500">{label}</span>
            <span className="text-zinc-200 text-right capitalize">{value}</span>
        </div>
    );
}

function RoomCard({
    room,
    isOwner,
    onSelect,
    onOpen,
}: {
    room: DashboardRoom;
    isOwner: boolean;
    onSelect: () => void;
    onOpen: () => void;
}) {
    const myRole = room.participants[0]?.role ?? "viewer";

    return (
        <div
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3 hover:border-purple-600/50 transition-colors cursor-pointer"
            onClick={onSelect}
        >
            <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-zinc-100 truncate">
                    {room.title ?? "Untitled Room"}
                </h3>
                {isOwner && <Crown className="w-4 h-4 text-amber-400 shrink-0" />}
            </div>
            <p className="text-xs font-mono text-purple-400">{room.link}</p>
            <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 capitalize">
                    {room.language}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 capitalize">
                    {myRole}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 flex items-center gap-1">
                    {room.isPublic ? (
                        <><Globe className="w-3 h-3" /> Public</>
                    ) : (
                        <><Lock className="w-3 h-3" /> Private</>
                    )}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {room.isEditable ? "Editable" : "View only"}
                </span>
            </div>
            <div className="flex gap-2 mt-auto pt-1">
                <Button
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen();
                    }}
                >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                    }}
                >
                    Manage
                </Button>
            </div>
        </div>
    );
}

export default Dashboard;
