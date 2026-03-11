import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onClose: () => void;
    actionLabel?: string;
    onAction?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    type,
    title,
    message,
    onClose,
    actionLabel,
    onAction
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={30} style={StyleSheet.absoluteFill} />
                <View style={styles.alertContainer}>
                    <LinearGradient
                        colors={['#1F1F2E', '#161622']}
                        style={styles.gradient}
                    >
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <View style={styles.buttonContainer}>
                            {actionLabel && onAction && (
                                <TouchableOpacity
                                    style={[styles.button, styles.primaryButton]}
                                    onPress={onAction}
                                >
                                    <Text style={styles.buttonText}>{actionLabel}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.button, actionLabel ? styles.secondaryButton : styles.primaryButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.buttonText}>{actionLabel ? 'Cancel' : 'Okay'}</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: width * 0.85,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2D2D3F',
    },
    gradient: {
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    primaryButton: {
        backgroundColor: '#8A2BE2',
    },
    secondaryButton: {
        backgroundColor: '#2D2D3F',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
