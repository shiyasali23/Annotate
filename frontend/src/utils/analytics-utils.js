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