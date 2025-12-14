import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Animated, Dimensions } from "react-native";
import { colors } from "../../theme";
import { getProfile, getMyCommunities } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

interface ProfileData {
  profile: {
    display_name: string;
    birth_date: string;
    bio?: string;
    profile_image?: string;
    main_mode: string;
  };
  intents: {
    dating?: boolean;
    sport_partner?: boolean;
    social?: boolean;
    entrepreneurship?: boolean;
    work?: boolean;
    games?: boolean;
  } | null;
}

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        setError("Not logged in");
        setLoading(false);
        return;
      }

      const data = await getProfile(token);
      setProfileData(data);

      // Load joined communities
      try {
        const comms = await getMyCommunities(token);
        setMyCommunities(comms);
      } catch (e) {
        console.log("Failed to load communities for profile", e);
      }

      setError(null);
    } catch (err: any) {
      console.error("Error loading profile:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getIntentLabels = () => {
    if (!profileData?.intents) return [];
    const intents = profileData.intents;
    const labels: string[] = [];
    
    if (intents.dating) labels.push("Dating");
    if (intents.sport_partner) labels.push("Sport");
    if (intents.social) labels.push("Social");
    if (intents.entrepreneurship) labels.push("Entrepreneurship");
    if (intents.work) labels.push("Work");
    if (intents.games) labels.push("Games");
    
    return labels;
  };

  const openSettings = () => {
    setSettingsVisible(true);
    slideAnim.setValue(screenWidth);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeSettings = () => {
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSettingsVisible(false));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.brandTurquoise} />
      </View>
    );
  }

  if (error || !profileData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || "No profile data"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { profile } = profileData;
  const age = calculateAge(profile.birth_date);
  const intentLabels = getIntentLabels();
  const initials = profile.display_name
    ? profile.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Settings icon */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity
          onPress={openSettings}
        >
          <Ionicons name="settings-outline" size={24} color={colors.deepBlack} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        {profile.profile_image ? (
          <Image
            source={{ uri: profile.profile_image }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <Text style={styles.name}>
          {profile.display_name}
          {age ? `, ${age}` : ""}
        </Text>
        {profile.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : (
          <Text style={styles.bioPlaceholder}>No bio yet</Text>
        )}
      </View>

    

      {/* My Communities Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Communities</Text>
        {myCommunities.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.communitiesList}>
            {myCommunities.map((comm) => (
              <View key={comm.id} style={styles.communityCard}>
                <Text style={styles.communityName}>{comm.name}</Text>
                <Text style={styles.communityCategory}>{comm.category}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noIntentsText}>Not a member of any community yet</Text>
        )}
      </View>

      {/* Slide-in Settings Panel */}
      <Modal visible={settingsVisible} transparent animationType="none">
        <View style={styles.settingsOverlay}>
          {/* tap outside to close */}
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeSettings} />
          <Animated.View
            style={[
              styles.settingsPanel,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Settings</Text>
              <TouchableOpacity onPress={closeSettings}>
                <Ionicons name="close" size={22} color={colors.deepBlack} />
              </TouchableOpacity>
            </View>
            <View style={styles.settingsDivider} />

            <View style={styles.settingsContent}>
              <Text style={styles.settingsItemText}>Edit profile details</Text>
              <Text style={styles.settingsItemText}>Manage notifications</Text>
              <Text style={styles.settingsItemText}>Privacy & visibility</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  settingsContainer: {
    width: "100%",
    alignItems: "flex-end",
    paddingTop: 40,
    paddingRight: 20,
  },
  header: {
    paddingTop: 20,
    alignItems: "center",
    marginBottom: 40,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: {
    fontSize: 40,
    color: colors.urbanGray,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    color: colors.deepBlack,
    fontFamily: "sf-pro-display-thin",
    marginBottom: 8,
  },
  bio: {
    textAlign: "center",
    color: colors.deepBlack,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  bioPlaceholder: {
    textAlign: "center",
    color: colors.urbanGray,
    fontSize: 16,
    fontFamily: "sf-pro-display-thin",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#000",
    fontFamily: "sf-pro-display-thin",
    marginBottom: 12,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#fff",
    borderWidth: 0.2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    color: colors.deepBlack,
    fontWeight: "500",
  },
  noIntentsText: {
    color: colors.urbanGray,
    fontStyle: "italic",
  },
  errorText: {
    color: colors.urbanGray,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.brandTurquoise,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.deepBlack,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 0.2,
  },

  communitiesList: {
    flexDirection: 'row',
  },
  communityCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.cloudGray,
    marginRight: 12,
    minWidth: 120,
  },
  communityName: {
    fontWeight: '600',
    color: colors.deepBlack,
    marginBottom: 4,
  },
  communityCategory: {
    fontSize: 12,
    color: colors.urbanGray,
  },

  settingsOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  settingsPanel: {
    width: "75%",
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsDivider: {
    height: 1,
    backgroundColor: colors.cloudGray,
    marginTop: 12,
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 24,
    color: colors.deepBlack,
    fontFamily: "sf-pro-display-thin",
    marginTop: 30,
  },
  settingsContent: {
    gap: 12,
  },
  settingsItemText: {
    fontSize: 18,
    color: colors.deepBlack,
    fontFamily: "sf-pro-display-thin",
    marginTop: 10,
  },
});

