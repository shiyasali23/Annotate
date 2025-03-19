// utils/DiagnosisDetectionUtils.js
const DIAGNOSIS_API_URL =
  process.env.DIAGNOSIS_API_URL || "http://127.0.0.1:8001/diagnosis";

export const getModels = async (type) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${DIAGNOSIS_API_URL}/get_features/${type}`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data?.response)) {
      throw new Error("Invalid API response structure");
    }

    return data.response;
  } catch (error) {
    console.error("Failed to fetch Diagnosis models:");
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getDiseasePredictions = async (modelId, inputValues) => {
  console.log(inputValues);
  const token = localStorage.getItem("token");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const requestBody = { data: inputValues };
    if (token) {
      requestBody.token = token;
    }
    const response = await fetch(`${DIAGNOSIS_API_URL}/predict/${modelId}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.response || typeof data.response !== "object") {
      throw new Error("Invalid API response structure");
    }

    return data.response;
  } catch (error) {
    console.error("Failed to fetch Diagnosis predictions:");
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getDiagnosisPrediction = async (modelId, inputValues) => {
  console.log(inputValues);
  
  const token = localStorage.getItem("token");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const requestBody = { data: inputValues };
    if (token) {
      requestBody.token = token;
    }

    const response = await fetch(`${DIAGNOSIS_API_URL}/predict/${modelId}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.response || typeof data.response !== "object") {
      throw new Error("Invalid API response structure");
    }

    try {
      const diagnosisReport = await getDiagnosisReport(data.response.prediction);
      if (diagnosisReport && typeof diagnosisReport === "object") {
        return { ...data.response, ...diagnosisReport }; // Merge objects
      }
    } catch (error) {
      console.error("Failed to fetch Diagnosis report:", error);
    }

    return data.response; // Return original data if diagnosisReport fails
  } catch (error) {
    console.error("Failed to fetch Diagnosis predictions:", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};


//--------------------Diagnosis Report-----------------------

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://127.0.0.1:8000/backend";

export const getDiagnosisReport = async (disease) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/diseases`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: disease }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.response || typeof data.response !== "object") {
      throw new Error("Invalid API response structure");
    }

    return data.response;
  } catch (error) {
    console.error("Failed to fetch Diagnosis predictions:", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
