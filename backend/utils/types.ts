import z, { email } from "zod"

export const signupValidation = z.object({
    name: z.string({error: "Username must be String"}).min(3,{error:"Username must have more than three letters"}).max(20,{error:"Username should not be more than 20 letters"}),
    email: z.email(),
    password: z.string({error: "Password must be alphanumeric"}).min(5,{error:"Password must be 5 letters long"}).max(32,{error:"Password must be less than 32 letters"})
}) 

export const loginValidation = z.object({
    email: z.email(),
    password: z.string({error: "Password must be alphanumeric"}).min(5,{error:"Password must be 5 letters long"}).max(32,{error:"Password must be less than 32 letters"})
})

export const roomValidation = z.object({
    title: z.string({error:"Title must be a string"}).min(3,{error:"Title must have atleast 3 letters"}).max(20,{error:"Title must have less than 20 letters"}),
    language: z.string().optional(),
    content: z.string().optional()
})

export const messageValidation = z.object({
    link: z.string(),
    content: z.string()
})

export type signupType = z.infer<typeof signupValidation>
export type loginType = z.infer<typeof loginValidation>
export type roomType = z.infer<typeof roomValidation>
export type messageType = z.infer<typeof messageValidation>