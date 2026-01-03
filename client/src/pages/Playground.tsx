import { useState, useRef } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { Console } from "@/components/Console";
import { useRunLuau } from "@/hooks/use-luau";
import { Play, Sparkles, Download, Upload, Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Default code snippet
const DEFAULT_CODE = `print("Hello World")`;

export default function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: runLuau, isPending } = useRunLuau();
  const { toast } = useToast();

  const handleRun = () => {
    setOutput(null);
    setError(null);
    
    runLuau({ code }, {
      onSuccess: (data) => {
        setOutput(data.output);
        if (data.error) setError(data.error);
        toast({
          title: "Execution Complete",
          description: "Code ran successfully.",
          duration: 2000,
        });
      },
      onError: (err) => {
        setError(err.message);
        toast({
          title: "Execution Failed",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          setCode(text);
          toast({
            title: "File Uploaded",
            description: `Loaded ${file.name}`,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyOutput = () => {
    if (!output) return;
    
    // Fallback for clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(output).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copied",
          description: "Output copied to clipboard",
        });
      });
    } else {
      // Fallback: create temporary textarea
      const textArea = document.createElement("textarea");
      textArea.value = output;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copied",
          description: "Output copied to clipboard",
        });
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleClearInput = () => {
    setCode("");
    toast({
      title: "Cleared",
      description: "Editor cleared",
    });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card z-10">
        <div className="flex items-center gap-2">
          <h1 className="font-sans font-bold text-lg tracking-tight">
            LuaU <span className="text-primary">Runner</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRun}
            disabled={isPending}
            size="sm"
            className="gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>Run</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Pane */}
        <div className="flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-border">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Editor</span>
            <div className="flex gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".lua,.luau,.txt"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                title="Upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive"
                title="Clear"
                onClick={handleClearInput}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <CodeEditor 
              value={code} 
              onChange={setCode} 
              disabled={isPending} 
            />
          </div>
        </div>

        {/* Console Pane */}
        <div className="flex-1 flex flex-col min-h-0 bg-black">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Console</span>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                title="Copy"
                disabled={!output}
                onClick={handleCopyOutput}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                title="Download"
                disabled={!output}
                onClick={handleDownloadOutput}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <Console output={output} error={error} isLoading={isPending} />
          </div>
        </div>
      </div>
    </div>
  );
}
