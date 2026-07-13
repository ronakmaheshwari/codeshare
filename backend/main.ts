import express, {type Express} from "express"
import morgan from "morgan"
import cors from "cors"
import dotenv from "dotenv"
import router from "./routes/router";
// import "./websockets";

dotenv.config();
export const app: Express = express()
export const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

app.use("/api/v1", router);

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})