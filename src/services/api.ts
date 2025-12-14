import axios from "axios";
import { Platform } from "react-native";

// For iOS simulator use your computer's IP, for Android emulator use 10.0.2.2
// To find your computer's IP on Mac: `ipconfig getifaddr en0` (Wi‑Fi)
// Replace LOCAL_NETWORK_IP below with your computer's IP (e.g. "192.168.1.23")
const getApiUrl = () => {
  const LOCAL_NETWORK_IP = "192.168.1.18"; // TODO: change to your actual IP

  // Development mode
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000/api"; // Android emulator
  }
  // iOS simulator or physical device - use your computer's IP
  return `http://${LOCAL_NETWORK_IP}:4000/api`;
};

const API_URL = getApiUrl();

// Get token from AsyncStorage or context
const getToken = () => {
  // For now, we'll store it in a simple way
  // In production, use AsyncStorage or context
  return null;
};

export const login = async (username: string, password: string) => {
  try {
    console.log("Attempting login to:", `${API_URL}/auth/login`);
    console.log("With username:", username);
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    
    console.log("Login response:", response.data);
    
    // Store tokens (in production, use AsyncStorage)
    if (response.data.accessToken) {
      // Store token logic here
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Login error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error message:", error.message);
    
    if (error.code === "ECONNREFUSED" || error.message?.includes("Network Error")) {
      throw new Error("Cannot connect to server. Make sure the backend is running on port 4000.");
    }
    
    throw new Error(error.response?.data?.error || error.message || "Login failed");
  }
};

export const getProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to load profile");
  }
};

export const updateProfile = async (
  token: string,
  data: {
    display_name: string;
    email: string;
    birth_date: string;
    profile_image?: string;
    username?: string;
    password?: string;
    intents?: {
      dating?: boolean;
      sport_partner?: boolean;
      social?: boolean;
      entrepreneurship?: boolean;
      work?: boolean;
    };
  }
) => {
  try {
    if (!token || token.trim() === "") {
      throw new Error("Invalid token");
    }

    const response = await axios.put(
      `${API_URL}/me`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error("Invalid token");
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.message) {
      throw new Error(error.message);
    }
    throw new Error("Failed to update profile");
  }
};

export const joinCommunity = async (token: string, communityId: string) => {
  try {
    await axios.post(`${API_URL}/communities/${communityId}/join`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error("Failed to join community", error.message);
  }
};

export const getCommunities = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/communities`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to load communities");
  }
};

export const getMyCommunities = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/communities/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to load my communities");
  }
};

export const registerPushToken = async (token: string, platform: string) => {
  try {
    await axios.post(`${API_URL}/push-token`, { token, platform });
  } catch (error: any) {
    console.error("Failed to register push token:", error.message);
  }
};


