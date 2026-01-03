import { useHistory } from "@/hooks/use-luau";
import { format } from "date-fns";
import { Clock, Code2, ChevronRight } from "lucide-react";

interface HistorySidebarProps {
  onSelect: (code: string) => void;
}

export function HistorySidebar({ onSelect }: HistorySidebarProps) {
  const { data: history, isLoading } = useHistory();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Clock size={16} />
          Recent Runs
        </h3>
      </div>
      
      <div className="flex-1 overflow-auto p-2 space-y-2 custom-scrollbar">
        {!history?.length ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No history yet
          </div>
        ) : (
          history.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => onSelect(snippet.code)}
              className="w-full text-left group p-3 rounded-md border border-transparent hover:bg-muted/50 hover:border-border transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  #{snippet.id}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {snippet.createdAt && format(new Date(snippet.createdAt), "HH:mm:ss")}
                </span>
              </div>
              <div className="text-xs font-mono text-foreground/80 truncate mb-1.5">
                {snippet.code.slice(0, 30).replace(/\n/g, " ")}...
              </div>
              <div className="flex items-center text-[10px] text-primary group-hover:underline">
                <Code2 size={10} className="mr-1" />
                Load Snippet
                <ChevronRight size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
