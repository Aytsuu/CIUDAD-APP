  export default () => ({
    expo: {
      name: "Ciudad",
      slug: "ciudad",
      version: "1.0.0",
      orientation: "portrait",
      icon: "",
      scheme: "myapp",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      // splash: {
      //   image: "./assets/images/CIUDADLogo.svg",
      //   resizeMode: "contain",
      //   backgroundColor: "#ffffff"
      // },
      ios: {
        supportsTablet: true
      },
      android: {
        package: "com.aytsuu.mobile",
        edgeToEdgeEnabled: true,
        config: { 
          googleMaps: {
            apiKey: "AIzaSyBUMbZ3dQl6eGAUD8SQXuq7S6UeOebroTo"
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
        // [
        //   "expo-splash-screen",
        //   {
        //     image: "./assets/images/splash-icon.png",
        //     imageWidth: 200,
        //     resizeMode: "contain",
        //     backgroundColor: "#ffffff"
        //   }
        // ],
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
        apiUrl: "https://ciudad-app-server-1.onrender.com",
        apiUrl2: "https://ciudad-app-server-2.onrender.com",
        supabaseUrl: "https://isxckceeyjcwvjipndfd.supabase.co",
        supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzeGNrY2VleWpjd3ZqaXBuZGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMDEyNDYsImV4cCI6MjA1Nzg3NzI0Nn0.lm99kbu2GH7qG_MvAO1boa7C3jCLRc7nOGfdHA-upEM",
        router: {
          origin: false
        },
        eas: {
          projectId: "5aa2b834-edb9-49fb-a116-9fcdd9133d03"
        }
      }
    }
  });