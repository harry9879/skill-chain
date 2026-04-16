import SkillChainABI from "../abi/SkillChain.json";

export const CONTRACT_ADDRESS =
  "0x87Bddb0Fe158837e9e0de5f59DAce50Fdf9CDc56" as `0x${string}`;

export const SKILLCHAIN_ABI = SkillChainABI.abi;

export enum SkillLevel {
  Beginner = 0,
  Intermediate = 1,
  Advanced = 2,
}

export const LEVEL_LABELS: Record<number, string> = {
  0: "Beginner",
  1: "Intermediate",
  2: "Advanced",
};

export const LEVEL_REP: Record<number, number> = {
  0: 10,
  1: 20,
  2: 50,
};

export const LEVEL_COLORS: Record<number, string> = {
  0: "#6B7280",
  1: "#3B82F6",
  2: "#C8FF00",
};