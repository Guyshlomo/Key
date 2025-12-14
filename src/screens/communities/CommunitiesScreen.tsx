import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { colors } from "../../theme";
import { getMyCommunities } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CommunitiesScreen() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        const data = await getMyCommunities(token);
        setCommunities(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}> My Worlds</Text>
      
      {loading ? (
        <ActivityIndicator color={colors.brandTurquoise} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={communities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You haven't joined any communities yet.</Text>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    color: colors.deepBlack,
    marginLeft: 20,
    marginTop: 40,
    fontFamily: "sf-pro-display-thin",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#000",
  },
  cardTitle: {
    fontSize: 18,
    color: "#000",
    fontFamily: "sf-pro-display-thin",
  },
  cardCategory: {
    fontSize: 14,
    color: "#000",
    marginTop: 4,
    fontFamily: "sf-pro-display-thin",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: colors.urbanGray,
    fontSize: 16,
  },
});

