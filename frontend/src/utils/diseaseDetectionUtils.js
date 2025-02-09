// utils/diseaseDetectionUtils.js
const DIAGNOSIS_API_URL = process.env.DIAGNOSIS_API_URL || 'http://0.0.0.0:8001';


export const getDiseaseDetectionModals = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${DIAGNOSIS_API_URL}/get_features/disease_detections`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data?.response)) {
      throw new Error('Invalid API response structure');
    }

    return data.response;
  } catch (error) {
    console.error('Failed to fetch disease detection models:', error);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
};