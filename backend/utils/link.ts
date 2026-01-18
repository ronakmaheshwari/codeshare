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
}

export default linkGenerator;