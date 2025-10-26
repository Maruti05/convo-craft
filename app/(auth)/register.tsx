import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/hooks/useAuth';
import { toFriendlyError } from '@/utils/errors';
import { registerSchema, validate } from '@/utils/validation';
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

const Register = () => {
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const [errors, setErrors] = useState<{ 
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>({});

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

  // Password strength calculation
  const getPasswordStrength = (pass: string): { strength: number; label: string; color: string } => {
    if (!pass) return { strength: 0, label: '', color: '#E2E8F0' };
    
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.length >= 12) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;

    if (strength <= 2) return { strength: 1, label: 'Weak', color: '#EF4444' };
    if (strength <= 3) return { strength: 2, label: 'Fair', color: '#F59E0B' };
    if (strength <= 4) return { strength: 3, label: 'Good', color: '#10B981' };
    return { strength: 4, label: 'Strong', color: '#10B981' };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSignUpPress = async () => {
    Keyboard.dismiss();
    setErrors({});

    // Validate terms
    if (!agreedToTerms) {
      setErrors({ terms: 'Please accept the terms and conditions' });
      return;
    }

    const res = validate(registerSchema, { 
      firstName, 
      lastName, 
      email: emailAddress, 
      password 
    });

    if (!res.ok) {
      // Parse validation errors
      const errorMsg = res.message;
      if (errorMsg.toLowerCase().includes('first')) {
        setErrors({ firstName: errorMsg });
      } else if (errorMsg.toLowerCase().includes('last')) {
        setErrors({ lastName: errorMsg });
      } else if (errorMsg.toLowerCase().includes('email')) {
        setErrors({ email: errorMsg });
      } else if (errorMsg.toLowerCase().includes('password')) {
        setErrors({ password: errorMsg });
      } else {
        setErrors({ email: errorMsg });
      }
      return;
    }

    try {
      await signUp(
        res.value.email, 
        res.value.password, 
        { 
          firstName: res.value.firstName, 
          lastName: res.value.lastName 
        }
      );
      
      // Success - navigate to login
      router.replace('/(auth)/login');
    } catch (e) {
      setErrors({ email: toFriendlyError(e) });
    }
  };

  const handleFieldChange = (
    field: 'firstName' | 'lastName' | 'email' | 'password',
    value: string
  ) => {
    switch (field) {
      case 'firstName':
        setFirstName(value);
        if (errors.firstName) setErrors({ ...errors, firstName: undefined });
        break;
      case 'lastName':
        setLastName(value);
        if (errors.lastName) setErrors({ ...errors, lastName: undefined });
        break;
      case 'email':
        setEmailAddress(value);
        if (errors.email) setErrors({ ...errors, email: undefined });
        break;
      case 'password':
        setPassword(value);
        if (errors.password) setErrors({ ...errors, password: undefined });
        break;
    }
  };

  return (
    <Screen>
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
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
                      <Ionicons name="person-add" size={44} color="#fff" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.logoTitle}>Create Account</Text>
                  <Text style={styles.logoSubtitle}>Join us and start your journey</Text>
                </Animated.View>

                {/* Register Card */}
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
                  {/* General Error Message */}
                  {errors.email && !errors.firstName && !errors.lastName && !errors.password && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <Text style={styles.errorText}>{errors.email}</Text>
                    </View>
                  )}

                  {/* Terms Error */}
                  {errors.terms && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <Text style={styles.errorText}>{errors.terms}</Text>
                    </View>
                  )}

                  {/* Name Row */}
                  <View style={styles.nameRow}>
                    {/* First Name */}
                    <View style={styles.nameInput}>
                      <Text style={styles.inputLabel}>First Name</Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          firstNameFocused && styles.inputWrapperFocused,
                          errors.firstName && styles.inputWrapperError,
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color={firstNameFocused ? '#6366F1' : '#94A3B8'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          autoCapitalize="words"
                          value={firstName}
                          placeholder="John"
                          placeholderTextColor="#94A3B8"
                          onChangeText={(t) => handleFieldChange('firstName', t)}
                          onFocus={() => setFirstNameFocused(true)}
                          onBlur={() => setFirstNameFocused(false)}
                          editable={!loading}
                          returnKeyType="next"
                        />
                      </View>
                      {errors.firstName && (
                        <Text style={styles.fieldError}>{errors.firstName}</Text>
                      )}
                    </View>

                    {/* Last Name */}
                    <View style={styles.nameInput}>
                      <Text style={styles.inputLabel}>Last Name</Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          lastNameFocused && styles.inputWrapperFocused,
                          errors.lastName && styles.inputWrapperError,
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color={lastNameFocused ? '#6366F1' : '#94A3B8'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          autoCapitalize="words"
                          value={lastName}
                          placeholder="Doe"
                          placeholderTextColor="#94A3B8"
                          onChangeText={(t) => handleFieldChange('lastName', t)}
                          onFocus={() => setLastNameFocused(true)}
                          onBlur={() => setLastNameFocused(false)}
                          editable={!loading}
                          returnKeyType="next"
                        />
                      </View>
                      {errors.lastName && (
                        <Text style={styles.fieldError}>{errors.lastName}</Text>
                      )}
                    </View>
                  </View>

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
                        placeholder="john.doe@example.com"
                        placeholderTextColor="#94A3B8"
                        onChangeText={(t) => handleFieldChange('email', t)}
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
                    {errors.email && errors.firstName && errors.lastName && (
                      <Text style={styles.fieldError}>{errors.email}</Text>
                    )}
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
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
                        placeholder="Create a strong password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPassword}
                        onChangeText={(t) => handleFieldChange('password', t)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        editable={!loading}
                        returnKeyType="done"
                        onSubmitEditing={onSignUpPress}
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
                    {errors.password && (
                      <Text style={styles.fieldError}>{errors.password}</Text>
                    )}

                    {/* Password Strength Indicator */}
                    {password.length > 0 && (
                      <View style={styles.strengthContainer}>
                        <View style={styles.strengthBars}>
                          {[1, 2, 3, 4].map((level) => (
                            <View
                              key={level}
                              style={[
                                styles.strengthBar,
                                level <= passwordStrength.strength && {
                                  backgroundColor: passwordStrength.color,
                                },
                              ]}
                            />
                          ))}
                        </View>
                        <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                          {passwordStrength.label}
                        </Text>
                      </View>
                    )}

                    {/* Password Requirements */}
                    {password.length > 0 && (
                      <View style={styles.requirementsContainer}>
                        <PasswordRequirement
                          met={password.length >= 8}
                          text="At least 8 characters"
                        />
                        <PasswordRequirement
                          met={/[A-Z]/.test(password) && /[a-z]/.test(password)}
                          text="Upper & lowercase letters"
                        />
                        <PasswordRequirement
                          met={/[0-9]/.test(password)}
                          text="At least one number"
                        />
                      </View>
                    )}
                  </View>

                  {/* Terms and Conditions */}
                  <Pressable
                    style={styles.checkboxContainer}
                    onPress={() => {
                      setAgreedToTerms(!agreedToTerms);
                      if (errors.terms) setErrors({ ...errors, terms: undefined });
                    }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        agreedToTerms && styles.checkboxChecked,
                        errors.terms && styles.checkboxError,
                      ]}
                    >
                      {agreedToTerms && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxText}>
                      I agree to the{' '}
                      <Text style={styles.linkInline}>Terms & Conditions</Text>
                      {' '}and{' '}
                      <Text style={styles.linkInline}>Privacy Policy</Text>
                    </Text>
                  </Pressable>

                  {/* Sign Up Button */}
                  <Pressable
                    style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                    onPress={onSignUpPress}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#6366F1', '#8B5CF6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.signUpGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Text style={styles.signUpText}>Create Account</Text>
                          <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>

                  {/* Divider */}
                  {/* <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or sign up with</Text>
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
                  <Text style={styles.footerText}>Already have an account?</Text>
                  <Link href="/(auth)/login" asChild>
                    <Pressable>
                      <Text style={styles.footerLink}>Sign In</Text>
                    </Pressable>
                  </Link>
                </Animated.View>

                {/* Decorative Elements */}
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />
                <View style={styles.decorCircle3} />
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Screen>
  );
};

// Password Requirement Component
const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <View style={styles.requirement}>
    <Ionicons
      name={met ? 'checkmark-circle' : 'ellipse-outline'}
      size={16}
      color={met ? '#10B981' : '#94A3B8'}
    />
    <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
      {text}
    </Text>
  </View>
);

export default Register;

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
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
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
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
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
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },

  // Name Row
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
  },

  // Input Container
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
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
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Password Strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Password Requirements
  requirementsContainer: {
    marginTop: 8,
    gap: 6,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  requirementTextMet: {
    color: '#10B981',
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkboxError: {
    borderColor: '#EF4444',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  linkInline: {
    color: '#6366F1',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Sign Up Button
  signUpButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Social Buttons
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
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
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
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
    top: '30%',
    left: -50,
  },
});