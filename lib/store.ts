import { promises as fs } from "fs";
import path from "path";
import type { Berth, ClubDocument, Member, User } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  const full = path.join(DATA_DIR, file);
  try {
    const raw = await fs.readFile(full, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  const full = path.join(DATA_DIR, file);
  const tmp = `${full}.${Date.now()}.tmp`;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(tmp, JSON.stringify(value, null, 2) + "\n", "utf8");
  await fs.rename(tmp, full);
}

export async function getUsers() {
  return readJson<User[]>("users.json", []);
}

export async function saveUsers(users: User[]) {
  await writeJson("users.json", users);
}

export async function getMembers() {
  return readJson<Member[]>("members.json", []);
}

export async function saveMembers(members: Member[]) {
  await writeJson("members.json", members);
}

export async function getDocuments() {
  return readJson<ClubDocument[]>("documents.json", []);
}

export async function saveDocuments(documents: ClubDocument[]) {
  await writeJson("documents.json", documents);
}

export async function getBerths() {
  return readJson<Berth[]>("berths.json", []);
}

export async function saveBerths(berths: Berth[]) {
  await writeJson("berths.json", berths);
}
