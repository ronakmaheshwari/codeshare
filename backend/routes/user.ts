import { Router, type Request, type Response } from "express";
import dotenv from "dotenv"

dotenv.config()
const salt: Number = Number(process.env.SALT_ROUND) || 10
if(!salt){
    throw new Error("SALT_ROUND environment variable is not set")
}

const userRouter: Router = Router();

userRouter.post("/signup",async (req:Request, res: Response) => {
    try {
        
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
        
    } catch (error) {
        console.log("[User Login]: Error took at ",error);
        return res.status(500).json({
            error: true,
            message: "Internal error took place"
        })
    }
})

export default userRouter;