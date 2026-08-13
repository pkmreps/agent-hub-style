import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Agent = {
  id: string;
  name: string;
  avatar_url: string | null;
  referral_url: string;
  sort_order: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  image_url: string | null;
  qc_url: string | null;
  quality: string;
  likes: number;
  dislikes: number;
  views: number;
  agent_links: Record<string, string>;
};

export type GuideStep = {
  id: string;
  step_number: number;
  title: string;
  description: string;
  image_url: string | null;
};

export type Settings = Record<string, string>;

export const useAgents = () =>
  useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agents").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Agent[];
    },
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p) => ({
        ...p,
        agent_links: (p.agent_links ?? {}) as Record<string, string>,
      })) as Product[];
    },
  });

export const useGuideSteps = () =>
  useQuery({
    queryKey: ["guide_steps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guide_steps").select("*").order("step_number");
      if (error) throw error;
      return (data ?? []) as GuideStep[];
    },
  });

export const useSettings = () =>
  useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      const out: Settings = {};
      for (const row of data ?? []) out[row.key] = row.value;
      return out;
    },
  });

export function useRefresh() {
  const qc = useQueryClient();
  return (key: string) => qc.invalidateQueries({ queryKey: [key] });
}

export async function saveSetting(key: string, value: string) {
  const { error } = await supabase.from("settings").upsert({ key, value });
  if (error) throw error;
}
