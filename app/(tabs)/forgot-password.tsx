import { Screen } from '@/components/layout/Screen';
import { getSupabaseClient } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from "react-native";

type FlowState = 'input' | 'sending' | 'success' | 'error';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>('input');
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const supabase = getSupabaseClient();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnim = useRef(new Animated.Value(0.9)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(iconAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (flowState === 'success') {
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [flowState]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    setErrorMessage("");

    // Validation
    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      setFlowState('error');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      setFlowState('error');
      return;
    }

    setFlowState('sending');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setFlowState('success');
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to send reset email. Please try again.");
      setFlowState('error');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (flowState === 'error') {
      setFlowState('input');
      setErrorMessage("");
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const renderIcon = () => {
    const iconScale = iconAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });

    const iconRotate = iconAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    if (flowState === 'success') {
      return (
        <Animated.View
          style={[
            styles.iconContainer,
            styles.successIconContainer,
            {
              transform: [
                { scale: successAnim },
              ],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale: iconScale },
              { rotate: iconRotate },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)']}
          style={styles.iconGradient}
        >
          <Ionicons name="lock-closed" size={48} color="#6366F1" />
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderContent = () => {
    if (flowState === 'success') {
      return (
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: successAnim,
              transform: [
                {
                  translateY: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.successTitle}>Check Your Email! 📧</Text>
          <Text style={styles.successDescription}>
            We've sent a password reset link to
          </Text>
          <Text style={styles.emailHighlight}>{email}</Text>
          <Text style={styles.successDescription}>
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </Text>

          <View style={styles.successTips}>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#6366F1" />
              <Text style={styles.tipText}>Check your spam folder if you don't see it</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#6366F1" />
              <Text style={styles.tipText}>The link expires in 60 minutes</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#6366F1" />
              <Text style={styles.tipText}>You can close this page safely</Text>
            </View>
          </View>

          <Pressable style={styles.secondaryButton} onPress={handleBackToLogin}>
            <Ionicons name="arrow-back" size={20} color="#6366F1" />
            <Text style={styles.secondaryButtonText}>Back to Login</Text>
          </Pressable>

          <Pressable
            style={styles.resendButton}
            onPress={() => {
              setFlowState('input');
              setEmail('');
            }}
          >
            <Text style={styles.resendText}>Didn't receive email? Resend</Text>
          </Pressable>
        </Animated.View>
      );
    }

    return (
      <>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          No worries! Enter your email and we'll send you reset instructions.
        </Text>

        {/* Error Message */}
        {flowState === 'error' && errorMessage && (
          <Animated.View
            style={styles.errorContainer}
          >
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View
            style={[
              styles.inputWrapper,
              emailFocused && styles.inputWrapperFocused,
              flowState === 'error' && styles.inputWrapperError,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={emailFocused ? '#6366F1' : '#94A3B8'}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              onChangeText={handleEmailChange}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              editable={flowState !== 'sending'}
              autoFocus
            />
            {email.length > 0 && flowState !== 'sending' && (
              <Pressable onPress={() => setEmail('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Reset Button */}
        <Pressable
          style={[
            styles.resetButton,
            flowState === 'sending' && styles.resetButtonDisabled,
          ]}
          onPress={handleResetPassword}
          disabled={flowState === 'sending'}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.resetGradient}
          >
            {flowState === 'sending' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.resetText}>Send Reset Link</Text>
                <Ionicons name="paper-plane" size={18} color="#fff" />
              </>
            )}
          </LinearGradient>
        </Pressable>

        {/* Back to Login */}
        <Pressable style={styles.backButton} onPress={handleBackToLogin}>
          <Ionicons name="arrow-back" size={18} color="#64748B" />
          <Text style={styles.backText}>Back to Login</Text>
        </Pressable>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
          <Text style={styles.infoText}>
            You'll receive an email with a secure link to reset your password.
          </Text>
        </View>
      </>
    );
  };

  return (
    <Screen>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Icon Section */}
            <Animated.View
              style={[
                styles.iconSection,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              {renderIcon()}
            </Animated.View>

            {/* Content Card */}
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: cardAnim }],
                },
              ]}
            >
              {renderContent()}
            </Animated.View>

            {/* Decorative Elements */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <View style={styles.decorCircle3} />
          </View>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </Screen>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },

  // Icon Section
  iconSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  successIconContainer: {
    transform: [{ scale: 1 }],
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },

  // Title & Subtitle
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  // Error Container
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },

  // Input Container
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#fff',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },

  // Reset Button
  resetButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  resetText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4F46E5',
    lineHeight: 19,
    fontWeight: '500',
  },

  // Success State
  successContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emailHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 20,
    textAlign: 'center',
  },
  successTips: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
  resendButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  // Decorative Elements
  decorCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -90,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -70,
    left: -30,
  },
  decorCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: '40%',
    left: -50,
  },
});