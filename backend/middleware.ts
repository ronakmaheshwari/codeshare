import type { Role } from "@prisma/client";
import dotenv from "dotenv"
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"

dotenv.config()

const JwtSecret = process.env.JWT_SECRET;
if(!JwtSecret){
    throw new Error("No JWT Secret was provided");
}

declare global {
    namespace Express{
        interface Request {
            userId: string;
            role?: Role
        }
    }
}

export const userMiddleware = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                error: true,
                message:"Invalid Token was provided"
            })
        }
        const token = authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({
                error: true,
                message:"Invalid Token was provided"
            })
        }
        const verifiedToken = jwt.verify(token,JwtSecret) as unknown as JwtPayload & {
            userId: string;
            role?: string;
        };

        if(!verifiedToken.userId){
            return res.status(401).json({
                error: true,
                message:"Invalid Token was provided"
            })
        }
        
        if(verifiedToken.role){
            req.role = verifiedToken.role as Role;
        }

        req.userId = verifiedToken.userId
        next();
    } catch (error) {
        console.log(error);
        next(`[JWT ERROR took place]: ${error}`)
    }
}