import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useProfile } from '../../hooks/useProfile';
import { endpoints } from '../../config/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export const Header = () => {
    const { profile, loading } = useProfile();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            fetchUnreadCount();
        }, [])
    );

    const fetchUnreadCount = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) return;
            const response = await fetch(`${endpoints.notifications}/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const text = await response.text();
            if (!response.ok) {
                console.error(`Failed to fetch unread count (Status ${response.status}):`, text);
                return;
            }

            try {
                const data = JSON.parse(text);
                setUnreadCount(data.count || 0);
            } catch (parseError) {
                console.error("Failed to parse unread count JSON. Response was:", text);
            }
        } catch (error) {
            console.error("Network error fetching unread count:", error);
        }
    };

    const getAvatarUri = (url: string | null | undefined) => {
        if (!url) return 'https://ui-avatars.com/api/?name=M&background=1F1F2E&color=8A2BE2&size=200';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) {
            const baseUrl = endpoints.profile.split('/auth/me')[0];
            return `${baseUrl}${url}`;
        }
        return url;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const displayName = profile?.name || 'Merchant';

    return (
        <View style={styles.container}>
            <View style={styles.profileContainer}>
                <View style={styles.imageWrapper}>
                    {loading ? (
                        <View style={[styles.profileImage, styles.loaderContainer]}>
                            <ActivityIndicator size="small" color="#8A2BE2" />
                        </View>
                    ) : (
                        <Image
                            source={{ uri: getAvatarUri(profile?.avatar_url) }}
                            style={styles.profileImage}
                        />
                    )}
                    <View style={styles.onlineIndicator} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.roleText}>CINEMA PARTNER</Text>
                    <Text style={styles.greetingText}>{getGreeting()}, {displayName}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
                <View>
                    <Bell color="#FFF" size={20} />
                    {unreadCount > 0 && <View style={styles.notificationBadge} />}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    imageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#8A2BE2',
    },
    loaderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1F1F2E',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#000',
    },
    textContainer: {
        gap: 2,
    },
    roleText: {
        color: '#8A2BE2',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    greetingText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1F1F2E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2D2D3F',
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#1F1F2E',
    },
});
