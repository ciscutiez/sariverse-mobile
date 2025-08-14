



import { supabase } from "~/lib/auth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useGetProfiles } from "./profile"
import { Product, ProductWithInventory } from "~/types/database"

export const useGetProducts = () => {
  const { data: profile } = useGetProfiles()

  return useQuery<ProductWithInventory[]>({
    queryKey: ["products", profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("Profile not found")

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          inventory:inventory (srp, stock, sku)
        `)
        .eq("profile_id", profile.id)

      if (error) throw error
      return data
    },
    enabled: !!profile?.id,
  })
}

export const useCreateProduct = () => {
  const qc = useQueryClient()
  const { data: profile } = useGetProfiles()

  return useMutation({
    mutationFn: async (payload: Omit<Product, "id" | "created_at" | "updated_at" | "profile_id">) => {
      if (!profile?.id) throw new Error("Profile not found")

      const { data, error } = await supabase
        .from("products")
        .insert({ ...payload, profile_id: profile.id })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  })
}

export const useUpdateProduct = () => {
  const qc = useQueryClient()
  const { data: profile } = useGetProfiles()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: number }) => {
      if (!profile?.id) throw new Error("Profile not found")

      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .eq("profile_id", profile.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  const { data: profile } = useGetProfiles()

  return useMutation({
    mutationFn: async (id: number) => {
      if (!profile?.id) throw new Error("Profile not found")

      const { error } = await supabase.from("products").delete().eq("id", id).eq("profile_id", profile.id)

      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  })
}
