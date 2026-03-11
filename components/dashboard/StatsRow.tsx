import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ticket, Armchair } from 'lucide-react-native';

const StatCard = ({ icon: Icon, label, value, progress, color }: any) => (
    <View style={styles.card}>
        <Icon size={20} color={color} style={{ marginBottom: 12 }} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>

        <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
    </View>
);

export const StatsRow = ({ tickets = 0, occupancy = 0 }: { tickets?: number, occupancy?: number }) => {
    // Dynamic target for tickets sold progress bar (e.g., 100 as a milestone)
    const ticketTarget = 100;
    const ticketProgress = Math.min((tickets / ticketTarget) * 100, 100);

    return (
        <View style={styles.container}>
            <StatCard
                icon={Ticket}
                label="Tickets Sold"
                value={tickets.toString()}
                progress={ticketProgress}
                color="#A855F7" // Purple
            />
            <StatCard
                icon={Armchair}
                label="Occupancy"
                value={`${occupancy}%`}
                progress={occupancy}
                color="#A855F7"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    card: {
        flex: 1,
        backgroundColor: '#1F1F2E',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2D2D3F',
    },
    label: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#2D2D3F',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
});
