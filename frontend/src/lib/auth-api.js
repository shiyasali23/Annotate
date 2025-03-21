// utils/DiagnosisDetectionUtils.js
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '/backend';


export const authenticate = async (inputFields, type) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
  
    try {
      const response = await fetch(`${BACKEND_API_URL}/${type}`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: inputFields }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        const errorMessage =
          response.status === 401
            ? "Invalid credentials"
            : response.status === 500
            ? "Something went wrong"
            : "Something went wrong";
        return { data: null, message: errorMessage };
      }
  
      return { data: result.response || null, message: null };
    } catch (error) {
      console.error("Authentication error:", error);
      return { data: null, message: "Something went wrong" };
    } finally {
      clearTimeout(timeoutId);
    }
  };
  

