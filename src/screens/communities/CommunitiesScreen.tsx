import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { colors } from "../../theme";

const DATA = [
  { id: "1", name: "Morning Runners TLV", category: "Sport" },
  { id: "2", name: "Tech Founders", category: "Entrepreneurship" },
  { id: "3", name: "Friday Dinner Club", category: "Social" },
];

export default function CommunitiesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Worlds</Text>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.category}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
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
});

