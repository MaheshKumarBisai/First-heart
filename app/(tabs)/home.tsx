import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/dashboard/Header';
import { RevenueCard } from '../../components/dashboard/RevenueCard';
import { StatsRow } from '../../components/dashboard/StatsRow';
import { SalesChart } from '../../components/dashboard/SalesChart';
import { QuickActions } from '../../components/dashboard/QuickActions';

import { Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { stats, loading, error, refetch } = useDashboardStats();

    const displayStats = stats || {
        revenue_today: 0,
        tickets_sold_today: 0,
        occupancy_percentage: 0,
        active_movies_count: 0,
        sales_trend: [0, 0, 0, 0, 0, 0, 0]
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#8A2BE2" />}
            >
                <Header />
                <RevenueCard
                    amount={displayStats.revenue_today}
                />
                <StatsRow
                    tickets={displayStats.tickets_sold_today}
                    occupancy={displayStats.occupancy_percentage}
                />
                <QuickActions />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B15' },
    content: { padding: width * 0.05 },
});
