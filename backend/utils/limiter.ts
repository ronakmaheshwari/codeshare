import ratelimiter from "express-rate-limit"

export const loginLimiter = ratelimiter({
    windowMs: 5*60*1000,
    limit: 3,
    message: "Too many requests, please try again later in 5 minutes",
    standardHeaders: true,
    legacyHeaders: false
})

export const resetLimiter = ratelimiter({
    windowMs: 5*60*1000,
    limit: 3,
    message: "Too many requests, please try again later in 5 minutes",
    standardHeaders: true,
    legacyHeaders: false
})