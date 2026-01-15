import express, {type Express} from "express"
import morgan from "morgan"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config();
export const app: Express = express()
export const port = process.env.PORT || 3000;

app.use(express.json())
app.use(cors())
app.use(morgan("dev"))

app.use("/api/v1",);