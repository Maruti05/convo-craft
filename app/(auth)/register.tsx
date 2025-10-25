import { Link, useRouter } from "expo-router";
import { useAuth } from '@/hooks/useAuth'
import { validate, registerSchema } from '@/utils/validation'
import { toFriendlyError } from '@/utils/errors'
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Screen } from '@/components/layout/Screen'

const Register = () => {
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateY, {
      toValue: 0,
      duration: 700,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const onSignUpPress = async () => {
    const res = validate(registerSchema, { firstName, lastName, email: emailAddress, password });
    if (!res.ok) {
      Alert.alert("Error", res.message);
      return;
    }
    try {
      await signUp(res.value.email, res.value.password, { firstName: res.value.firstName, lastName: res.value.lastName });
      Alert.alert("Success", "Registration successful! Please check your email to verify.");
    } catch (e) {
      Alert.alert("Error", toFriendlyError(e));
    }
  };

  return (
    <Screen backgroundColor="#F3F4F6" keyboardVerticalOffset={80}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            value={firstName}
            placeholder="First Name"
            placeholderTextColor="#9CA3AF"
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            value={lastName}
            placeholder="Last Name"
            placeholderTextColor="#9CA3AF"
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            value={emailAddress}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#9CA3AF"
            onChangeText={setEmailAddress}
          />
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#9CA3AF"
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={onSignUpPress}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Continue'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Text style={styles.linkText}>Login</Text>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
};

export default Register;

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 15,
    color: "#6B7280",
  },
  linkText: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
  },
});
