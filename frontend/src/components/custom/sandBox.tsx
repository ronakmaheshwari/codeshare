import { forwardRef, useImperativeHandle, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { Spinner } from "../ui/spinner";

const SandBox = forwardRef(function CodeEditor(
  {
    code,
    onChange,
    language,
  }: {
    code: string;
    onChange: (value: string | undefined) => void;
    language?: string;
  },
  ref: React.Ref<{ getValue: () => string }>
) {
  

  const editorRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.getValue() ?? "",
  }));

  const defineThemes = (monaco: any) => {
    monaco.editor.defineTheme("shades-of-purple", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "d0c9ff" },
        { token: "comment", foreground: "b362ff", fontStyle: "italic" },
        { token: "keyword", foreground: "ff9d00" },
        { token: "number", foreground: "f78c6c" },
        { token: "string", foreground: "ecc48d" },
        { token: "variable", foreground: "c792ea" },
        { token: "type.identifier", foreground: "addb67" },
        { token: "function", foreground: "82aaff" },
        { token: "class", foreground: "ffcb6b" },
      ],
      colors: {
        "editor.background": "#1a1640",         
        "editor.foreground": "#d0c9ff",         
        "editorCursor.foreground": "#ffcc00",
        "editor.lineHighlightBackground": "#2e2a6a", 
        "editorLineNumber.foreground": "#6f6bbf",    
        "editor.selectionBackground": "#553377aa",  
        "editor.inactiveSelectionBackground": "#55337755",
      },
    });

    monaco.editor.defineTheme("ronak-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "", foreground: "1e1e1e" },
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "keyword", foreground: "af00db" },
        { token: "number", foreground: "098658" },
        { token: "string", foreground: "a31515" },
        { token: "variable", foreground: "001080" },
        { token: "type.identifier", foreground: "267f99" },
        { token: "function", foreground: "795e26" },
        { token: "class", foreground: "267f99" },
      ],
      colors: {
        "editor.background": "#fefefe",
        "editor.foreground": "#1e1e1e",
        "editorCursor.foreground": "#000000",
        "editor.lineHighlightBackground": "#f3f3f3",
        "editorLineNumber.foreground": "#999999",
        "editor.selectionBackground": "#cce2ff",
        "editor.inactiveSelectionBackground": "#e5f1fb",
      },
    });

    monaco.editor.defineTheme("noctis-light", {
        base: "vs",
        inherit: true,
        rules: [
          { token: "", foreground: "1e1e1e" },
          { token: "comment", foreground: "7c8590", fontStyle: "italic" },
          { token: "keyword", foreground: "0066cc", fontStyle: "bold" },
          { token: "number", foreground: "1c6b48" },
          { token: "string", foreground: "0088aa" },
          { token: "variable", foreground: "003366" },
          { token: "type.identifier", foreground: "336699" },
          { token: "function", foreground: "005f87" },
          { token: "class", foreground: "0f4c81" },
          { token: "constant", foreground: "b362ff" },
          { token: "delimiter", foreground: "4d4d4d" },
        ],
        colors: {
          "editor.background": "#f5fbff",
          "editor.foreground": "#1e1e1e",
          "editorCursor.foreground": "#2a2a2a",
          "editor.lineHighlightBackground": "#e8f4ff",
          "editorLineNumber.foreground": "#94a3b8",
          "editor.selectionBackground": "#cce9ff",
          "editor.inactiveSelectionBackground": "#ddeeff",
          "editorIndentGuide.background": "#d4dce2",
          "editorIndentGuide.activeBackground": "#a5b4fc",
          "editorWidget.background": "#ffffff",
          "editorWidget.border": "#d1d5db",
          "editorSuggestWidget.background": "#ffffff",
          "editorSuggestWidget.border": "#e5e7eb",
          "editorSuggestWidget.selectedBackground": "#cce2ff",
        },
      });


    monaco.editor.defineTheme("night-owl", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "d6deeb" },
        { token: "comment", foreground: "5f7e97", fontStyle: "italic" },
        { token: "keyword", foreground: "c792ea" },
        { token: "number", foreground: "f78c6c" },
        { token: "string", foreground: "ecc48d" },
        { token: "variable", foreground: "addb67" },
        { token: "type.identifier", foreground: "82aaff" },
        { token: "function", foreground: "82aaff" },
        { token: "class", foreground: "ffcb6b" },
        { token: "constant", foreground: "ff5874" },
      ],
      colors: {
        "editor.background": "#011627",
        "editor.foreground": "#d6deeb",
        "editorLineNumber.foreground": "#5c6773",
        "editorCursor.foreground": "#80a4c2",
        "editor.selectionBackground": "#1b90dd50",
        "editor.inactiveSelectionBackground": "#1b90dd30",
        "editor.lineHighlightBackground": "#1d3b5333",
        "editorIndentGuide.background": "#3a455680",
        "editorIndentGuide.activeBackground": "#7e57c280",
        "editorWhitespace.foreground": "#3B4360",
      },
    });
  };

  return (
    <div className="flex-1 h-full w-full rounded-sm overflow-hidden">
      <Editor
        width="100%"
        height="100%"
        language={language ?? "Plain Text"}
        value={code}
        theme={"shades-of-purple"}
        onChange={onChange}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          defineThemes(monaco);
          monaco.editor.setTheme("shades-of-purple");
          editor.focus();
        }}
        options={{
          fontSize: 16,
          minimap: { enabled: true },
          wordWrap: "on",
          scrollBeyondLastLine: true,
          automaticLayout: true,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
        }}
        loading={<Spinner />}
      />
    </div>
  );
});

export default SandBox;