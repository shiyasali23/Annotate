export const processBiometricData = (biometricsEntries) => {
  const now = Date.now();

  // Process health score entries and sort them by timestamp.
  const healthScore = biometricsEntries
    .map((entry) => ({
      created_at: entry.created_at, // Keep it unchanged
      health_score: entry.health_score,
      _ts: new Date(entry.created_at), // Convert for sorting
    }))
    .sort((a, b) => a._ts - b._ts)
    .map(({ _ts, ...rest }) => rest);

  // Prepare mappings for biometrics and their latest entries.
  const bioMap = Object.create(null);
  const latestMap = Object.create(null);
  const hyper = [];
  const hypo = [];

  for (let i = 0, len = biometricsEntries.length; i < len; i++) {
    const entry = biometricsEntries[i];
    const entryTS = new Date(entry.created_at).getTime();

    for (let j = 0, jLen = entry.biometrics.length; j < jLen; j++) {
      const bio = entry.biometrics[j];
      const bioName = bio.name;
      let bioRecord = bioMap[bioName];
      if (!bioRecord) {
        bioRecord = {
          category: bio.category,
          entries: [],
          latestTS: 0,
          latestExpiry: "",
        };
        bioMap[bioName] = bioRecord;
      }
      const expiryTS = new Date(bio.expiry_date).getTime();

      // Push a record that contains all fields.
      // Note: [4] id, [6] unit, [7] healthy_min, and [8] healthy_max will be moved to the outer object.
      bioRecord.entries.push([
        entryTS, // 0: timestamp
        bio.value, // 1: value
        bio.scaled_value, // 2: scaled_value
        bio.expiry_date, // 3: expiry_date
        bio.id, // 4: id
        bio.is_hyper, // 5: is_hyper
        bio.unit, // 6: unit
        bio.healthy_min, // 7: healthy_min
        bio.healthy_max, // 8: healthy_max
      ]);

      // Update latest biometric for this biochemical if current entry is newer.
      if (entryTS > bioRecord.latestTS) {
        bioRecord.latestTS = entryTS;
        bioRecord.latestExpiry = bio.expiry_date;
        latestMap[bioName] = {
          id: bio.id,
          name: bio.name,
          category: bio.category,
          unit: bio.unit,
          healthy_min: bio.healthy_min,
          healthy_max: bio.healthy_max,
          value: bio.value,
          scaledValue: bio.scaled_value,
          expiryDate: bio.expiry_date,
          isHyper: bio.is_hyper,
          isExpired: expiryTS < now,
        };
      }
    }
  }

  // Build a flat mapping for biometrics from bioMap.
  const flatBiometrics = Object.create(null);
  const latestBiometrics = [];

  for (const bioName in bioMap) {
    if (Object.hasOwnProperty.call(bioMap, bioName)) {
      const record = bioMap[bioName];

      // Sort entries by creation timestamp.
      record.entries.sort((a, b) => a[0] - b[0]);

      // Build entries without static properties (id, unit, healthy_min, healthy_max).
      const entriesObj = new Array(record.entries.length);
      for (let k = 0, kLen = record.entries.length; k < kLen; k++) {
        const e = record.entries[k];
        entriesObj[k] = {
          createdAt: new Date(e[0]).toISOString(),
          value: e[1],
          scaledValue: e[2],
          expiryDate: e[3],
          isHyper: e[5],
        };
      }

      flatBiometrics[bioName] = {
        // Move static fields to the outer object.
        id: latestMap[bioName] ? latestMap[bioName].id : record.entries[0][4],
        category: record.category,
        lastUpdated: new Date(record.latestTS).toISOString(),
        expiryOn: record.latestExpiry,
        unit: latestMap[bioName]
          ? latestMap[bioName].unit
          : record.entries[0][6],
        healthy_min: latestMap[bioName]
          ? latestMap[bioName].healthy_min
          : record.entries[0][7],
        healthy_max: latestMap[bioName]
          ? latestMap[bioName].healthy_max
          : record.entries[0][8],
        entries: entriesObj,
      };

      const latest = latestMap[bioName];
      if (latest) {
        const latestBiometric = {
          id: latest.id,
          name: latest.name,
          category: latest.category,
          unit: latest.unit,
          healthy_min: latest.healthy_min,
          healthy_max: latest.healthy_max,
          value: latest.value,
          scaledValue: latest.scaledValue,
          expiryDate: latest.expiryDate,
          isExpired: latest.isExpired,
          isHyper: latest.isHyper,
        };
        latestBiometrics.push(latestBiometric);

        if (latest.isHyper === true) {
          hyper.push(latestBiometric);
        } else if (latest.isHyper === false) {
          hypo.push(latestBiometric);
        }
      }
    }
  }

  // Group the flat biometrics by category.
  const biometrics = Object.create(null);
  for (const bioName in flatBiometrics) {
    if (Object.hasOwnProperty.call(flatBiometrics, bioName)) {
      const record = flatBiometrics[bioName];
      const category = record.category;
      if (!biometrics[category]) {
        biometrics[category] = Object.create(null);
      }
      // Remove the category field from the inner object as it’s now represented by the key.
      const { category: _, ...rest } = record;
      biometrics[category][bioName] = rest;
    }
  }

  // Create hyperHypoBiochemicalsIds: exclude any records where isHyper is null.
  const hyperHypoBiochemicalsIds = latestBiometrics
    .filter(({ isHyper }) => isHyper !== null)
    .map(({ id, isHyper }) => ({
      id,
      is_hyper: isHyper,
    }));

  return {
    healthScore,
    biometrics,
    latestBiometrics,
    hyperBiochemicals: hyper.length ? hyper : [],
    hypoBiochemicals: hypo.length ? hypo : [],
    hyperHypoBiochemicalsIds,
  };
};

export const processConditions = (
  conditions,
  hyperBiochemicals,
  hypoBiochemicals
) => {
  // Check if any input array is empty or invalid
  if (
    !conditions?.length ||
    !hyperBiochemicals?.length ||
    !hypoBiochemicals?.length
  ) {
    return { processedHyper: null, processedHypo: null };
  }

  // Create quick lookup maps for O(1) access
  const hyperMap = new Map();
  const hypoMap = new Map();

  // Populate hyper map
  for (const bio of hyperBiochemicals) {
    hyperMap.set(bio.id, bio);
  }

  // Populate hypo map
  for (const bio of hypoBiochemicals) {
    hypoMap.set(bio.id, bio);
  }

  // Process each condition with early termination
  for (const condition of conditions) {
    const { id, is_hyper, conditions: conds } = condition;
    const targetBio = is_hyper ? hyperMap.get(id) : hypoMap.get(id);

    if (targetBio) {
      targetBio.conditions = conds;
    }
  }

  return {
    processedHyperBiochemicals: hyperBiochemicals,
    processedHypoBiochemicals: hypoBiochemicals,
  };
};




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


export const getBiometricEntry = (biometricMap, timeStamp) => {
  const entry = biometricMap.get(timeStamp);
  if (!entry) return null;
  const { created_at: created, biometrics } = entry;
  return {
    created,
    hyperBiochemicals: biometrics.filter(b => b.is_hyper === true),
    hypoBiochemicals: biometrics.filter(b => b.is_hyper === false),
    healthy: biometrics.filter(b => b.is_hyper === null)
  };
};
  
