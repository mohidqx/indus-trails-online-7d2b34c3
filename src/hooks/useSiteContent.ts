import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteContent = Record<string, unknown>;

async function fetchSiteContent(): Promise<SiteContent> {
  const { data, error } = await supabase.from("site_content").select("key, value");
  if (error) throw error;

  const map: SiteContent = {};
  (data ?? []).forEach((row) => {
    map[row.key] = row.value;
  });
  return map;
}

export function useSiteContent() {
  return useQuery({
    queryKey: ["site_content"],
    queryFn: fetchSiteContent,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,
  });
}
