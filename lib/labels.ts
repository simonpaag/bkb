import type {
  BoardRole,
  CanalSide,
  DocumentCategory,
  MembershipType,
} from "./types";

export const ROLE_LABELS: Record<BoardRole, string> = {
  formand: "Formand",
  naestformand: "Næstformand",
  kasserer: "Kasserer",
  sekretaer: "Sekretær",
  bestyrelsesmedlem: "Bestyrelsesmedlem",
  suppleant: "Suppleant",
};

export const MEMBERSHIP_LABELS: Record<MembershipType, string> = {
  baadplads: "Bådplads",
  venteliste: "Venteliste",
  passiv: "Passiv",
};

export const SIDE_LABELS: Record<CanalSide, string> = {
  norden: "Overgaden Neden Vandet",
  sonden: "Overgaden Oven Vandet",
};

export const SIDE_SHORT: Record<CanalSide, string> = {
  norden: "Nordsiden",
  sonden: "Sydsiden",
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  vedtaegter: "Vedtægter",
  referater: "Referater",
  regnskab: "Regnskab",
  reglement: "Reglement",
  generalforsamling: "Generalforsamling",
  andet: "Andet",
};

export const BOARD_ROLES: BoardRole[] = [
  "formand",
  "naestformand",
  "kasserer",
  "sekretaer",
  "bestyrelsesmedlem",
  "suppleant",
];

export const MEMBERSHIP_TYPES: MembershipType[] = [
  "baadplads",
  "venteliste",
  "passiv",
];

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "vedtaegter",
  "referater",
  "regnskab",
  "reglement",
  "generalforsamling",
  "andet",
];
