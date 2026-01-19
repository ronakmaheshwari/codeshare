import {createClient} from "redis"

export const redis = createClient({
    url: process.env.REDIS || "redis://redis:6379"
})

export const sub = redis.duplicate();

(async () =>{
    await redis.connect();
    await sub.connect();
})
