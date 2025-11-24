import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
  Alert,
} from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { colors } from "../../theme";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [mode, setMode] = useState<"globe" | "map">("globe");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animations
  const globeScale = useRef(new Animated.Value(1)).current;
  const globeOpacity = useRef(new Animated.Value(1)).current;
  const globeRotate = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const shineRotate = useRef(new Animated.Value(0)).current;
  
  // Store animation references
  const rotateAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const shineAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startGlobeAnimations = () => {
    // Stop existing animations if any
    if (rotateAnimationRef.current) rotateAnimationRef.current.stop();
    if (pulseAnimationRef.current) pulseAnimationRef.current.stop();
    if (shineAnimationRef.current) shineAnimationRef.current.stop();

    // Start continuous globe rotation
    const rotateAnimation = Animated.loop(
      Animated.timing(globeRotate, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: false,
      })
    );
    rotateAnimationRef.current = rotateAnimation;
    rotateAnimation.start();

    // Start pulse animation for outer ring
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.15,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimationRef.current = pulseAnimation;
    pulseAnimation.start();

    // Shine rotation
    const shineAnimation = Animated.loop(
      Animated.timing(shineRotate, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      })
    );
    shineAnimationRef.current = shineAnimation;
    shineAnimation.start();
  };

  useEffect(() => {
    startGlobeAnimations();
    
    // Cleanup on unmount
    return () => {
      if (rotateAnimationRef.current) rotateAnimationRef.current.stop();
      if (pulseAnimationRef.current) pulseAnimationRef.current.stop();
      if (shineAnimationRef.current) shineAnimationRef.current.stop();
    };
  }, []);

  // Restart animations when returning to globe mode
  useEffect(() => {
    if (mode === "globe") {
      startGlobeAnimations();
    }
  }, [mode]);

  const handleGlobePress = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        Alert.alert("Location Permission", "Please enable location permissions to view the map");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc);

      Animated.parallel([
        Animated.timing(globeScale, {
          toValue: 5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(globeOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMode("map");
      });
    } catch (error) {
      console.error("Error getting location:", error);
      setErrorMsg("Failed to get location");
    }
  };

  const handleBackToGlobe = () => {
    // Switch to globe mode first (so globe appears)
    setMode("globe");
    
    // Start from the zoomed state (like when entering map)
    globeScale.setValue(5);
    globeOpacity.setValue(0);
    
    // Animate back to normal globe view (reverse animation)
    Animated.parallel([
      Animated.timing(globeScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(globeOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLocation(null);
    });
  };

  const spin = globeRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const shineSpin = shineRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (mode === "map" && location) {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={false}
          showsPointsOfInterest={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          showsCompass={false}
          mapType={Platform.OS === 'ios' ? 'standard' : 'standard'}
          customMapStyle={[
            // הסתרת כל התוויות
            {
              featureType: 'all',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            // רקע לבן
            {
              featureType: 'all',
              elementType: 'geometry.fill',
              stylers: [{ color: '#ffffff' }]
            },
            // כבישים ראשיים בשחור
            {
              featureType: 'road.highway',
              elementType: 'geometry.fill',
              stylers: [{ color: '#000000' }]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#000000' }]
            },
            // כבישים רגילים בשחור
            {
              featureType: 'road.arterial',
              elementType: 'geometry.fill',
              stylers: [{ color: '#000000' }]
            },
            {
              featureType: 'road.arterial',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#000000' }]
            },
            // כבישים מקומיים בשחור
            {
              featureType: 'road.local',
              elementType: 'geometry.fill',
              stylers: [{ color: '#000000' }]
            },
            {
              featureType: 'road.local',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#000000' }]
            },
            // הסתרת נקודות עניין
            {
              featureType: 'poi',
              elementType: 'all',
              stylers: [{ visibility: 'off' }]
            },
            // מים לבן
            {
              featureType: 'water',
              elementType: 'geometry.fill',
              stylers: [{ color: '#ffffff' }]
            },
            // פארקים ושטחים ירוקים - לבן
            {
              featureType: 'park',
              elementType: 'geometry.fill',
              stylers: [{ color: '#ffffff' }]
            },
            // בניינים - לבן
            {
              featureType: 'building',
              elementType: 'geometry.fill',
              stylers: [{ color: '#ffffff' }]
            },
            {
              featureType: 'building',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#e0e0e0' }, { weight: 0.5 }]
            }
          ]}
        />
        
        <View style={styles.mapOverlay}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToGlobe}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.statusBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.statusText}>Scanning for matches...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.globeContainer}>
        <Animated.View style={{ opacity: globeOpacity, marginBottom: 40 }}>
          <Text style={styles.globeText}>Tap to enter your real world</Text>
        </Animated.View>
        
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={handleGlobePress}
          style={styles.globeTouchable}
        >
          {/* Outer pulsing ring */}
          <Animated.View
            style={[
              styles.outerRing,
              {
                transform: [{ scale: pulseScale }],
                opacity: globeOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.4],
                }),
              },
            ]}
          />

          {/* Main globe container with Earth image */}
          <Animated.View
            style={[
              styles.globeWrapper,
              {
                transform: [{ scale: globeScale }],
                opacity: globeOpacity,
              },
            ]}
          >
            {/* Rotating Earth image wrapper */}
            <Animated.View
              style={[
                styles.earthWrapper,
                {
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              <Image
                source={require("../../../images/Earth.png")}
                style={styles.earthImage}
                resizeMode="cover"
              />
            </Animated.View>

            {/* Shine/reflection overlay */}
            <Animated.View
              style={[
                {
                  transform: [{ rotate: shineSpin }],
                },
              ]}
            >
              <View style={styles.shineGradient1} />
              <View style={styles.shineGradient2} />
            </Animated.View>

            {/* Atmosphere glow */}
            <View style={styles.atmosphere} />
          </Animated.View>
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
  globeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  globeTouchable: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  outerRing: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 300,
    borderWidth: 2,
    borderColor: "#fff",
  },
  globeWrapper: {
    width: 400,
    height: 400,
    borderRadius: 300,
    overflow: "hidden",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 30,
    backgroundColor: "#fff", // Fallback background color
  },
  earthWrapper: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  earthImage: {
    width: "100%",
    height: "100%",
    borderRadius: 110,
  },
  
  shineGradient1: {
    position: "absolute",
    top: "10%",
    left: "15%",
    width: "40%",
    height: "40%",
    borderRadius: 50,

  },
  shineGradient2: {
    position: "absolute",
    top: "20%",
    left: "25%",
    width: "30%",
    height: "30%",
    borderRadius: 40,
   
  },
  atmosphere: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -10,
    left: -10,
  },
  globeText: {
    fontSize: 28,
    color: "#000",
    marginTop: 20,
    textAlign: "center",
    fontFamily: "sf-pro-display-thin",
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.deepBlack,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.deepBlack,
  },
});
