import React, { useEffect } from "react";
import { Platform, PermissionsAndroid, Alert } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { registerPushToken } from "./src/services/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request push notification permissions first and register token
      await registerForPushNotifications();

      // Request Location Permission
      const { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== "granted") {
        Alert.alert(
          "הרשאת מיקום נדרשת",
          "האפליקציה זקוקה להרשאת מיקום כדי לפעול. אנא אפשר גישה להגדרות המיקום.",
          [{ text: "אישור" }]
        );
      }

      // Request Background Location Permission (for better accuracy)
      if (Platform.OS === "ios") {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== "granted") {
          console.log("Background location permission not granted");
        }
      }

      // Request Bluetooth Permission (Android)
      if (Platform.OS === "android") {
        try {
          const bluetoothConnectGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
              title: "הרשאת בלוטות' נדרשת",
              message: "האפליקציה זקוקה להרשאת בלוטות' כדי להתחבר למכשירים.",
              buttonNeutral: "שאל אותי מאוחר יותר",
              buttonNegative: "ביטול",
              buttonPositive: "אישור",
            }
          );

          const bluetoothScanGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
              title: "הרשאת סריקת בלוטות' נדרשת",
              message:
                "האפליקציה זקוקה להרשאת סריקת בלוטות' כדי לחפש מכשירים.",
              buttonNeutral: "שאל אותי מאוחר יותר",
              buttonNegative: "ביטול",
              buttonPositive: "אישור",
            }
          );

          if (bluetoothConnectGranted !== PermissionsAndroid.RESULTS.GRANTED ||
            bluetoothScanGranted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              "הרשאת בלוטות' נדרשת",
              "האפליקציה זקוקה להרשאות בלוטות' כדי לפעול. אנא אפשר גישה לבלוטות' בהגדרות.",
              [{ text: "אישור" }]
            );
          }
        } catch (err) {
          console.warn("Bluetooth permission error:", err);
        }
      }

      // For iOS, Bluetooth permissions are handled automatically when trying to use Bluetooth
      // No explicit permission request needed for iOS
    } catch (error) {
      console.error("Error requesting permissions:", error);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      const settings = await Notifications.getPermissionsAsync();
      let status = settings.status;

      if (status !== "granted") {
        const requestResult = await Notifications.requestPermissionsAsync();
        status = requestResult.status;
      }

      if (status !== "granted") {
        console.log("Push notification permission not granted");
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.manifest?.extra?.eas?.projectId;

      if (!projectId) {
        throw new Error("Project ID not found");
      }

      const pushToken = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      const platform = Platform.OS;

      await registerPushToken(pushToken, platform);
    } catch (err) {
      console.error("Failed to register for push notifications:", err);
    }
  };

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

