import ratelimiter from "express-rate-limit"

const loginLimiter = ratelimiter({
    windowMs: 5*60*1000,
    limit: 3,
    max: 3,
    message: "Too many requests, please try again later in 5 minutes",
    standardHeaders: true,
    legacyHeaders: false
})