import { Router, type Request, type Response } from "express";
import dotenv from "dotenv"
import { userMiddleware } from "../middleware";
import db from "../utils/db";
import linkGenerator from "../utils/link";

dotenv.config();

const roomRouter: Router = Router();

roomRouter.post("/create", userMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.userId;
        if(!user){
            return res.status(400).json({
                error: true,
                message: "Unauthorized user tried to access the server"
            })
        }
        const link = linkGenerator(6);
        const createRoom = await db.room.create({
            data:{
                link: link,
                title: "Created a new Codeshare room",
                content: "Hello World!",
                language: "plaintext",
                ownerId: user
            },
            select:{
                link: true,
                title: true,
                language: true,
                owner:{
                    select:{
                        name: true
                    }
                }
            }
        })
        return res.status(200).json({
            error: false,
            message: `Room is successfully created for ${createRoom.owner.name}`,
            data:createRoom,
            link: createRoom.link
        })
    } catch (error) {
        console.log("[Create Room]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

roomRouter.get("/:link",userMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.userId;
        if(!user){
            return res.status(400).json({
                error: true,
                message: "Unauthorized user tried to access the server"
            })
        }
        const link = req.params.link as string;
        if(!link){
            return res.status(401).json({
                error: true,
                message: "No link was provided"
            })
        }
        
        const findLink = await db.room.findUnique({
            where:{
                link
            }
        })
        
        if(!findLink){
            return res.status(404).json({
                error: true,
                message: `Invalid link ${link} was provided`
            })
        }
        
        return res.status(200).json({
            error: false,
            message: "Details were successfully fetched for that room",
            data: findLink
        })
    } catch (error) {
        console.log("[GET Content]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

roomRouter.delete("/:link",userMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.userId;
        if (!user) {
            return res.status(401).json({
                error: true,
                message: "Unauthorized user tried to access the service",
            });
        }
        const link = req.params.link as string;
        if(!link){
            return res.status(401).json({
                error: true,
                message: "No link was provided"
            })
        }
        const findLink = await db.room.findUnique({
            where:{
                link
            }
        })
        if(!findLink){
            return res.status(404).json({
                error: true,
                message: `Invalid link ${link} was provided`
            })
        }
        if(findLink.ownerId !== user){
            return res.status(401).json({
                error: true,
                message: "You are not the owner of this room"
            })
        }
        const deleteRoom = await db.room.update({
            where:{
                link
            },
            data:{
                isDeleted: true
            }
        })
        return res.status(200).json({
            error: false,
            message: `${link} and the room is successfully deleted from the server`
        })
    } catch (error) {
        console.error("[Room Upgrade Error]", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
})

roomRouter.get("/download/:link", userMiddleware,async (req: Request, res: Response) => {
    try {
        const user = req.userId;
        if(!user){
            return res.status(400).json({
                error: true,
                message: "Unauthorized user tried to access the server"
            })
        }
        const link = req.params.link as string;
        if(!link){
            return res.status(401).json({
                error: true,
                message: "No link was provided"
            })
        }

        const findLink = await db.room.findUnique({
            where:{
                link
            },
            select:{
                content: true,
                participants:{
                    select:{
                        userId: true
                    }
                }
            }
        })

        if(!findLink){
            return res.status(404).json({
                error: true,
                message: `Invalid link ${link} was provided`
            })
        }

        if (findLink.participants.length === 0) {
            return res.status(403).json({
            error: true,
            message: "You are not authorized to download this file",
            });
        }

        if(findLink.participants.some(participant => participant.userId === user)) {
            const filename = `${link}.md`
            res.setHeader("Content-Disposition",`attachment; filename="${filename}"`)
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            return res.status(200).send(findLink.content);
            // return res.status(200).json({
            //     error: false,
            //     message: "File downloaded successfully",
            //     data: findLink.content
            // })
        } else {
            return res.status(403).json({
                error: true,
                message: "You are not authorized to download this file"
            })
        }
    } catch (error) {
        console.log("[DOWNLOAD Content]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

roomRouter.get("/participants/:link", userMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.userId;
        if(!user){
            return res.status(400).json({
                error: true,
                message: "Unauthorized user tried to access the server"
            })
        }
        const link = req.params.link;
        const findLink = await db.room.findUnique({
            where:{
                link: link as string
            }
        })
        
        if(!findLink){
            return res.status(404).json({
                error: true,
                message: `Invalid link ${link} was provided`
            })
        }

        const [count, users] = await Promise.all([
            await db.participant.count({
                where:{
                    room:{
                        link: link as string
                    }
                }
            }),
            await db.participant.findMany({
                where:{
                    room:{
                        link: link as string
                    }
                },
                select:{
                    id: true,
                    user:{
                        select:{
                            name: true,
                            email: true
                        }
                    },
                    role: true,
                    joinedAt: true
                }
            })
        ])
        return res.status(200).json({
            error: false,
            message: "Room details were fetched successfully!",
            data: users,
            count: count
        })
    } catch (error) {
        console.log("[Create Room]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

roomRouter.post("/role/:link", userMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          error: true,
          message: "Unauthorized user tried to access the service",
        });
      }

      const link = req.params.link;
      const {updatedUser,role} = req.body;

      const room = await db.room.findUnique({
        where: { link: link as string },
        include: {
          participants: {
            where: { userId },
            select: { role: true },
          },
        },
      });

      if (!room) {
        return res.status(404).json({
          error: true,
          message: "Room not found",
        });
      }

      if (room.ownerId === userId) {
        return res.status(200).json({
          success: true,
          mode: "editor",
        });
      }

      const participant = room.participants[0];

      if (!participant) {
        return res.status(403).json({
          error: true,
          message: "You are not a participant of this room",
        });
      }

      if (participant.role !== "editor") {
        return res.status(403).json({
          error: true,
          message: "You do not have permission to edit this room",
        });
      }

      const findUser = await db.participant.findUnique({
        where:{
            userId_roomId:{
                userId: updatedUser,
                roomId: room.id
            }
        }
      })

      if(!findUser){
        return res.status(403).json({
          error: true,
          message: "The given user is not part of room",
        });
      }

      const updateRole = await db.participant.update({
        where:{
            userId_roomId:{
                userId: updatedUser,
                roomId: room.id
            }
        },
        data:{
            userId: updatedUser,
            role
        },
        select:{
            user: {
                select:{
                    name: true
                }
            },
            role: true
        }
      })

      return res.status(200).json({
        error: false,
        message: `User: ${updateRole.user.name} has the role ${updateRole.role} updated`
      });
    } catch (error) {
      console.error("[Room Mode Error]", error);
      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
  }
);

roomRouter.patch("/upgrade/:link", userMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.userId;
        const link = req.params.link as string;
        if(!link){
            return res.status(401).json({
                error: true,
                message: "No link was provided"
            })
        }
        const {mode} = req.body;

        const room = await db.room.findUnique({
            where: { link: link as string },
            include: {
            participants: {
                where: { userId: user },
                select: { role: true },
            },
            },
        });
        if(!room){
            return res.status(404).json({
                error: true,
                message: "Invalid link was provided"
            })
        }

        if(room.ownerId !== user){
            return res.status(400).json({
                error: true,
                message: "You are not an owner of this room"
            })
        }

        const participant = room.participants[0];

        if (!participant) {
            return res.status(403).json({
            error: true,
            message: "You are not a participant of this room",
            });
        }

        if (participant.role !== "editor") {
            return res.status(403).json({
            error: true,
            message: "You do not have permission to edit this room",
            });
        }
        let moding: boolean;
        
        if(mode === true){
            moding = true
        }else{
            moding = false
        }

        const updateRoom = await db.room.update({
            where:{
                link
            },
            data:{
                isEditable: moding
            }
        })
        return res.status(200).json({
            error: false,
            message:`The room was upgraded to ${mode === true ? "Edit" : "View"} mode`
        })
    } catch (error) {
      console.error("[Room Upgrade Error]", error);
      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
})

export default roomRouter;