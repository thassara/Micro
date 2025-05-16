const API_BASE_URL = "http://localhost:8080"; 


export const loginUser = async (credentials) => {
  console.log("API_BASE_URL", API_BASE_URL);
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });


    const token = await response.text(); 

    console.log("Received token:", token);

    if (!response.ok) {
      throw new Error("Login failed");
    }


    if (token) {
      localStorage.setItem("token", token);
    }

    return { success: true, token };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};


export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};


export const fetchProtectedData = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return { success: false, error: "No token found, please login." };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/protected-endpoint`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch protected data");
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
