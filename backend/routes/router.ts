import { Router } from "express";
import userRouter from "./user";
import roomRouter from "./rooms";
import dashboardRouter from "./dashboard";

interface RouterInterface {
    path: string,
    router: Router
}

const router: Router = Router();

const allRouters:RouterInterface[] = [
    {
        path:'/user',
        router: userRouter
    },
    {
        path:'/room',
        router: roomRouter
    },
    {
        path: "/dashboard",
        router: dashboardRouter
    },
]

allRouters.forEach((x) => {
    router.use(x.path,x.router);
})

export default router;