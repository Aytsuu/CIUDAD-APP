import api from "@/api/api";
import { v4 as uuidv4 } from "uuid";

// Store the UUID in localStorage so it's persistent across reloads
const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
};

export const FCMTokenPOST = async (token: string) => {
  try {
    const deviceId = getOrCreateDeviceId();

    const res = await api.post("notification/register-token/", {
      fcm_token: token,
      fcm_device_id: deviceId,
    });

    return res.data;
  } catch (error: any) {
    console.error("Error posting FCM token: ", error.response?.data || error.message);
  }
};
