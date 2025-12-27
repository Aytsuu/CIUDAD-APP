import 'dotenv/config'

export default () => ({
    expo: {
      name: "Ciudad",
      slug: "ciudad",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/app_icon.png",
      scheme: "myapp",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      splash: {
        image: "./assets/images/app_icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      ios: {
        supportsTablet: true
      },
      android: {
        package: "com.aytsuu.mobile",
        edgeToEdgeEnabled: true,
        config: { 
          googleMaps: {
            apiKey: process.env.EXPO_GOOGLE_MAP_API_KEY
          }
        }
      },
      web: {
        bundler: "metro",
        output: "static", 
        favicon: "./assets/images/CIUDADLogo.svg"
      },
      plugins: [
        "expo-router",
        [
          "expo-splash-screen",
          {
            image: "./assets/images/app_icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#ffffff"
          }
        ],
        [
          "expo-dev-client",
          {
            launchMode: "most-recent"
          }
        ],
        "expo-asset",
        [
          "react-native-vision-camera",
          {
            cameraPermissionText: "$(PRODUCT_NAME) needs access to your Camera.",
            enableMicrophonePermission: true,
            microphonePermissionText: "$(PRODUCT_NAME) needs access to your Microphone."
          }
        ],
        [
          "expo-media-library",
          {
            photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
            savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
            isAccessMediaLocationEnabled: true
          }
        ],
        [
          "expo-build-properties",
          {
            "android": {
              edgeToEdgeEnabled: true,
              suppressNativeLinking: ["react-native-worklets"],
            }
          }
        ]
      ],
      experiments: {
        typedRoutes: true
      },
      extra: {
        apiUrl: process.env.EXPO_API_URL1,
        apiUrl2: process.env.EXPO_API_URL2,
        supabaseUrl: process.env.EXPO_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_SUPABASE_ANON_KEY,
        router: {
          origin: false
        },
      }
    }
  });
