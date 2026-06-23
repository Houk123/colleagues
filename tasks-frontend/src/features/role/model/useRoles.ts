import { useQuery } from "@tanstack/react-query";
import { fetchRoles } from "../api/roleApi.js";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
}
