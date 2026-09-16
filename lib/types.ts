export type BoardRole =
  | "formand"
  | "naestformand"
  | "kasserer"
  | "sekretaer"
  | "bestyrelsesmedlem"
  | "suppleant";

export type MembershipType = "baadplads" | "venteliste" | "passiv";

export type CanalSide = "norden" | "sonden";

export type DocumentCategory =
  | "vedtaegter"
  | "referater"
  | "regnskab"
  | "reglement"
  | "generalforsamling"
  | "andet";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: BoardRole;
  admin?: boolean;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  boatName: string;
  boatLengthMeters: number | null;
  membershipType: MembershipType;
  berthId: string | null;
  photoPath: string | null;
  notes: string;
  createdAt: string;
}

export interface ClubDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  filename: string;
  path: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Berth {
  id: string;
  number: number;
  side: CanalSide;
  x: number;
  y: number;
  memberId: string | null;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: BoardRole;
  admin?: boolean;
}

export function isAdmin(user: { role: BoardRole; admin?: boolean }) {
  return user.role === "formand" || user.role === "naestformand" || Boolean(user.admin);
}
