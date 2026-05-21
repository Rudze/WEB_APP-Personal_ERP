import { useAuth } from "@/context/AuthContext";
import { hasRole } from "@/lib/utils";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || "viewer";

  return {
    role,
    isAdmin: hasRole(role, "admin"),
    isEditor: hasRole(role, "editor"),
    isViewer: hasRole(role, "viewer"),
    can: (minRole) => hasRole(role, minRole),
  };
}
