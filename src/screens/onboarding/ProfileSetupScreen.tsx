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
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import { colors } from "../../theme";
import { updateProfile, getCommunities, joinCommunity } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");
const ITEM_SIZE = 120; // Fixed size for consistent layout
const CANVAS_WIDTH = width * 2; // Even wider to allow spacing
const CANVAS_HEIGHT = 1000; // Taller
const SPACING = 10;

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

interface Community {
  id: string;
  name: string;
  category: string;
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
  const [communities, setCommunities] = useState<Community[]>([]);
  
  // Track scroll position
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const scrollX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        const data = await getCommunities(token);
        setCommunities(data);
      }
    } catch (error) {
      console.log("Failed to load communities", error);
    }
  };
  
  // Generate a pseudo-random position for each bubble based on index
  // Using a hexagonal-like grid to prevent overlap
  const getBubblePosition = (index: number) => {
    const cols = 3;
    // Increase spacing: cells are now much larger than the item itself
    const rowHeight = ITEM_SIZE * 1.2; 
    const colWidth = ITEM_SIZE * 1.2; 
    
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    // Offset every other row
    const xOffset = (row % 2) * (colWidth / 2);
    
    // Add some organic randomness but keep separated
    // Reduced jitter to prevent accidental overlap
    const jitterX = ((index * 13 + 7) % 15) - 7;
    const jitterY = ((index * 17 + 3) % 15) - 7;

    // Center the grid in the canvas
    const startX = (CANVAS_WIDTH - (cols * colWidth)) / 2;
    const startY = 50;

    let left = startX + col * colWidth + xOffset + jitterX;
    let top = startY + row * rowHeight + jitterY;
    
    return { top, left };
  };

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
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
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

        // Map selected communities categories to intents
        // This is a heuristic: if user selects a community of category 'sport', we set sport_partner=true
        const intents: any = {
          dating: false,
          sport_partner: false,
          social: false,
          entrepreneurship: false,
          work: false,
          games: false,
          nightlife: false,
        };

        selectedCommunities.forEach(communityId => {
          const comm = communities.find(c => c.id === communityId);
          if (comm) {
            switch (comm.category) {
              case 'sport': intents.sport_partner = true; break;
              case 'social': intents.social = true; break;
              case 'entrepreneurship': intents.entrepreneurship = true; break;
              case 'professionals': intents.work = true; break;
              case 'nightlife': intents.nightlife = true; break;
              case 'events': intents.social = true; break;
              // Add more mappings as needed
            }
          }
        });

        // Join selected communities
        const joinPromises = selectedCommunities.map(communityId => 
          joinCommunity(token, communityId)
        );
        await Promise.all(joinPromises);

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
              onPress={() => setShowDatePicker(true)}
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

            {showDatePicker && (
              Platform.OS === 'ios' ? (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={showDatePicker}
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={styles.modalDoneText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={birthDate || new Date(2000, 0, 1)}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1950, 0, 1)}
                        textColor="black"
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                <DateTimePicker
                  value={birthDate || new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1950, 0, 1)}
                />
              )
            )}
          </View>
        ) : (
          // Step 2: Communities/Needs
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What are you looking for?</Text>
            <Text style={styles.subtitle}>
              Pan around to explore communities
            </Text>

            <View style={styles.bubblesContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ width: CANVAS_WIDTH }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
              >
                <Animated.ScrollView
                  style={{ width: "100%", height: "100%" }}
                  contentContainerStyle={{ 
                    height: Math.max(CANVAS_HEIGHT, Math.ceil(communities.length / 2) * (ITEM_SIZE) + 200)
                  }}
                  showsVerticalScrollIndicator={false}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                >
                  <View style={{ height: CANVAS_HEIGHT, width: "100%" }}>
                    {communities.map((item, index) => {
                      const isSelected = selectedCommunities.includes(item.id);
                      const pos = getBubblePosition(index);
                      
                      // We need to animate scale based on both X and Y distance from center of viewport.
                      // Center of viewport in scroll coords:
                      // X: scrollX + width/2
                      // Y: scrollY + 200 (approx half of visible height)
                      
                      // This simplified version just combines X and Y scroll inputs
                      
                      const diffY = Animated.subtract(scrollY, pos.top - 200);
                      const diffX = Animated.subtract(scrollX, pos.left - width/2);
                      
                      // We can't do complex math like sqrt(x^2 + y^2) easily with native driver animated nodes
                      // without Reanimated. So we'll approximate by checking if both X and Y are close.
                      // Or simpler: just let them pulse based on Y for now, as 2D interpolation is tricky in pure RN Animated.
                      
                      const scale = scrollY.interpolate({
                        inputRange: [pos.top - 400, pos.top - 200, pos.top],
                        outputRange: [0.8, 1.15, 0.8],
                        extrapolate: "clamp",
                      });
                      
                      const translateX = scrollX.interpolate({
                         inputRange: [0, CANVAS_WIDTH - width],
                         outputRange: [0, 0], // Just to bind the listener, actual parallax could go here
                      });

                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.9}
                          onPress={() => toggleCommunity(item.id)}
                          style={{
                            position: "absolute",
                            top: pos.top,
                            left: pos.left,
                            zIndex: isSelected ? 10 : 1,
                          }}
                        >
                          <Animated.View
                            style={[
                              styles.bubble,
                              isSelected && styles.bubbleSelected,
                              {
                                transform: [{ scale }],
                                // opacity: isSelected ? 1 : 0.8,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.bubbleText,
                                isSelected && styles.bubbleTextSelected,
                              ]}
                            >
                              {item.name}
                            </Text>
                            {isSelected && (
                              <View style={styles.checkmarkBadge}>
                                <Text style={styles.checkmarkText}>✓</Text>
                              </View>
                            )}
                          </Animated.View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Animated.ScrollView>
              </ScrollView>
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
  bubblesContainer: {
    height: 450,
    width: "100%",
    marginTop: 20,
  },
  bubble: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bubbleSelected: {
    backgroundColor: colors.brandTurquoise, // Or a color fitting the design
    borderColor: colors.brandTurquoise,
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.urbanGray,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  bubbleTextSelected: {
    color: "#fff",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    fontSize: 14,
    color: colors.brandTurquoise,
    fontWeight: "bold",
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    padding: 16,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalDoneText: {
    fontSize: 17,
    color: colors.brandTurquoise,
    fontWeight: '600',
  },
});

