import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { colors } from "../../theme";
import { getProfile } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Intents</Text>
        {intentLabels.length > 0 ? (
          <View style={styles.tags}>
            {intentLabels.map((label, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noIntentsText}>No intents selected</Text>
        )}
      </View>

      <TouchableOpacity style={styles.editButton} onPress={loadProfile}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
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
  header: {
    paddingTop: 40,
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
  editButtonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "sf-pro-display-thin",
  },
});

