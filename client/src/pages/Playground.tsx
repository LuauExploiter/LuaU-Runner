import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { Console } from "@/components/Console";
import { HistorySidebar } from "@/components/HistorySidebar";
import { useRunLuau } from "@/hooks/use-luau";
import { Play, Sparkles, AlertCircle, Share2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Assuming shadcn sheet exists or handled by layout logic

// Default code snippet
const DEFAULT_CODE = `-- Luau Playground
print("Hello from Luau!")

local function factorial(n)
    if n == 0 then
        return 1
    else
        return n * factorial(n - 1)
    end
end

print("Factorial of 5 is: " .. factorial(5))
`;

export default function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  const handleLoadSnippet = (snippetCode: string) => {
    setCode(snippetCode);
    setOutput(null);
    setError(null);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
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
            Luau<span className="text-primary">Runner</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            disabled={isPending}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200
              ${isPending 
                ? "bg-primary/50 cursor-not-allowed opacity-80" 
                : "bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:translate-y-0.5"
              }
              text-primary-foreground
            `}
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
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop: Static, Mobile: Hidden/Sheet) */}
        <aside className="hidden md:flex w-64 border-r border-border flex-col bg-muted/10">
          <HistorySidebar onSelect={handleLoadSnippet} />
        </aside>

        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden absolute top-16 left-4 z-50">
           {/* Using a simple state toggle for now, in a real app would use a Sheet/Dialog */}
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 bg-secondary rounded-full shadow-lg border border-border text-muted-foreground hover:text-foreground"
           >
             {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
           </button>
        </div>
        
        {/* Mobile Sidebar Drawer */}
        {isSidebarOpen && (
          <div className="md:hidden absolute inset-0 z-40 bg-background/80 backdrop-blur-sm flex">
            <div className="w-3/4 bg-card border-r border-border h-full shadow-2xl animate-in slide-in-from-left duration-200">
               <HistorySidebar onSelect={handleLoadSnippet} />
            </div>
            <div className="flex-1" onClick={() => setIsSidebarOpen(false)} />
          </div>
        )}

        {/* Workspace */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Editor Pane */}
          <div className="flex-1 h-[50vh] md:h-auto p-4 md:p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Editor</span>
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
