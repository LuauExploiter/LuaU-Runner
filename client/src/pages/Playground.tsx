import { useState, useRef, useEffect } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { Console } from "@/components/Console";
import { Play, Download, Upload, Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
    let mounted = true;
    const loadRuntime = async () => {
      try {
        if (!mounted) return;
        
        // @ts-ignore
        if (typeof window.Luau === "undefined" && typeof window.createLuau === "undefined") {
          const response = await fetch("/luau.js");
          const scriptContent = await response.text();
          const script = document.createElement("script");
          script.text = scriptContent;
          document.head.appendChild(script);
        }

        const waitForFactory = (): Promise<any> => {
          return new Promise((resolve) => {
            const check = () => {
              // @ts-ignore
              const factory = window.Luau || window.createLuau;
              if (factory) resolve(factory);
              else if (mounted) setTimeout(check, 50);
            };
            check();
          });
        };

        const LuauFactory = await waitForFactory();
        const options = {
          print: (text: string) => {
            if (mounted) setOutput(prev => (prev ? prev + "\n" + text : text));
          },
          printErr: (text: string) => {
            if (mounted) setError(prev => (prev ? prev + "\n" + text : text));
          }
        };

        const result = typeof LuauFactory === 'function' ? LuauFactory(options) : LuauFactory;
        LuauRuntime = result && result.then ? await result : result;

        if (mounted) setIsRuntimeLoaded(true);
      } catch (err: any) {
        if (mounted) setError(`Load Error: ${err.message}`);
      }
    };
    loadRuntime();
    return () => { mounted = false; };
  }, []);

  const handleRun = () => {
    if (!isRuntimeLoaded || !LuauRuntime) return;
    setOutput("");
    setError("");
    setIsPending(true);
    
    setTimeout(() => {
      try {
        const runFn = LuauRuntime.run || (typeof LuauRuntime === 'function' ? LuauRuntime : null);
        if (typeof runFn === 'function') {
          runFn(code);
        } else {
          // @ts-ignore
          const fallbackRun = (window.Module && window.Module.run) || window.run;
          if (typeof fallbackRun === 'function') {
            fallbackRun(code);
          } else {
            throw new Error("Execution method not found");
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsPending(false);
      }
    }, 10);
  };

  const handleCopy = () => {
    if (!output) return;
    try {
      const textArea = document.createElement("textarea");
      textArea.value = output;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Copied to clipboard" });
      }
    } catch (err) {
      toast({ title: "Copy Failed", variant: "destructive" });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card">
        <h1 className="font-bold text-md">LuaU <span className="text-primary">Runner</span></h1>
        <Button onClick={handleRun} disabled={isPending || !isRuntimeLoaded} size="sm" className="h-8 gap-2">
          {isPending ? <div className="w-3 h-3 border-2 border-t-transparent animate-spin rounded-full" /> : <Play className="w-3 h-3" />}
          <span>Run</span>
        </Button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 border-r border-border">
          <div className="flex items-center justify-between px-3 py-1.5 bg-muted/20 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Editor</span>
            <div className="flex gap-1">
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const r = new FileReader();
                  r.onload = (ev) => setCode(ev.target?.result as string);
                  r.readAsText(file);
                }
              }} />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}><Upload className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setCode("")}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
          <div className="flex-1 min-h-0"><CodeEditor value={code} onChange={setCode} disabled={isPending} /></div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-black">
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span>Console</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!output} onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!output} onClick={() => {
                const blob = new Blob([output!], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "output.txt"; a.click();
              }}><Download className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto"><Console output={output} error={error} isLoading={isPending} /></div>
        </div>
      </div>
    </div>
  );
}
