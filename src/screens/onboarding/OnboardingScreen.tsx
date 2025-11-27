import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from "react-native";
import { colors } from "../../theme";

const { width } = Dimensions.get('window');

// Import images at top level to ensure they load properly
const welcomeLogo = require('../../../images/Welcome_logo.png');
const handsImage = require('../../../images/hold_hands.png');
const braceletImage = require('../../../images/bracelet.png');

const onboardingPages = [
  {
    title: "Reconnect with reality.",
    image: welcomeLogo,
  },
  {
    title: "Real connections",
    image: handsImage,
    description: "No profiles,No swiping. \n Just real connections.",
    
  },
  {
    title: "Your bracelet is \nYour Key",
    image: braceletImage,
    description: "It Vibrates when a compatible connection is near. Look up.",
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) {
      const nextPage = currentPage + 1;
      fadeAnim.setValue(0);
      
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      setCurrentPage(nextPage);
    } else {
      navigation.navigate('Login');
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      fadeAnim.setValue(0);
      
      scrollViewRef.current?.scrollTo({
        x: prevPage * width,
        animated: true,
      });
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      setCurrentPage(prevPage);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(scrollPosition / width);
        if (pageIndex !== currentPage) {
          setCurrentPage(pageIndex);
        }
      },
    }
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
      >
        {onboardingPages.map((page, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1, 0.8],
            extrapolate: 'clamp',
          });

          const translateX = scrollX.interpolate({
            inputRange,
            outputRange: [50, 0, -50],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.page,
                {
                  opacity,
                  transform: [{ scale }, { translateX }],
                },
              ]}
            >
              <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Top image area */}
                <View
                  style={[
                    styles.imageContainer,
                    index === 0 && styles.imageContainerFirst,
                    index === 1 && styles.imageContainerSecond,
                    index === 2 && styles.imageContainerThird,
                  ]}
                >
                  <Image 
                    source={page.image} 
                    style={[
                      styles.logoImage,
                      index === 0 && styles.logoImageFirst,
                      index === 1 && styles.logoImageSecond,
                      index === 2 && styles.logoImageThird,
                    ]}
                    resizeMode={index === 0 ? "contain" : "cover"}
                  />
                </View>

                {/* Bottom text area (title + description) */}
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{page.title}</Text>
                  <Text style={styles.description}>{page.description}</Text>
                </View>
              </Animated.View>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      {/* Stepper Dots */}
      <View style={styles.dotsContainer}>
        {onboardingPages.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotScale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.2, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  transform: [{ scale: dotScale }],
                  backgroundColor: currentPage === index ? colors.deepBlack : colors.cloudGray,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {currentPage > 0 && (
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={handlePrevious}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.button, currentPage === 0 && styles.fullWidthButton]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentPage === onboardingPages.length - 1 ? 'Get Started' : 'Next'}
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
    paddingBottom: 50,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: width,
    flex: 1,
    padding: 0,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "#fff",
    // Card-like look (similar to design), but using existing colors
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: {
    height: "70%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  // First page: אייקון במרכז, לא מלא
  imageContainerFirst: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 250,
  },
  // Second page: תמונה מלאה כמו בדוגמה – צמודה למעלה, מלאה לרוחב
  imageContainerSecond: {
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  // Third page: גם מלאה לרוחב, כמו בדוגמה של הצמיד
  imageContainerThird: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
  textContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    color: colors.deepBlack,
    textAlign: "center",
    marginTop: 20,
    fontFamily: "sf-pro-display-thin",
  },
  logoImage: {
    width: "100%",
  },
  // First page image (key logo) – בסיסי
  logoImageFirst: {
    width: 260,
    height: 260,
    marginBottom: 30,
  },
  // Second page image (hands) – יותר גבוה ותופס יותר מהכרטיס
  logoImageSecond: {
    aspectRatio: 3 / 4,
    maxWidth: '100%',
    maxHeight: '100%',
    marginBottom: 0,
  },
  // Third page image (bracelet) – מאוזן, טיפה קטן יותר מהשני
  logoImageThird: {
    aspectRatio: 3 / 4,
    marginBottom: 0,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  description: {
    fontSize: 20,
    color: colors.urbanGray,
    textAlign: "center",
    paddingTop: 10,    paddingHorizontal: 40,
    lineHeight: 30,
    fontFamily: "sf-pro-display-thin",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.deepBlack,
  },
  fullWidthButton: {
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: colors.mistWhite,
    borderColor: colors.cloudGray,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.deepBlack,
  },
  secondaryButtonText: {
    color: colors.urbanGray,
  },
});

