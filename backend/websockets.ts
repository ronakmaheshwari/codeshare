import ws, { WebSocket, WebSocketServer } from "ws"
import express from "express"
import dotenv from "dotenv"
import jwt, { type JwtPayload } from "jsonwebtoken"
import db from "./utils/db";

dotenv.config();
const app = express();
const port = process.env.WS || 3001
const server = app.listen(port,()=>{
    console.log(`WS Server running on ${port}`)
})

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT secret is missing")
}

interface Authsocket extends WebSocket {
    userId: string,
    role?: string
}

const wss = new WebSocketServer({server: server});

const sendError = async (socket: WebSocket, message?:string) => {
    socket.send(
        JSON.stringify({
            error: "ERROR",
            data: message ? message : "Internal Error occured"
        })
    )
}

wss.on("connection",async (ws, req)=>{
    const url = require('url');
    const parsedUrl = url.parse(req.url, true);
    const token = parsedUrl.query.token as string;
    const link = parsedUrl.query.link as string;
    
    if(!token || !link){
        sendError(ws,"Unauthorized user tried to access the serviece")
    }

    const decoded = jwt.verify(token,JWT_SECRET) as unknown as JwtPayload & {
        userId: string,
        role?: string
    } ;

    if(!decoded.userId){
        sendError(ws,"Unauthorized user tried to access the serviece");
    }
    
    const user = ws as Authsocket
    user.userId = decoded.userId;
    user.role = decoded.role;

    const findLink = await db.room.findUnique({
        where:{
            link
        },
        include:{
            participants: true
        }
    })

    if(!findLink){
        sendError(ws,"Invalid link was provided")
        return
    }
    const participant = findLink.participants.some((x)=>{
        return x.userId === user.userId
    })

    if(!participant){
       await db.participant.create({
        data:{
            userId: user.userId,
            roomId: findLink.id,
            role: "viewer"
        }
       })
    }

    ws.on("message",async (raw) => {
        
    })

})