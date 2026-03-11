import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PrimaryButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
}

export const PrimaryButton = ({ title, loading, style, disabled, ...props }: PrimaryButtonProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={disabled || loading}
            style={[styles.wrapper, style]}
            {...props}
        >
            <LinearGradient
                colors={disabled ? ['#4B4B5B', '#4B4B5B'] : ['#8A2BE2', '#4B0082']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.text}>{title}</Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    gradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
