import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { endpoints } from '../config/api';

export async function registerForPushNotificationsAsync() {
    if (Constants.appOwnership === 'expo') {
        console.log('Push notifications are not supported in Expo Go (SDK 53+). Please use a development build.');
        return;
    }

    try {
        const Notifications = require('expo-notifications');
        let token;

        if (Platform.OS === 'web') {
            return;
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Expo Push Token:', token);
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    } catch (error) {
        console.warn('Notifications registration failed (expected if in Expo Go):', error);
        return null;
    }
}

export async function savePushToken(token: string) {
    try {
        const authToken = await SecureStore.getItemAsync('token');
        if (!authToken) return;

        const response = await fetch(endpoints.profile, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ push_token: token })
        });

        if (response.ok) {
            console.log('Push token saved to server');
        }
    } catch (error) {
        console.error('Failed to save push token', error);
    }
}
