export const processDummyData = (dummyBiometricsEntry) => {
  let currentDate = new Date(); // Initial created_at date

  for (let i = 0; i < dummyBiometricsEntry.length; i++) {
    // Set created_at and move to the next week for the next entry
    dummyBiometricsEntry[i].created_at = currentDate.toISOString();
    currentDate.setDate(currentDate.getDate() + 7); // Move to the next week

    const biometrics = dummyBiometricsEntry[i].biometrics;
    for (let j = 0; j < biometrics.length; j++) {
      // Set expiry_date to a random day within the current week
      const expiryDate = new Date(dummyBiometricsEntry[i].created_at);
      expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 7)); // Random day in the week
      biometrics[j].expiry_date = expiryDate.toISOString();
    }
  }

  return dummyBiometricsEntry;
};
  