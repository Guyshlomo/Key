import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import { colors } from "../../theme";

const { width, height } = Dimensions.get("window");

export default function GameScreen() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  const getNextMonthFirst = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    nextMonth.setHours(0, 0, 0, 0); // Set to midnight
    return nextMonth;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMonthFirst = getNextMonthFirst();
      const difference = nextMonthFirst.getTime() - now.getTime();

      // Update target date if it changed
      setTargetDate((prev) => {
        if (!prev || prev.getTime() !== nextMonthFirst.getTime()) {
          return nextMonthFirst;
        }
        return prev;
      });

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        // If we've passed the target, get the next month
        const nextTarget = getNextMonthFirst();
        const newDifference = nextTarget.getTime() - now.getTime();
        const days = Math.floor(newDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((newDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((newDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((newDifference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
        setTargetDate(nextTarget);
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, "0");
  };

  const monthName = targetDate?.toLocaleString("default", { month: "long" }) || "";
  const year = targetDate?.getFullYear() || new Date().getFullYear();

  return (
    <View style={styles.container}>
      {/* Background decorative elements */}
      <View style={styles.backgroundContainer}>

        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
        <View style={styles.circle4} />
        <View style={styles.circle5} />
        <View style={styles.overlay} />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Key Quest</Text>
        <Text style={styles.subtitle}>Monthly City Game</Text>
        
        {/* Countdown */}
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>
            Time until the game starts
          </Text>
          
          <View style={styles.countdownBox}>
            <View style={styles.timeUnit}>
              <Text style={styles.timeValue}>{formatNumber(countdown.days)}</Text>
              <Text style={styles.timeLabel}>Days</Text>
            </View>
            
            <Text style={styles.separator}>:</Text>
            
            <View style={styles.timeUnit}>
              <Text style={styles.timeValue}>{formatNumber(countdown.hours)}</Text>
              <Text style={styles.timeLabel}>Hours</Text>
              
            </View>
            
            <Text style={styles.separator}>:</Text>
            
            <View style={styles.timeUnit}>
              <Text style={styles.timeValue}>{formatNumber(countdown.minutes)}</Text>
              <Text style={styles.timeLabel}>Minutes</Text>
            </View>
            
            <Text style={styles.separator}>:</Text>
            
            <View style={styles.timeUnit}>
              <Text style={styles.timeValue}>{formatNumber(countdown.seconds)}</Text>
              <Text style={styles.timeLabel}>Seconds</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mistWhite,
    position: "relative",
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  earthImage: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    opacity: 0.15,
    top: (height - width * 0.7) / 2,
    left: (width - width * 0.7) / 2,
  },
  circle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.brandTurquoise,
    opacity: 0.15,
    top: -100,
    right: -50,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.brandTurquoise,
    opacity: 0.1,
    bottom: -50,
    left: -50,
  },
  circle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.steelCharcoal,
    opacity: 0.08,
    top: height * 0.3,
    left: -30,
  },
  circle4: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.brandTurquoise,
    opacity: 0.12,
    bottom: height * 0.2,
    right: -40,
  },
  circle5: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.urbanGray,
    opacity: 0.1,
    top: height * 0.5,
    right: width * 0.2,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.mistWhite,
    opacity: 0.7,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.deepBlack,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.urbanGray,
    marginBottom: 40,
  },
  countdownContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  countdownLabel: {
    fontSize: 20,
    color: colors.urbanGray,
    marginBottom: 30,
    textAlign: "center",
  },
  countdownBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: colors.cloudGray,
    borderRadius: 12,
    padding: 10,
    backgroundColor: colors.mistWhite,
    shadowColor: "#94CECC",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 30,
  },
  timeUnit: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    minWidth: 60,
  },
  timeValue: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.deepBlack,
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.urbanGray,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  separator: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.deepBlack,
    marginHorizontal: 4,
  },
});

