import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const RevenueCard = ({ amount = 0 }: { amount?: number }) => {
    return (
        <View style={styles.wrapper}>
            <LinearGradient
                colors={['#1F1F2E', '#14141F']}
                style={styles.container}
            >
                <Text style={styles.label}>Today's Revenue</Text>

                <Text style={styles.amount}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}
                </Text>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
        borderRadius: 24,
        padding: 1,
        backgroundColor: '#2D2D3F',
        overflow: 'hidden',
    },
    container: {
        padding: 20,
        borderRadius: 24,
    },
    label: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 12,
    },
    amount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        textShadowColor: 'rgba(139, 92, 246, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
});
