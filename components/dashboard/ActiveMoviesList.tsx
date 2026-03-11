import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const MovieItem = ({ title, hall, time, occupancy, image }: any) => (
    <View style={styles.item}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.info}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{hall} • {time}</Text>
        </View>
        <View style={styles.stats}>
            <Text style={styles.occupancy}>{occupancy}%</Text>
            <Text style={styles.status}>Full</Text>
        </View>
    </View>
);

export const ActiveMoviesList = ({ count = 4 }: { count?: number }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ACTIVE NOW</Text>
                <Text style={styles.subtitle}>{count} THEATERS ACTIVE</Text>
            </View>

            <View style={styles.list}>
                <MovieItem
                    title="Neon Drifters: 2049"
                    hall="Hall 4"
                    time="Ends in 45m"
                    occupancy={85}
                    image="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"
                />
                <MovieItem
                    title="Galaxy Guardians"
                    hall="Hall 1"
                    time="Starting now"
                    occupancy={92}
                    image="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 80, // Space for tab bar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    subtitle: {
        color: '#8A2BE2',
        fontSize: 10,
        fontWeight: 'bold',
    },
    list: {
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F1F2E',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2D2D3F',
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: 12,
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    stats: {
        alignItems: 'flex-end',
    },
    occupancy: {
        color: '#A855F7',
        fontSize: 16,
        fontWeight: 'bold',
    },
    status: {
        color: '#9CA3AF',
        fontSize: 10,
    },
});
