import { useState, useRef, useEffect } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { Console } from "@/components/Console";
import { Play, Download, Upload, Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// We'll use a dynamic import for the Luau module to avoid SSR issues
// and ensure it's only loaded on the client side.
let LuauRuntime: any = null;

const DEFAULT_CODE = `print("Hello World")`;

export default function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isRuntimeLoaded, setIsRuntimeLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadRuntime = async () => {
      try {
        // @ts-ignore
        const Luau = (await import("@/lib/luau.js")).default;
        LuauRuntime = await Luau({
          print: (text: string) => {
            setOutput(prev => (prev ? prev + "\n" + text : text));
          },
          printErr: (text: string) => {
            setError(prev => (prev ? prev + "\n" + text : text));
          }
        });
        setIsRuntimeLoaded(true);
      } catch (err) {
        console.error("Failed to load Luau runtime:", err);
        setError("Failed to load Luau runtime. Check console for details.");
      }
    };
    loadRuntime();
  }, []);

  const handleRun = async () => {
    if (!isRuntimeLoaded) {
      toast({
        title: "Please wait",
        description: "Luau runtime is still loading...",
        variant: "destructive",
      });
      return;
    }

    setOutput(null);
    setError(null);
    setIsPending(true);
    
    // Slight delay to allow UI to update
    setTimeout(() => {
      try {
        LuauRuntime.run(code);
        toast({
          title: "Success",
          description: "Code executed successfully.",
        });
      } catch (err: any) {
        setError(err.message || "An error occurred during execution");
        toast({
          title: "Execution Error",
          description: "See console for details",
          variant: "destructive",
        });
      } finally {
        setIsPending(false);
      }
    }, 50);
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
            title: "File Loaded",
            description: file.name,
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
    
    // More robust copy method
    const copyToClipboard = async (text: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (e) {
        console.warn("Clipboard API failed, using fallback", e);
      }

      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      let successful = false;
      try {
        successful = document.execCommand('copy');
      } catch (err) {
        console.error('execCommand copy failed', err);
      }
      document.body.removeChild(textArea);
      return successful;
    };

    copyToClipboard(output).then((success) => {
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copied",
          description: "Output copied to clipboard",
        });
      } else {
        toast({
          title: "Copy Failed",
          description: "Unable to copy to clipboard",
          variant: "destructive",
        });
      }
    });
  };

  const handleClearInput = () => {
    setCode("");
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card z-10">
        <h1 className="font-bold text-md tracking-tight">
          LuaU <span className="text-primary">Runner</span>
        </h1>

        <Button
          onClick={handleRun}
          disabled={isPending || !isRuntimeLoaded}
          size="sm"
          className="h-8 gap-2"
        >
          {isPending ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-3 h-3 fill-current" />
          )}
          <span>Run</span>
        </Button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-border">
          <div className="flex items-center justify-between px-3 py-1.5 bg-muted/20 border-b border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Editor</span>
            <div className="flex gap-1">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".lua,.luau,.txt" />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleClearInput}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <CodeEditor value={code} onChange={setCode} disabled={isPending} />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-black">
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Console</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-100" disabled={!output} onClick={handleCopyOutput}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-100" disabled={!output} onClick={handleDownloadOutput}>
                <Download className="w-3.5 h-3.5" />
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
