const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/backend';

export const getFoodNutrients = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/food_nutrients`, {
      method: "GET",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.response || null;
  } catch (error) {
    console.error("Error fetching food nutrients:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const createFoodsscore = async (unExpiredBiometricsData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Something went wrong,");
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BACKEND_API_URL}/foods_score/create`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ data: unExpiredBiometricsData }),
      
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.response || null;
  } catch (error) {
    console.error("Error creaating foods score:", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};




//----------------------Detection--------------------------------------------------

const DETECTION_API_URL = process.env.DETECTION_API_URL || 'http://127.0.0.1:8002/detection';
export const detectFood = async (file) => {      
  const token = localStorage.getItem("token");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const formData = new FormData();
  formData.append("file", file);
  if (token) {
    formData.append("token", token); 
  }

  try {
    const response = await fetch(`${DETECTION_API_URL}/detect`, {
      method: "POST",
      signal: controller.signal,
      body: formData, 
    });
    
    if (!response.ok) {
      throw new Error(`Error detecting food: ${response.status}`);
    }

    const result = await response.json();
    console.log("response",result);
    if (result.response == null) {
      console.log("response",result);
      
      
      return { detectedFoods: null, message: "No Food Detected. Try New" };
    }
    return { detectedFoods: result.response, message: null };
    
  } catch (error) {
    console.error("Error detecting food:", error.message);
    return { detectedFoods: null, message: "Something went wrong" };
  } finally {
    clearTimeout(timeoutId);
  }
};