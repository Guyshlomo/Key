import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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

  const xp = 8540;

  return (
    <View style={styles.container}>
      {/* Background image + gradient overlay */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require("../../../images/gamebackground.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0)",                    // no overlay בחלק העליון
            "rgba(249, 115, 129, 0.25)",          // חם באמצע
            colors.mistWhite,                     // נמס לרקע הלבן בחלק התחתון
          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientOverlay}
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* XP badge row */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }} />
          <View style={styles.xpBadge}>
            <Text style={styles.xpLabel}>XP</Text>
            <Text style={styles.xpValue}>{xp}</Text>
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>Time until the game starts</Text>

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

        {/* Bottom stats / cards section */}
        <View style={styles.bottomSheet}>
          <Text style={styles.sectionTitle}>Global Competitors</Text>

          <View style={styles.leaderboardList}>
            <View style={styles.leaderboardRow}>
              <View style={styles.leaderboardRankCircle}>
                <Text style={styles.leaderboardRankText}>1</Text>
              </View>
              <Text style={styles.leaderboardName}>AstroNova</Text>
              <Text style={styles.leaderboardScore}>+12500</Text>
            </View>

            <View style={styles.leaderboardRow}>
              <View
                style={[
                  styles.leaderboardRankCircle,
                  styles.leaderboardRankCircleSecondary,
                ]}
              >
                <Text style={styles.leaderboardRankText}>2</Text>
              </View>
              <Text style={styles.leaderboardName}>CipherKai</Text>
              <Text style={styles.leaderboardScore}>+11200</Text>
            </View>

            <View style={styles.leaderboardRow}>
              <View
                style={[
                  styles.leaderboardRankCircle,
                  styles.leaderboardRankCircleTertiary,
                ]}
              >
                <Text style={styles.leaderboardRankText}>3</Text>
              </View>
              <Text style={styles.leaderboardName}>LunaJ</Text>
              <Text style={styles.leaderboardScore}>+10800</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>My Worlds</Text>

          <View style={styles.worldsGrid}>
            <View style={[styles.worldCard, styles.worldCardHighlighted]}>
              <Text style={styles.worldTitle}>Friends from home</Text>
              <View style={styles.worldProgressBarBackground}>
                <View
                  style={[styles.worldProgressBarFill, { width: "70%" }]}
                />
              </View>
            </View>

            <View style={styles.worldCard}>
              <Text style={styles.worldTitle}>Family</Text>
              <View style={styles.worldProgressBarBackground}>
                <View
                  style={[styles.worldProgressBarFill, { width: "55%" }]}
                />
              </View>
            </View>
          </View>

          <View style={styles.worldsGrid}>
            <View style={styles.worldCard}>
              <Text style={styles.worldTitle}>Coworkers</Text>
              <View style={styles.worldProgressBarBackground}>
                <View
                  style={[styles.worldProgressBarFill, { width: "40%" }]}
                />
              </View>
            </View>

            <View style={styles.worldCard}>
              <Text style={styles.worldTitle}>Custom circles</Text>
              <View style={styles.worldProgressBarBackground}>
                <View
                  style={[styles.worldProgressBarFill, { width: "30%" }]}
                />
              </View>
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
    backgroundColor: "#fff",
    position: "relative",
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "80%",
    overflow: "hidden",
  },
  backgroundImage: {
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  contentContainer: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 24,
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: 12,
  },
  xpBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  xpLabel: {
    fontSize: 10,
    color: "#FFB6C1",
    textAlign: "right",
  },
  xpValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "right",
  },

  countdownContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
  },
  countdownLabel: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  countdownBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  timeUnit: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
    minWidth: 50,
  },
  timeValue: {
    fontSize: 40,
    fontWeight: "thin",
    color: "#FF6A6A",
    marginBottom: 6,
    textShadowColor: "rgba(255, 160, 140, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  timeLabel: {
    fontSize: 12,
    color: "rgba(254, 84, 51, 0.9)",
    textTransform: "uppercase",
    letterSpacing: 1,
    textShadowColor: "rgba(255, 160, 140, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  separator: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FF6A6A",
    marginHorizontal: 6,
    textShadowColor: "rgba(255, 160, 140, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },

  bottomSheet: {
    marginTop: "auto",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.deepBlack,
    marginBottom: 12,
  },
  leaderboardList: {
    marginBottom: 8,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  leaderboardRankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFB74D",
    marginRight: 8,
  },
  leaderboardRankCircleSecondary: {
    backgroundColor: "#90CAF9",
  },
  leaderboardRankCircleTertiary: {
    backgroundColor: "#CE93D8",
  },
  leaderboardRankText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  leaderboardName: {
    flex: 1,
    marginLeft: 4,
    fontSize: 15,
    color: colors.deepBlack,
  },
  leaderboardScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6A6A",
  },

  worldsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  worldCard: {
    flex: 1,
    marginRight: 8,
    backgroundColor: colors.mistWhite,
    borderRadius: 16,
    padding: 12,
  },
  worldCardHighlighted: {
    borderWidth: 1,
    borderColor: "rgba(255, 106, 106, 0.7)",
    shadowColor: "#FF6A6A",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  worldTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.deepBlack,
    marginBottom: 8,
  },
  worldProgressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cloudGray,
    overflow: "hidden",
  },
  worldProgressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#FF6A6A",
  },
});

