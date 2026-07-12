import { Navbar } from "@/components/custom/navbar";
import SandBox from "@/components/custom/sandBox";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import hljs from "highlight.js"
import api, { getConfig } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { config } from "node:process";
import { queryClient } from "@/App";

interface participantInterface {
    id: string,
    userId: string,
    roomId: string,
    role: string,
    joinedAt: string,
}

interface getDataInterface {
    id: string,
    link: string,
    title: string,
    language: string,
    content: string,
    isEditable: boolean,
    isPublic: boolean,
    isDeleted: boolean,
    createdAt: string,
    updatedAt: string,
    ownerId: string,
    participants: participantInterface[],
}

export default function CodeEditor() {
    let {link} = useParams();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const editorRef = useRef<{ getValue: () => string }>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);
    const [room, setRoom] = useState<getDataInterface | null>(null);
    const [code, setCode] = useState("");
    const [language, setLanuage] = useState("");

    if(!link) {
        navigate("/");
    }

    useQuery({
        queryKey: ["room", link],
        queryFn: async () => {
            try {
                const result = await api.get(`/room/${link}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setRoom(result.data.data);
                setCode(result.data.data.content ?? "");
                queryClient.invalidateQueries({queryKey: ['user', link]});
            } catch (error: any) {
                toast.error(error?.response?.data?.message ?? "Failed to load room");
            } finally {
                setLoading(false);
            }
        }
    });

    useQuery({
        queryKey: ["websocket", link],
        queryFn: () => {
            if(!link || !token) {
                return;
            }

            let ws: WebSocket;
            let cancelled = false;

            getConfig().then((config) => {
                if(cancelled) return;
                ws = new WebSocket(`${config.websocketUrl}?token=${token}&link=${link}`);

                ws.onopen = () => {
                    toast.success(`Welcome to Code Share!`)
                }

                ws.onmessage = (e) => {
                    try {
                        const data = JSON.parse(e.data);
                        if(data.error) {
                            toast.error(data.message);
                            return;
                        }
                        if(typeof data.content === "string") {
                            setCode(data.content);
                        }
                    } catch (error) {
                        console.error("Failed to parse WS message:", error);
                    }
                };

                ws.onerror = (err) => {
                    console.error("WebSocket error:", err);
                };

                ws.onclose = () => {
                    console.log("WebSocket disconnected");
                };

                setSocket(ws);
            });

            return () => {
                cancelled = true;
                ws?.close();
            };
        }
    });

    const handleCodeChange = (value: string | undefined) => {
        const nextValue = value ?? "";
        setCode(nextValue);

        if(socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "UPDATE_CONTENT",
                content: nextValue
            }))
        }
    }
    

    const highlighted = useMemo(() => {
        return hljs.highlight(code, { language: language || "plaintext" }).value;
    }, [code, language]);

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
            <Navbar
                language={language}
                setLanguage={(language) => setLanuage(language ?? "")}
                code={code}
                link={link}
            />
            <div className="flex-1 min-h-0">
                <SandBox ref={editorRef} code={code} language={language} onChange={handleCodeChange} />
            </div>
        </div>
    )
}