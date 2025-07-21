// lib/drug-interactions.ts
export const drugInteractions = {
  "aspirin": ["ibuprofen", "warfarin"],
  "ibuprofen": ["aspirin", "naproxen"],
  "warfarin": ["aspirin"],
  // Add more pairs
}

export function checkInteractions(drugs: string[]): string[] {
  const warnings: string[] = []

  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const a = drugs[i].toLowerCase()
      const b = drugs[j].toLowerCase()

      if (
        (drugInteractions[a] && drugInteractions[a].includes(b)) ||
        (drugInteractions[b] && drugInteractions[b].includes(a))
      ) {
        warnings.push(`${drugs[i]} may interact with ${drugs[j]}`)
      }
    }
  }

  return warnings
}
