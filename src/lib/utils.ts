import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateVoteLabel(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let label = ""
  for (let i = 0; i < 6; i++) {
    label += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return label
}
