import z, { email } from "zod"

export const signupType = z.object({
    name: z.string({error: "Username must be String"}).min(3,{error:"Username must have more than three letters"}).max(20,{error:"Username should not be more than 20 letters"}),
    email: z.email(),
    password: z.string({error: "Password must be alphanumeric"}).min(5,{error:"Password must be 5 letters long"}).max(32,{error:"Password must be less than 32 letters"})
}) 

export const loginType = z.object({
    email: z.email(),
    password: z.string({error: "Password must be alphanumeric"}).min(5,{error:"Password must be 5 letters long"}).max(32,{error:"Password must be less than 32 letters"})
})