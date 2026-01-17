import { Router, type Request, type Response } from "express";
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { loginValidation, signupValidation } from "../utils/types";
import db from "../utils/db";

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

userRouter.post("/login",async (req:Request, res: Response) => {
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
    } catch (error) {
        console.log("[User Login]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

export default userRouter;