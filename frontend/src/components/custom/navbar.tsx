import { queryClient } from "@/App";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import api from "@/lib/api";
import getUserIdFromToken from "@/lib/jwtTokenParser";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CopyIcon, DownloadIcon, RocketIcon, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface Props {
    language: string,
    setLanguage: (value: string | undefined) => void;
    code: string,
    link: string | undefined
}

interface participantInterface {
    id: string,
    user: {
        id: string,
        name: string,
        email: string
    },
    role: string,
    joinedAt: string
}

const LANGUAGES = ["plaintext", "javascript", "typescript", "python", "java", "cpp", "go", "rust"];
const roles: string[] = ["viewer", "editor"];

export const Navbar = ({ language, setLanguage, code, link }: Props) => {
    const token = localStorage.getItem("token");
    const [count, setCount] = useState<number>();
    const [participants, setParticipants] = useState<participantInterface[]>([]);
    const [role, setRole] = useState("");
    const [participant, setParticipant] = useState("");

    const userId = getUserIdFromToken(token);

    useQuery({
        queryKey: ['user', link],
        queryFn: async () => {
            try {
                const result = await api.get(`/room/participants/${link}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const data = result.data;
                setCount(data.count);
                setParticipants(data.data);
                return data;
            } catch (error) {
                console.log(error);
                toast.error(`Error took place: ${error}`);
                throw error;
            }
        },
        refetchInterval: 10000,
        refetchIntervalInBackground: true,
        retryDelay: 5000,
    });

    const mutation = useMutation({
        mutationKey: ["download", link],
        mutationFn: async () => {
            const result = await api.get(`/room/download/${link}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: "text", 
            });
            return result.data;
        },
        onSuccess: (data) => {
            const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
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
            const err = error?.response?.data?.message ?? "An unexpected error took place";
            toast.error(err);
        }
    });

    const roleChange = useMutation({
        mutationKey: ["role", link],
        mutationFn: async () => {
            const result = await api.post(`/room/role/${link}`,
            {
                updatedUser: participant,
                role: role
            } ,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return result.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['user', link]});
            toast.success(`${data.message}`);
        },
        onError: (data) => {
            const err = data?.message ?? "An unexpected error took place";
            toast.error(err);
        }
    })

    const handleDownload = () => {
        mutation.mutate();
    };

    const handleRoleChange = (newRole: string) => {
        console.log(participant);
        setRole(newRole);
        roleChange.mutate();
    }

    const copyClipboard = useCallback(async () => {
        await navigator.clipboard.writeText(code);
        toast.success("Copied to clipboard");
    }, [code]);

    return (
        <div className="shrink-0 flex justify-between items-center w-full px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-2">
                <RocketIcon className="w-6 h-6 bg-purple-600 text-white p-1 rounded-md" />
                <p className="text-lg font-bold text-zinc-50">Code Share</p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    className="flex items-center justify-center w-9 h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-50 rounded-md transition-colors"
                    onClick={copyClipboard}
                >
                    <CopyIcon className="w-4 h-4" />
                </button>
                <button
                    className="flex items-center justify-center w-9 h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-50 rounded-md transition-colors"
                    onClick={handleDownload}
                >
                    <DownloadIcon className="w-4 h-4" />
                </button>
                 <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="w-36 justify-between bg-zinc-800 text-zinc-100 capitalize hover:bg-purple-600 hover:text-white data-[state=open]:bg-purple-600 data-[state=open]:text-white">
                                <span className="truncate">{language || "Languages"}</span>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-36 gap-1 p-2 bg-zinc-900">
                                    {LANGUAGES.map((lang) => (
                                        <li key={lang}>
                                            <NavigationMenuLink
                                                onClick={() => setLanguage(lang)}
                                                className={`cursor-pointer block select-none rounded-md px-3 py-2 text-sm capitalize text-zinc-200 hover:bg-purple-600 hover:text-white transition-colors ${
                                                    language === lang ? "bg-purple-600 text-white font-semibold" : ""
                                                }`}
                                            >
                                                {lang}
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-20 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-zinc-800 text-zinc-100 text-sm hover:bg-purple-600 hover:text-white data-[state=open]:bg-purple-600 data-[state=open]:text-white transition-colors outline-none">
                        <Users className="w-4 h-4" />
                        <span>{count ?? 0}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={20}
                        className="w-96 max-h-80 overflow-y-scroll no-scrollbar bg-zinc-900 border border-zinc-800 p-1"
                    >
                        {participants.length === 0 && (
                            <div className="px-3 py-2 text-sm text-zinc-400">No participants</div>
                        )}
                        {participants.map((x) => (
                            <DropdownMenuItem
                                key={x.user.id}
                                className="cursor-default rounded-md px-3 py-2 focus:bg-zinc-800 flex items-center justify-between gap-2"
                                onClick={() => {setParticipant(x.user.id)}}
                            >
                                <div className="flex flex-col items-start gap-0.5 w-full min-w-0">
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <span className="capitalize text-sm font-medium text-zinc-100 truncate">
                                            {x.user.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-zinc-400 truncate w-full">
                                        {x.user.email}
                                    </span>
                                    <span className="text-[11px] text-zinc-500">
                                        Joined {new Date(x.joinedAt).toLocaleString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="shrink-0 flex items-center gap-1 capitalize text-xs font-medium px-2.5 py-1.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-purple-600 hover:border-purple-600 hover:text-white data-[state=open]:bg-purple-600 data-[state=open]:border-purple-600 data-[state=open]:text-white transition-colors outline-none">
                                        {x.role}
                                    </DropdownMenuTrigger>
                                        {x.user.id === userId ? null : (
                                            <DropdownMenuContent
                                            align="end"
                                            side="bottom"
                                            sideOffset={6}
                                            className="w-40 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg p-1.5 flex flex-col gap-1 z-50"
                                        >
                                            {roles.map((r) => (
                                                <DropdownMenuItem
                                                    key={r}
                                                    onClick={() => {handleRoleChange(r)}}
                                                    className={`cursor-pointer capitalize text-sm rounded-md gap-2 px-3 py-2 transition-colors flex items-center justify-between ${
                                                        x.role === r
                                                            ? "bg-zinc-800 text-purple-400 font-semibold ring-1 ring-purple-500"
                                                            : "text-zinc-200 hover:bg-zinc-800 focus:bg-zinc-800"
                                                    }`}
                                                >
                                                    <span>
                                                        {r}
                                                    </span>
                                                    {x.role === r && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                        )}
                                </DropdownMenu>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}