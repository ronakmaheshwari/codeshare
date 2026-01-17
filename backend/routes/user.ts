import { Router, type Request, type Response } from "express";
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dayjs from "dayjs";
import { loginValidation, resetPasswordValidation, resetValidation, signupValidation } from "../utils/types";
import db from "../utils/db";
import { loginLimiter, resetLimiter } from "../utils/limiter";
import { userMiddleware } from "../middleware";

dotenv.config()
const salt: Number = Number(process.env.SALT_ROUND) || 10
if(!salt){
    throw new Error("SALT_ROUND environment variable is not set")
}
const JwtSecret = process.env.JWT_SECRET;
if(!JwtSecret){
    throw new Error("No JWT Secret was provided");
}

const userRouter: Router = Router();

userRouter.post("/signup",async (req:Request, res: Response) => {
    try {
        const parsed = signupValidation.safeParse(req.body);
        if(!parsed.success){
            const error = parsed.error.format();
            return res.status(401).json({
                error: true,
                message: "Invalid data format was provided",
                data: error
            })
        }
        const {name,email,password} = parsed.data;
        const findUser = db.user.findUnique({
            where:{
                email: email
            }
        })
        if(!findUser){
            return res.status(409).json({
                error: true,
                message: `${email} already exists with our platform`
            })
        }
        const hashed = await bcrypt.hash(password,Number(salt));
        const createUser = await db.user.create({
            data:{
                name,
                email,
                password: hashed
            }
        })
        const token = jwt.sign({userId: createUser.id},JwtSecret);
        return res.status(200).json({
            error: false,
            message: `${createUser.name} was successfully created`,
            token: token
        })
    } catch (error) {
        console.log("[User Signup]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

userRouter.post("/login",loginLimiter,async (req:Request, res: Response) => {
    try {
        const parsed = loginValidation.safeParse(req.body);
        if(!parsed.success){
            return res.status(401).json({
                error: true,
                message:"Invalid data format was provided",
                data: parsed.error.format()
            })
        }
        const {email,password} = parsed.data;
        const findEmail = await db.user.findUnique({
            where:{
                email
            }
        })
        if(!findEmail){
            return res.status(404).json({
                error: true,
                message: `${email} is not registered with our services`
            })
        }
        const passwordCheck = await bcrypt.compare(password,findEmail.password);
        if(!passwordCheck){
            return res.status(401).json({
                error: true,
                message: "Invalid password was provided"
            })
        }
        const token = jwt.sign({userId: findEmail.id}, JwtSecret);
        return res.status(200).json({
            error: false,
            message: `${findEmail.name} logged in successfully!`,
            token: token
        })
    } catch (error) {
        console.log("[User Login]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

userRouter.post("/forget-password", resetLimiter, async (req: Request, res: Response) => {
    try {
        const parsed = resetValidation.safeParse(req.body);
        if(!parsed.success){
            const error = parsed.error.format();
            return res.status(401).json({
                error: true,
                message: "Invalid data format was provided",
                data: error
            })
        }
        const {email,password} = parsed.data;
        
        const findEmail = await db.user.findUnique({
            where:{
                email
            }
        })

        if(!findEmail){
            return res.status(404).json({
                error: true,
                message: "No email was registered with our services"
            })
        }
        const hashed = await bcrypt.hash(password,Number(salt));
        const updatePassword = await db.user.update({
            where:{
                email
            },
            data:{
                password: hashed
            }
        })
        return res.status(200).json({
            error: false,
            message: `${findEmail.email} password change request wad successfully handled`,
        })
    } catch (error) {
        console.log("[User Forget Password]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

userRouter.get("/user", userMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.userId;
        if(!user){
            return res.status(400).json({
                error: true,
                message:"Unauthorized user tried to access the service"
            })
        }
        const [findUser,roomCount] = await Promise.all([
            await db.user.findUnique({
                where:{
                    id: user
                },
                select:{
                    name: true,
                    email: true,
                    createdAt: true,
                    roomsOwned:{
                        select:{
                            id: true,
                            title: true,
                            link: true,
                            language: true,
                            createdAt: true
                        },
                    },
                }
            }),
            await db.room.count({
                where:{
                    ownerId: user
                }
            })
        ])

        if (!findUser) {
            return res.status(404).json({
                error: true,
                message: "User not found",
            });
        }

        return res.status(200).json({
            error: false,
            message: "User details fetched successfully",
            data: {
                name: findUser.name,
                email: findUser.email,
                createdAt: dayjs(findUser.createdAt).format("DD MMM YYY, hh:mm A"),
                rooms: findUser.roomsOwned.map((x)=>{
                    id: x.id
                    title: x.title
                    link: x.link
                    language: x.language
                    createdAt: dayjs(x.createdAt).format("DD MMM YYYY, hh:mm A")
                })
            },
            count: roomCount
        })
    } catch (error) {
        console.log("[User Details]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

userRouter.post("/reset-password",resetLimiter,async (req: Request, res: Response) => {
    try {
        const user = req.userId;
        if(!user){
            return res.status(400).json({
                error: true,
                message:"Unauthorized user tried to access the service"
            })
        }

        const parsed = resetPasswordValidation.safeParse(req.body);
        if(!parsed.success){
            const error = parsed.error.format();
            return res.status(401).json({
                error: true,
                message: "Invalid data format was provided",
                data: error
            })
        }
        const {password, newpassword} = parsed.data;

        const findUser = await db.user.findUnique({
            where:{
                id: user
            }
        })
        if(!findUser){
            return res.status(404).json({
                error: true,
                message: "User not found",
            });
        }
        const checkPassword = await bcrypt.compare(password, findUser.password);
        if(!checkPassword){
            return res.status(400).json({
                error: true,
                message: "Invalid password was provided"
            })
        }
        const hashed = await bcrypt.hash(newpassword,Number(salt));
        const updatePassword = await db.user.update({
            where: {
                id: user,
                email: findUser.email
            },
            data:{
                password: hashed
            }
        })
        return res.status(200).json({
            error: false,
            message: `${findUser.email} has its password updated successfully`
        })
    } catch (error) {
        console.log("[User Reset]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

export default userRouter;