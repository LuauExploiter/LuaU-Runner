import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-lua";
import "prismjs/themes/prism-dark.css"; // Basic dark theme as fallback

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function CodeEditor({ value, onChange, disabled }: CodeEditorProps) {
  return (
    <div className="relative font-mono text-sm h-full w-full bg-[#0d1117] rounded-lg border border-border overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all duration-200">
      <div className="absolute top-0 left-0 right-0 h-8 bg-[#161b22] border-b border-border flex items-center px-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
        <span className="ml-4 text-xs text-muted-foreground">main.lua</span>
      </div>
      
      <div className="pt-10 pb-4 px-1 h-full overflow-auto custom-scrollbar">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={(code) => highlight(code, languages.lua, "lua")}
          padding={16}
          disabled={disabled}
          className="font-mono min-h-full"
          textareaClassName="focus:outline-none"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            minHeight: "100%",
          }}
        />
      </div>
    </div>
  );
}
