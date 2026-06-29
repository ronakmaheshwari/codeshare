import dotenv from "dotenv"
import express from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { URL } from "url"
import ws, { WebSocket, WebSocketServer } from "ws"
import db from "./utils/db"
import type { Prisma } from "@prisma/client"

dotenv.config()
const app = express()
const port = process.env.WS_PORT || "3001";
const server = app.listen(port, () => {
    console.log(`Websocket server is running on ${port}`);
});

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("JWT secret is missing")
}

interface AuthSocket extends WebSocket {
    userId?: string,
    roomId?: string,
}

interface PayloadType {
    type: "UPDATE_CONTENT";
    content: string;
}

const wss = new WebSocketServer({server});
const roomClients = new Map<string, Set<AuthSocket>>();

const sendError = (socket: WebSocket, message: string) => {
    if(socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            message: message,
            error: "ERROR",
        }))
    }
    socket.close();
}

wss.on('connection', async(socket, req) => {
    const authSocket = socket as AuthSocket;
    const parseURL = new URL(req.url!, `ws://localhost:${port}`);
    const token = parseURL.searchParams.get("token");
    const link = parseURL.searchParams.get("link");

    if(!token || !link) {
        sendError(socket, "No Link or Token was provided")
        return;
    }

    let decoded: JwtPayload & {userId: string};
    try {
        decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload & { userId: string };
    } catch (error) {
        sendError(authSocket, "Invalid or expired token");
        return;
    }

    if(!decoded.userId) {
        sendError(authSocket, "Token missing userId");
        return;
    }

    authSocket.userId = decoded.userId;

    const findLink = await db.room.findUnique({
        where: {
            link: link
        },
        include: {
            participants: true,
        }
    })

    if(!findLink) {
        sendError(socket, "Invalid Link was provided");
        return;
    }

    const addParticipant = findLink.participants.some((x) => {
        x.userId === authSocket.userId;
    })

    if(!addParticipant) {
        await db.participant.create({
            data: {
                userId: authSocket.userId,
                roomId: findLink.id,
                role: "viewer"
            }
        })
    };

    authSocket.roomId = findLink.id;
    if(!roomClients.has(findLink.id)) {
        roomClients.set(findLink.id, new Set());
    }
    roomClients.get(findLink.id)!.add(authSocket);

    socket.on('message', async (raw) => {
        let payload: PayloadType;
        try {
            payload = JSON.parse(raw.toString());
        } catch (error) {
            return;
        }

        if (payload.type !== "UPDATE_CONTENT" || typeof payload.content !== "string") {
            return;
        }

        const participant = await db.participant.findUnique({
            where: {
                userId_roomId: {
                    userId: authSocket.userId as string,
                    roomId: findLink.id
                }
            }
        });

        if (!participant || participant.role === "viewer") {
            sendError(authSocket, "You are a viewer and cannot edit");
            return;
        }

        const updated = await db.$transaction(async (tx: Prisma.TransactionClient) => {
            const room = await tx.room.update({
                where: { id: findLink.id },
                data: { content: payload.content }
            });

            await tx.codeArchive.create({
                data: {
                    userId: authSocket.userId,
                    roomId: findLink.id,
                    content: payload.content,
                    language: "plaintext"
                }
            });

            return room;
        });

        const clients = roomClients.get(findLink.id);
        if(clients) {
            for (const client of clients) {
                if (client !== authSocket && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ content: updated.content }));
                }
            }
        }
    });

    socket.on("close", () => {
        const clients = roomClients.get(findLink.id);
        if (clients) {
            clients.delete(authSocket);
            if (clients.size === 0) {
                roomClients.delete(findLink.id);
            }
        }
    });
}) 