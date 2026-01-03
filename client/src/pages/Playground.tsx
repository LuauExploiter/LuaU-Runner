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
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Output copied to clipboard",
      });
    });
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
      <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-sans font-bold text-lg tracking-tight">
            LuaU <span className="text-primary">Runner</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRun}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Code</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workspace */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Editor Pane */}
          <div className="flex-1 h-[50vh] md:h-auto p-4 md:p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Editor (LuaU)</span>
              <div className="flex gap-2">
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
                  title="Upload File"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Clear Editor"
                  onClick={handleClearInput}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="flex-1 min-h-0 shadow-xl shadow-black/20 rounded-lg">
              <CodeEditor 
                value={code} 
                onChange={setCode} 
                disabled={isPending} 
              />
            </div>
          </div>

          {/* Console Pane */}
          <div className="flex-1 h-[50vh] md:h-auto p-4 md:p-6 md:pl-0 overflow-hidden flex flex-col border-t md:border-t-0 md:border-l border-border bg-muted/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Console</span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Copy Output"
                  disabled={!output}
                  onClick={handleCopyOutput}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Download Output"
                  disabled={!output}
                  onClick={handleDownloadOutput}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <Console output={output} error={error} isLoading={isPending} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
