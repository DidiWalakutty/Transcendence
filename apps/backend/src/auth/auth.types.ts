export type OptionalAuthUser = { id: string } | null;

export type AuthenticatedUser = {
  id: string;
  role?: string | null;
  name: string;
};

export type OptionalAuthCtx = { user: { id: string } | null };

export type ProtectedCtx = { user: { id: string; role?: string | null } };

export type ChatCtx = { user: { id: string; name: string } };
