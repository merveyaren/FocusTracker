import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// Ekranlar
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ALT MENÜ 
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Üst başlıkları gizle
        tabBarActiveTintColor: '#6c5ce7', // Seçili sekme rengi (Mor)
        tabBarInactiveTintColor: 'gray',  // Pasif sekme rengi
        tabBarStyle: { paddingBottom: 5, height: 60 }, // Alt menü boyutu
        
        // İkon Ayarları
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Ana Sayfa') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Raporlar') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Raporlar" component={DashboardScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- ANA UYGULAMA YAPISI ---
export default function App() {
  const [user, setUser] = useState(null);

  // Oturum Durumu Giriş/Çıkış Takibi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; // Component kapanırsa dinlemeyi durdur
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Kullanıcı giriş yapmışsa -> Ana Uygulamaya (Tabs) git
          <Stack.Screen name="AppTabs" component={AppTabs} />
        ) : (
          // Kullanıcı yoksa -> Login Ekranına git
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}