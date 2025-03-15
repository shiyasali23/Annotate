export const processBiometricData = (biometricsEntries) => {
  // Process health score entries.
  const healthScore = biometricsEntries
    .map((entry) => ({
      created_at: entry.created_at,
      health_score: entry.health_score,
      _ts: new Date(entry.created_at),
    }))
    .sort((a, b) => a._ts - b._ts)
    .map(({ _ts, ...rest }) => rest);

  // Prepare mappings for biometrics and their latest entries.
  const bioMap = Object.create(null);
  const latestMap = Object.create(null);
  const hyper = [];
  const hypo = [];

  biometricsEntries.forEach((entry) => {
    const entryTS = new Date(entry.created_at).getTime();
    entry.biometrics.forEach((bio) => {
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

      const recordEntry = [
        entryTS,
        bio.value,
        bio.scaled_value,
        bio.expiry_date,
        bio.id,
        bio.is_hyper,
        bio.unit,
        bio.healthy_min,
        bio.healthy_max,
      ];
      bioRecord.entries.push(recordEntry);

      // Update latest biometric if current entry is newer.
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
        };
      }
    });
  });

  // Build a flat mapping for biometrics.
  const flatBiometrics = Object.create(null);
  const latestBiometrics = [];

  for (const bioName in bioMap) {
    if (Object.hasOwnProperty.call(bioMap, bioName)) {
      const record = bioMap[bioName];
      record.entries.sort((a, b) => a[0] - b[0]);
      const entriesObj = record.entries.map((e) => ({
        createdAt: new Date(e[0]).toISOString(),
        value: e[1],
        scaledValue: e[2],
        expiryDate: e[3],
        isHyper: e[5],
      }));

      flatBiometrics[bioName] = {
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

      // Classify the latest biometric.
      const latest = latestMap[bioName];
      if (latest) {
        const latestBiochemical = {
          id: latest.id,
          name: latest.name,
          category: latest.category,
          unit: latest.unit,
          healthy_min: latest.healthy_min,
          healthy_max: latest.healthy_max,
          value: latest.value,
          scaledValue: latest.scaledValue,
          expiryDate: latest.expiryDate,
          isHyper: latest.isHyper,
        };
        latestBiometrics.push(latestBiochemical);

        if (latest.isHyper === true) {
          hyper.push(latestBiochemical);
        } else if (latest.isHyper === false) {
          hypo.push(latestBiochemical);
        }
      }
    }
  }

  // Group flat biometrics by category.
  const biometrics = Object.create(null);
  for (const bioName in flatBiometrics) {
    if (Object.hasOwnProperty.call(flatBiometrics, bioName)) {
      const record = flatBiometrics[bioName];
      const category = record.category;
      if (!biometrics[category]) {
        biometrics[category] = Object.create(null);
      }
      const { category: _, ...rest } = record;
      biometrics[category][bioName] = rest;
    }
  }

  // Create a list of biochemical IDs with defined isHyper values.
  const hyperHypoBiochemicalsIds = latestBiometrics
    .filter(({ isHyper }) => isHyper !== null)
    .map(({ id, isHyper }) => ({ id, is_hyper: isHyper }));

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
  if (!conditions?.length) {
    return {
      processedHyperBiochemicals: hyperBiochemicals || [],
      processedHypoBiochemicals: hypoBiochemicals || [],
    };
  }

  const hyperMap = new Map();
  const hypoMap = new Map();

  if (Array.isArray(hyperBiochemicals)) {
    hyperBiochemicals.forEach((bio) => hyperMap.set(bio.id, bio));
  }

  if (Array.isArray(hypoBiochemicals)) {
    hypoBiochemicals.forEach((bio) => hypoMap.set(bio.id, bio));
  }

  conditions.forEach((condition) => {
    const { id, is_hyper, conditions: conds } = condition;
    const targetBio = is_hyper ? hyperMap.get(id) : hypoMap.get(id);
    if (targetBio) {
      targetBio.conditions = conds;
    }
  });

  return {
    processedHyperBiochemicals: hyperBiochemicals || [],
    processedHypoBiochemicals: hypoBiochemicals || [],
  };
};
