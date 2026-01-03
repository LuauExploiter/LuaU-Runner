import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type ExecuteRequest } from "@shared/schema";

export function useHistory() {
  return useQuery({
    queryKey: [api.luau.history.path],
    queryFn: async () => {
      const res = await fetch(api.luau.history.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.luau.history.responses[200].parse(await res.json());
    },
  });
}

export function useRunLuau() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ExecuteRequest) => {
      // Validate input before sending
      const validated = api.luau.run.input.parse(data);
      
      const res = await fetch(api.luau.run.path, {
        method: api.luau.run.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.luau.run.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Execution failed");
      }
      
      return api.luau.run.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Refresh history after a run
      queryClient.invalidateQueries({ queryKey: [api.luau.history.path] });
    },
  });
}
