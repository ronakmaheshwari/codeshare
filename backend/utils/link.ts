import db from "./db";

const linkGenerator = (length: number): string => {
    try {
        const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let link = "RON";

        let realLength;
        if(length < link.length){
            realLength = link.length - length
        }
        realLength = length - link.length;
        for(let i=0;i<realLength;i++){
            link += allLetters.charAt(Math.floor(Math.random()*allLetters.length));
        }
        return link;
    } catch (error) {
        console.log(`[Link Generator]: Error took place at ${error}`);
        return "Link couldn't be generated";
    }
};

export const Duplicate_links = async (link: string): Promise<boolean> => {
    try {
        const finder = await db.room.findUnique({
            where:{
                link
            }
        })
        if(finder){
            return true
        }

        return false
    } catch (error) {
        console.log("Error took place at duplicate link finder");
        return false
    }
};

export const otpGenerator = async (length: number): Promise<string> => {
    try {
        const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let otp = "";
        for(let i = 0; i < length; i++) {
            otp += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
        };
        return otp;
    } catch (error) {
        console.log(`[OTP Generator]: Error took place at ${error}`);
        return "OTP couldn't be generated";
    }
};

export default linkGenerator;