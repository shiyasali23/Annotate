//utils/DiagnosisDetectionUtils.js
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/backend';

export const getConditions = async (conditionsIds) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/conditions`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: conditionsIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.response || null;
  } catch (error) {
    console.error("Error fetching conditions:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const updateUser = async (inputValues) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Something went wrong,");
  }
  console.log("token", token);
  console.log("inputValues", inputValues);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/user/update`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ data: inputValues }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.response || null;
  } catch (error) {
    console.error("Error updating user:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
