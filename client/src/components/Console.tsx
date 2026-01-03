import { Terminal } from "lucide-react";

interface ConsoleProps {
  output: string | null;
  error?: string | null;
  isLoading?: boolean;
}

export function Console({ output, error, isLoading }: ConsoleProps) {
  return (
    <div className="flex flex-col h-full bg-black rounded-lg border border-border overflow-hidden shadow-inner shadow-black/50">
      <div className="flex items-center justify-between px-4 h-9 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Terminal size={14} />
          <span className="text-xs font-semibold tracking-wide uppercase">Output Console</span>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-xs text-primary">Running...</span>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">
        {isLoading ? (
          <div className="space-y-2 opacity-50">
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
          </div>
        ) : error ? (
          <div className="text-red-400">
            <span className="font-bold text-red-500">Error:</span> {error}
          </div>
        ) : output ? (
          <div className="text-green-400">{output}</div>
        ) : (
          <div className="text-muted-foreground/40 italic">
            Run code to see output here...
          </div>
        )}
      </div>
    </div>
  );
}
