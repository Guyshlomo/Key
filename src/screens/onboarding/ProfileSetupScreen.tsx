import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { colors } from "../../theme";
import { updateProfile } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Conditional import for DateTimePicker
let DateTimePicker: any = null;
try {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
} catch (e) {
  // Silent fail - will show alert when user tries to use it
}

// Conditional import for expo-image-picker
let ImagePicker: any = null;
try {
  ImagePicker = require("expo-image-picker");
} catch (e) {
  // Silent fail - will show alert when user tries to use it
}

interface ProfileSetupProps {
  navigation: any;
}

export default function ProfileSetupScreen({ navigation }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);

  const communities = [
    { id: "dating", label: "Dates" },
    { id: "sport", label: "Running Club" },
    { id: "social", label: "Friends"},
    { id: "music", label: "Play Guitar"},
    { id: "adventure", label: "Adventure"},
    { id: "work", label: "Work" },
    { id: "entrepreneurship", label: "Entrepreneurship"},
  ];

  const pickImage = async () => {
    if (!ImagePicker) {
      Alert.alert(
        "Image Picker Not Available",
        "Please install expo-image-picker by running: npm install expo-image-picker"
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!name || !email || !birthDate || !username || !password) {
        Alert.alert("Missing Info", "Please fill in all fields, including username and password");
        return;
      }
      setStep(2);
    } else {
      // Save profile and navigate to main app
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token || token.trim() === "") {
          Alert.alert("Session Expired", "Please login again to continue");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
          return;
        }

        // Map communities to intents (matching the intents table schema)
        const intents: any = {
          dating: selectedCommunities.includes("dating"),
          sport_partner: selectedCommunities.includes("sport"),
          social: selectedCommunities.includes("social"),
          entrepreneurship: selectedCommunities.includes("entrepreneurship"),
          work: selectedCommunities.includes("work"),
          games: selectedCommunities.includes("music") || selectedCommunities.includes("adventure"), // Map music/adventure to games if needed
        };

        await updateProfile(token, {
          display_name: name,
          email: email,
          birth_date: formatDate(birthDate),
          profile_image: profilePicture || undefined,
          username,
          password,
          intents,
        });

        navigation.reset({
          index: 0,
          routes: [{ name: "MainApp" }],
        });
      } catch (error: any) {
        const errorMessage = error.message || "Failed to save profile";
        
        // Check if it's an authentication error
        if (errorMessage.includes("Invalid token") || errorMessage.includes("Unauthorized") || errorMessage.includes("401")) {
          Alert.alert(
            "Session Expired",
            "Your session has expired. Please login again to continue.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Clear stored tokens
                  AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert("Error", errorMessage);
        }
      }
    }
  };

  const toggleCommunity = (id: string) => {
    setSelectedCommunities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(step / 2) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {step} of 2
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          // Step 1: Basic Info
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Create Your Profile</Text>
            <Text style={styles.subtitle}>
              Let's start with some basic information
            </Text>

            {/* Profile Picture */}
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickImage}
            >
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>+</Text>
                  <Text style={styles.placeholderLabel}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Name */}
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              placeholderTextColor={"#000"}
              value={name}
              onChangeText={setName}
            />

            {/* Username */}
            <TextInput
              placeholder="Set new username"
              style={styles.input}
              placeholderTextColor={"#000"}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />

            {/* Password */}
            <TextInput
              placeholder="Set new password"
              style={styles.input}
              placeholderTextColor={"#000"}
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
                 {/* Email */}
                 <TextInput
              placeholder="Email"
              style={styles.input}
              placeholderTextColor={"#000"}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Birth Date */}
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                if (!DateTimePicker) {
                  Alert.alert(
                    "Date Picker Not Available",
                    "Please install @react-native-community/datetimepicker by running: npm install @react-native-community/datetimepicker"
                  );
                  return;
                }
                setShowDatePicker(true);
              }}
            >
              <Text
                style={[
                  styles.dateInputText,
                  !birthDate && styles.dateInputPlaceholder,
                ]}
              >
                {birthDate ? formatDate(birthDate) : "Birth Date (YYYY-MM-DD)"}
              </Text>
              <Text style={styles.datePickerIcon}>📅</Text>
            </TouchableOpacity>

            {showDatePicker && DateTimePicker && (
              <DateTimePicker
                value={birthDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1950, 0, 1)}
              />
            )}
          </View>
        ) : (
          // Step 2: Communities/Needs
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What are you looking for?</Text>
            <Text style={styles.subtitle}>
              Select the communities that interest you
            </Text>

            <View style={styles.communitiesGrid}>
              {communities.map((community) => {
                const isSelected = selectedCommunities.includes(community.id);
                return (
                  <TouchableOpacity
                    key={community.id}
                    style={[
                      styles.communityCircle,
                      isSelected && styles.communityCircleSelected,
                    ]}
                    onPress={() => toggleCommunity(community.id)}
                  >
                
                    <Text
                      style={[
                        styles.communityLabel,
                        isSelected && styles.communityLabelSelected,
                      ]}
                    >
                      {community.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {step === 1 ? "Next" : "Complete"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  progressContainer: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.cloudGray,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.urbanGray,
    textAlign: "right",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    color: colors.deepBlack,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "sf-pro-display-thin",
  },
  subtitle: {
    fontSize: 16,
    color: "#000",
    marginBottom: 30,
    textAlign: "center",
    fontFamily: "sf-pro-display-thin",
    
  },
  imagePicker: {
    alignSelf: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.brandTurquoise,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 32,
    color: "#000",
    marginBottom: 4,
    fontFamily: "sf-pro-display-thin",
  },
  placeholderLabel: {
    fontSize: 12,
    color: "#000",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 0.2,
    borderColor: "#000",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: "#000",
  },
  dateInput: {
    backgroundColor: "#fff",
    borderWidth: 0.2,
    borderColor: "#000",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateInputText: {
    fontSize: 16,
    flex: 1,
  },
  dateInputPlaceholder: {
    color: "#000",
  },
  datePickerIcon: {
    fontSize: 20,
  },
  communitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  communityCircle: {
    width: 140,
    height: 50,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: colors.cloudGray,
    alignItems: "center",
    justifyContent: "center",
    margin: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  communityCircleSelected: {
    borderColor: "#FF8E8E",
    borderWidth: 3,
    backgroundColor: "#FF8E8E",
  },
  communityIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  communityLabel: {
    fontSize: 12,
    color: colors.deepBlack,
    textAlign: "center",
    fontWeight: "300",
    fontFamily: "sf-pro-display-thin",
  },
  communityLabelSelected: {
    color: "#000",
    fontFamily: "sf-pro-display-thin",
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopColor: colors.cloudGray,
    paddingBottom: 50,
  },
  nextButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cloudGray,
  },
  nextButtonText: {
    fontSize: 16,
    color: colors.deepBlack,
    fontFamily: "sf-pro-display-thin",
  },
});

