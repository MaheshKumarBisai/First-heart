import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { endpoints } from '../config/api';

export interface UserProfile {
    id: number;
    name: string | null;
    email: string | null;
    mobile: string | null;
    avatar_url: string | null;
    is_verified: boolean;
}

export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('token');
            const response = await fetch(endpoints.profile, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            setProfile(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: { name?: string; email?: string; mobile?: string; avatar_url?: string }) => {
        try {
            setUpdating(true);
            const token = await SecureStore.getItemAsync('token');
            const response = await fetch(endpoints.profile, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to update profile');
            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            return updatedProfile;
        } catch (err: any) {
            throw err;
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return { profile, loading, updating, error, refetch: fetchProfile, updateProfile };
}
