import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTimsesMember, deleteTimsesMember, updateTimsesRole } from "@/services/timses";
import { timsesListQueryKey } from "@/hooks/useTimsesList";
import type { CreateTimsesMemberInput, UpdateTimsesRoleInput } from "@/types/timses";

// Admin-only (POST /user, @Roles admin/adminsekret di backend — lihat
// api-standards.md § RBAC). Invalidate query yang sama dipakai `useTimsesList`
// supaya TimsesScreen refetch otomatis begitu akun baru dibuat.
export function useCreateTimsesMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTimsesMemberInput) => createTimsesMember(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: timsesListQueryKey() });
    },
  });
}

// Admin-only (PATCH /user/:id, @Roles admin/adminsekret) — dipakai
// TimsesFormScreen mode edit (2026-08-26). Sama pola invalidate dengan create.
export function useUpdateTimsesRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTimsesRoleInput }) => updateTimsesRole(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: timsesListQueryKey() });
    },
  });
}

// Admin-only (DELETE /user/:id, @Roles admin/adminsekret) — dipakai
// TimsesFormScreen mode edit (2026-08-26, endpoint baru diajukan mobile →
// dibuat user di repo backend). Sama pola invalidate dengan create/update.
export function useDeleteTimsesMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTimsesMember(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: timsesListQueryKey() });
    },
  });
}
