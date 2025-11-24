import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { colors } from "../../theme";

export default function RegisterScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Key</Text>
      
      <View style={styles.form}>
        <TextInput 
          placeholder="Phone Number" 
          style={styles.input} 
          placeholderTextColor={colors.urbanGray}
          keyboardType="phone-pad"
        />
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Onboarding')}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mistWhite,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.deepBlack,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.cloudGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: colors.deepBlack,
  },
  button: {
    backgroundColor: colors.brandTurquoise,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.deepBlack,
  },
});

