import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// --- EKRANLAR ---
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen'; // <-- 1. YENİ EKLENDİ

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // --- 2. İKON AYARLARI ---
          if (route.name === 'Ana Sayfa') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Raporlar') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profil') { // <-- Profil ikonu eklendi
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6c5ce7', // <-- Mor Tema Rengi (Eskisi 'tomato' idi)
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 } // Menüyü biraz daha ferah yaptık
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Raporlar" component={DashboardScreen} />
      {/* --- 3. YENİ SEKME --- */}
      <Tab.Screen name="Profil" component={ProfileScreen} /> 
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Firebase Auth durumunu dinle
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Kullanıcı varsa Tab Menüye git
          <Stack.Screen name="AppTabs" component={AppTabs} />
        ) : (
          // Kullanıcı yoksa Login ekranına git
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}