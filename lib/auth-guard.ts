import { redirect } from "next/navigation";
import { isAdmin } from "./types";
import { getSession } from "./session";

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdminUser() {
  const session = await requireUser();
  if (!isAdmin(session.role)) redirect("/");
  return session;
}
