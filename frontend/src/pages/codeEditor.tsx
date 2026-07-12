import { Navbar } from "@/components/custom/navbar";
import SandBox from "@/components/custom/sandBox";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom"
import hljs from "highlight.js"

export default function CodeEditor() {
    let {link} = useParams();
    const editorRef = useRef<{ getValue: () => string }>(null);
    const [code, setCode] = useState("");
    const [language, setLanuage] = useState("");
    const [output, setOutput] = useState("");
    console.log("THis is is link", link)
    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
            <Navbar
                language={language}
                setLanguage={(language) => setLanuage(language ?? "")}
            />
            <div className="flex-1 min-h-0">
                <SandBox code={code} language={language} onChange={(val?: string) => setCode(val ?? "")} />
            </div>
        </div>
    )
}