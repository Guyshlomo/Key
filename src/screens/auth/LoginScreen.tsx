import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import { colors } from "../../theme";
import { login } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    try {
      const response = await login(username, password);
      
      // Store tokens
      if (response.accessToken) {
        await AsyncStorage.setItem("accessToken", response.accessToken);
        if (response.refreshToken) {
          await AsyncStorage.setItem("refreshToken", response.refreshToken);
        }
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileSetup' }],
      });
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../images/Logo.png')} 
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.subtitle}>The key for new reality.</Text>
      <Text style={styles.description}>
        Enter the credentials provided with your bracelet.
      </Text>

      <View style={styles.form}>
        <TextInput 
          placeholder="Username" 
          style={styles.input} 
          placeholderTextColor={"#000"}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <View style={styles.passwordContainer}>
          <TextInput 
            placeholder="Password" 
            style={styles.passwordInput} 
            placeholderTextColor={"#000"}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={colors.urbanGray}
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Enter Community</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoImage: {
    width: 180,
    height: 180,
    marginBottom: 20,
    borderRadius: 300, // Makes it circular if the image is square
  },
  subtitle: {
    fontSize: 24,
    color: "#000",
    marginBottom: 10,
    fontWeight: "600",
    fontFamily: "sf-pro-display-thin",
  },
  description: {
    fontSize: 16,
    color: "#000",
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    fontFamily: "sf-pro-display-thin",
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 0.2,
    borderColor: "#000",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: colors.deepBlack,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 20,
  },
  passwordInput: {
    backgroundColor: "#fff",
    borderWidth: 0.2,
    borderColor: "#000",
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: colors.deepBlack,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 4,
  },
  button: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 0.2,
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    color: colors.deepBlack,  
    fontFamily: "sf-pro-display-thin",
  },
});
