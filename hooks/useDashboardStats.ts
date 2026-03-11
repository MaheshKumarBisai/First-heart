import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { endpoints } from '../config/api';

export interface DashboardStats {
    revenue_today: number;
    tickets_sold_today: number;
    occupancy_percentage: number;
    active_movies_count: number;
    sales_trend: number[];
}

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('token');
            if (!token) throw new Error("No auth token");

            const response = await fetch(endpoints.merchant.stats, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to fetch stats");
            }

            const data = await response.json();
            setStats(data);
            setError(null);
        } catch (err: any) {
            console.error("Dashboard Stats Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
};
