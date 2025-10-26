import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/hooks/useAuth';
import { toFriendlyError } from '@/utils/errors';
import { loginSchema, validate } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";

const Login = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signIn, loading } = useAuth();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSignInPress = async () => {
    Keyboard.dismiss();
    
    // Clear previous errors
    setErrors({});

    // Validate inputs
    const res = validate(loginSchema, { email: emailAddress, password });
    if (!res.ok) {
      setErrors({ email: res.message });
      return;
    }

    try {
      await signIn(res.value.email, res.value.password);
      router.replace('/(tabs)');
    } catch (e) {
      setErrors({ email: toFriendlyError(e) });
    }
  };

  const handleEmailChange = (text: string) => {
    setEmailAddress(text);
    if (errors.email) setErrors({ ...errors, email: undefined });
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) setErrors({ ...errors, password: undefined });
  };

  return (
    <Screen>
      <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.container}>
                {/* Animated Logo Section */}
                <Animated.View
                  style={[
                    styles.logoSection,
                    {
                      opacity: logoAnim,
                      transform: [
                        {
                          scale: logoAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.logoContainer}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                      style={styles.logoGradient}
                    >
                      <Ionicons name="chatbubbles" size={48} color="#fff" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.logoTitle}>Welcome Back</Text>
                  <Text style={styles.logoSubtitle}>Sign in to continue your journey</Text>
                </Animated.View>

                {/* Login Card */}
                <Animated.View
                  style={[
                    styles.card,
                    {
                      opacity: fadeAnim,
                      transform: [
                        { translateY: slideAnim },
                        { scale: cardAnim },
                      ],
                    },
                  ]}
                >
                  {/* Error Message */}
                  {(errors.email || errors.password) && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <Text style={styles.errorText}>
                        {errors.email || errors.password}
                      </Text>
                    </View>
                  )}

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        emailFocused && styles.inputWrapperFocused,
                        errors.email && styles.inputWrapperError,
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
                        value={emailAddress}
                        placeholder="Enter your email"
                        placeholderTextColor="#94A3B8"
                        onChangeText={handleEmailChange}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        editable={!loading}
                        returnKeyType="next"
                      />
                      {emailAddress.length > 0 && (
                        <Pressable
                          onPress={() => setEmailAddress('')}
                          style={styles.clearButton}
                        >
                          <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Password</Text>
                      <Link href="/(tabs)/forgot-password" asChild>
                        <Pressable>
                          <Text style={styles.forgotText}>Forgot?</Text>
                        </Pressable>
                      </Link>
                    </View>
                    <View
                      style={[
                        styles.inputWrapper,
                        passwordFocused && styles.inputWrapperFocused,
                        errors.password && styles.inputWrapperError,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={passwordFocused ? '#6366F1' : '#94A3B8'}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={password}
                        placeholder="Enter your password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPassword}
                        onChangeText={handlePasswordChange}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        editable={!loading}
                        returnKeyType="done"
                        onSubmitEditing={onSignInPress}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.clearButton}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={20}
                          color="#94A3B8"
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Sign In Button */}
                  <Pressable
                    style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                    onPress={onSignInPress}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#6366F1', '#8B5CF6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.signInGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Text style={styles.signInText}>Sign In</Text>
                          <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>

                  {/* Divider */}
                  {/* <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.divider} />
                  </View> */}

                  {/* Social Login Buttons */}
                  {/* <View style={styles.socialContainer}>
                    <Pressable style={styles.socialButton}>
                      <Ionicons name="logo-google" size={22} color="#EA4335" />
                    </Pressable>
                    <Pressable style={styles.socialButton}>
                      <Ionicons name="logo-apple" size={22} color="#000" />
                    </Pressable>
                    <Pressable style={styles.socialButton}>
                      <Ionicons name="logo-facebook" size={22} color="#1877F2" />
                    </Pressable>
                  </View> */}
                </Animated.View>

                {/* Footer */}
                <Animated.View
                  style={[
                    styles.footer,
                    {
                      opacity: fadeAnim,
                    },
                  ]}
                >
                  <Text style={styles.footerText}>Don't have an account?</Text>
                  <Link href="/(auth)/register" asChild>
                    <Pressable>
                      <Text style={styles.footerLink}>Sign Up</Text>
                    </Pressable>
                  </Link>
                </Animated.View>

                {/* Decorative Elements */}
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />
              </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </LinearGradient>
      </ScrollView>
    </Screen>
  );
};

export default Login;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    position: 'relative',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
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
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
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

  // Sign In Button
  signInButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  signInText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  // Social Buttons
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Decorative Elements
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -100,
    right: -50,
    opacity: 0.5,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -75,
    left: -40,
    opacity: 0.5,
  },
});