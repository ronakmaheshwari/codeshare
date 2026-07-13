import dotenv from "dotenv"
import { createClient } from "redis";

dotenv.config();

export const redis = createClient({
    url: process.env.REDIS_URL  ?? "redis://localhost:6379",
})

export const sub = redis.duplicate();

redis.on("error", (err) => {
    return console.log(`Redis publishe error: ${err}`);
})

sub.on("error", (err) => {
    return console.log(`Redis subscriber error: ${err}`);
})

export async function redisClient() {
    if(!redis.isOpen) {
        await redis.connect();
    }
    if(!sub.isOpen) {
        await sub.connect();
    }
    
    console.log("Redis pub/sub clients connected");
}