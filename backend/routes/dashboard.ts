import dotenv from "dotenv"
import { Router, type Request, type Response } from "express";
import { userMiddleware } from "../middleware";
import db from "../utils/db";

dotenv.config();

const dashboardRouter: Router = Router();

dashboardRouter.get("/rooms", userMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.userId;
        if(!user) {
            return res.status(401).json({
                error: true,
                message: "No UserID was given",
            })
        };

        const [getAllRooms, roomCount, roomsOwned] = await Promise.all([
            await db.room.findMany({
                where: {
                    participants: {
                        some: {
                            userId: user
                        }
                    },
                    isDeleted: false,
                },
                select: {
                    id: true,
                    link: true,
                    language: true,
                    title: true,
                    isPublic: true,
                    isEditable: true,
                    ownerId: true,
                    participants: {
                        select: {
                            role: true,
                        },
                    } 
                },
                orderBy: {
                    createdAt: "desc"
                }
            }),
            await db.room.count({
                where: {
                    participants: {
                        some: {
                            userId: user
                        }
                    },
                    isDeleted: false,
                },
            }),
            await db.room.count({
                where: {
                    ownerId: user,
                    isDeleted: false,
                }
            })
        ])

        return res.status(200).json({
            error: false,
            message: "All the room details were successfully fetched",
            data: getAllRooms,
            participatedRooms: roomCount,
            roomsOwned: roomsOwned
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal error occured"
        })
    }
})

export default dashboardRouter;