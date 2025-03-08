export const processBiochemicals = (biochemicals) => {
    if (!biochemicals || biochemicals.length === 0) return null;
  
    const biochemicalDict = new Map();
  
    for (const { id, name, unit, category } of biochemicals) {
      if (!biochemicalDict.has(category)) {
        biochemicalDict.set(category, []);
      }
      biochemicalDict.get(category).push({ id, name, unit });
    }
  
    return Object.fromEntries(biochemicalDict);
  };