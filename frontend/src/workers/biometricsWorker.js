// processBiometricData.js
export const processBiometricData = (biometricsEntries) => {
    const now = Date.now();
  
    const healthScore = biometricsEntries
      .map(entry => {
        const ts = new Date(entry.created_at).getTime();
        return { 
          created_at: new Date(ts).toISOString(), 
          health_score: entry.health_score,
          _ts: ts  
        };
      })
      .sort((a, b) => a._ts - b._ts)
      .map(({ _ts, ...rest }) => rest);
  
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
            latestExpiry: ""
          };
          bioMap[bioName] = bioRecord;
        }
        const expiryTS = new Date(bio.expiry_date).getTime();
  
        bioRecord.entries.push([
          entryTS,
          bio.value,
          bio.scaled_value,
          bio.expiry_date,
          bio.id,
          bio.is_hyper
        ]);
  
        if (entryTS > bioRecord.latestTS) {
          bioRecord.latestTS = entryTS;
          bioRecord.latestExpiry = bio.expiry_date;
          latestMap[bioName] = {
            id: bio.id,
            name: bioName,
            category: bio.category,
            value: bio.value,
            scaledValue: bio.scaled_value,
            expiryDate: bio.expiry_date,
            isHyper: bio.is_hyper, 
            isExpired: expiryTS < now
          };
        }
      }
    }
  
    const biochemicals = Object.create(null);
    const latestBiometrics = [];
  
    
    for (const bioName in bioMap) {
      if (Object.hasOwnProperty.call(bioMap, bioName)) {
        const record = bioMap[bioName];
  
       
        record.entries.sort((a, b) => a[0] - b[0]);
  
        
        const entriesObj = new Array(record.entries.length);
        for (let k = 0, kLen = record.entries.length; k < kLen; k++) {
          const e = record.entries[k];
          entriesObj[k] = {
            createdAt: new Date(e[0]).toISOString(),
            value: e[1],
            scaledValue: e[2],
            expiryDate: e[3],
            id: e[4],
            isHyper: e[5]
          };
        }
  
        biochemicals[bioName] = {
          category: record.category,
          lastUpdated: new Date(record.latestTS).toISOString(),
          expiryOn: record.latestExpiry,
          entries: entriesObj
        };
  
        const latest = latestMap[bioName];
        if (latest) {
          
          const latestBiometric = {
            id: latest.id,
            name: latest.name,
            category: latest.category,
            value: latest.value,
            scaledValue: latest.scaledValue,
            expiryDate: latest.expiryDate,
            isExpired: latest.isExpired,
            isHyper: latest.isHyper
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
  
    return {
      healthScore,
      biochemicals,
      latestBiometrics,
      hyperBiochemicals: hyper.length ? hyper : null,
      hypoBiometrics: hypo.length ? hypo : null,
    };
  };
  