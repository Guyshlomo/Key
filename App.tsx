import React, { useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import * as Location from 'expo-location';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request Location Permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert(
          'הרשאת מיקום נדרשת',
          'האפליקציה זקוקה להרשאת מיקום כדי לפעול. אנא אפשר גישה להגדרות המיקום.',
          [{ text: 'אישור' }]
        );
      }

      // Request Background Location Permission (for better accuracy)
      if (Platform.OS === 'ios') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.log('Background location permission not granted');
        }
      }

      // Request Bluetooth Permission (Android)
      if (Platform.OS === 'android') {
        try {
          const bluetoothConnectGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
              title: 'הרשאת בלוטות\' נדרשת',
              message: 'האפליקציה זקוקה להרשאת בלוטות\' כדי להתחבר למכשירים.',
              buttonNeutral: 'שאל אותי מאוחר יותר',
              buttonNegative: 'ביטול',
              buttonPositive: 'אישור',
            }
          );

          const bluetoothScanGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
              title: 'הרשאת סריקת בלוטות\' נדרשת',
              message: 'האפליקציה זקוקה להרשאת סריקת בלוטות\' כדי לחפש מכשירים.',
              buttonNeutral: 'שאל אותי מאוחר יותר',
              buttonNegative: 'ביטול',
              buttonPositive: 'אישור',
            }
          );

          if (bluetoothConnectGranted !== PermissionsAndroid.RESULTS.GRANTED ||
              bluetoothScanGranted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              'הרשאת בלוטות\' נדרשת',
              'האפליקציה זקוקה להרשאות בלוטות\' כדי לפעול. אנא אפשר גישה לבלוטות\' בהגדרות.',
              [{ text: 'אישור' }]
            );
          }
        } catch (err) {
          console.warn('Bluetooth permission error:', err);
        }
      }

      // For iOS, Bluetooth permissions are handled automatically when trying to use Bluetooth
      // No explicit permission request needed for iOS
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

