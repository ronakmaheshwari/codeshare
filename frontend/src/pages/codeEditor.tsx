import { Navbar } from "@/components/custom/navbar";
import SandBox from "@/components/custom/sandBox";
import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom"
import hljs from "highlight.js"

export default function CodeEditor() {
    let {link} = useParams();
    const editorRef = useRef<{ getValue: () => string }>(null);
    const [code, setCode] = useState("");
    const [language, setLanuage] = useState("");
    const [output, setOutput] = useState("");

    const highlighted = useMemo(() => {
        return hljs.highlight(output, { language: language || "plaintext" }).value;
    }, [output, language]);

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
            <Navbar
                language={language}
                setLanguage={(language) => setLanuage(language ?? "")}
                code={code}
            />
            <div className="flex-1 min-h-0">
                <SandBox ref={editorRef} code={code} language={language} onChange={(val?: string) => setCode(val ?? "")} />
            </div>
        </div>
    )
}