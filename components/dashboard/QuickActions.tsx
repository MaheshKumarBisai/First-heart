import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Film, QrCode } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const ActionButton = ({ icon: Icon, label, onPress }: any) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.buttonWrapper}>
        <LinearGradient
            colors={['#1F1F2E', '#2D2D3F']}
            style={styles.button}
        >
            <View style={styles.iconContainer}>
                <LinearGradient
                    colors={['#8A2BE2', '#4B0082']}
                    style={styles.iconGradient}
                >
                    <Icon color="#FFF" size={24} />
                </LinearGradient>
            </View>
            <Text style={styles.label}>{label}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

export const QuickActions = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>QUICK ACTIONS</Text>
            <View style={styles.row}>
                <ActionButton
                    icon={QrCode}
                    label="Scan Tickets"
                    onPress={() => router.push('/scan')}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    buttonWrapper: {
        flex: 1,
    },
    button: {
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
    },
    iconContainer: {
        marginBottom: 12,
        shadowColor: '#8A2BE2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    iconGradient: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
