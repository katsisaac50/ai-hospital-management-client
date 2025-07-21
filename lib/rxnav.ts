// lib/rxnav.ts
export async function rxcuiForDrug(name: string): Promise<string | null> {
  const res = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}&search=2`);
  if (!res.ok) throw new Error("RxNav lookup failed");
  const { idGroup } = await res.json();
  return idGroup.rxnormId?.[0] || null;
}

export async function checkRxnavInteractions(rxcuis: string[]): Promise<string[]> {
  const warnings: string[] = [];

  for (let i = 0; i < rxcuis.length; i++) {
    const a = rxcuis[i];

    try {
        console.log('hehe', a)
      const res = await fetch(`https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${a}`);

      if (!res.ok) {
        const text = await res.text();
        console.warn(`RxNav API returned ${res.status} for rxcui ${a}: ${text}`);
        continue; // skip this rxcui
      }

      const data = await res.json();
      const groups = data.interactionTypeGroup || [];

      groups.forEach((grp) => {
        grp.interactionType?.forEach((type) => {
          type.interactionPair?.forEach((pair) => {
            const { description, interactionConcept } = pair;
            const drugNames = interactionConcept.map((c) => c.name);
            warnings.push(`${drugNames[0] || ""} ↔ ${drugNames[1] || ""}: ${description}`);
          });
        });
      });

    } catch (err) {
      console.error(`Error checking interaction for rxcui ${a}:`, err);
    }
  }

  return warnings;
}

