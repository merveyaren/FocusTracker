import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function ProfileScreen() {

  // --- ÇIKIŞ İŞLEMİ ---
  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Uygulamadan ayrılmak istiyor musun?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Evet, Çıkış Yap", 
          style: "destructive", 
          // Firebase oturumunu kapatır
          onPress: () => signOut(auth).catch(err => console.log(err)) 
        }
      ]
    );
  };

  // --- KULLANICI BİLGİSİ ---
  const userEmail = auth.currentUser?.email || "misafir@ogrenci.com";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profilim 👤</Text>

      {/*  KULLANICI KARTI  */}
      <View style={styles.profileCard}>
        {/* Avatar Alanı */}
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        
        {/* Bilgi Alanı */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Hesap</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>
      </View>

      {/*  AYARLAR MENÜSÜ */}
      <Text style={styles.sectionTitle}>Ayarlar</Text>
      
      {/* Karanlık Mod */}
      <View style={styles.menuItem}>
        <View style={styles.menuIconInfo}>
          <Ionicons name="moon-outline" size={24} color="#6c5ce7" />
          <Text style={styles.menuText}>Karanlık Mod</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
      </View>

      {/* 3. ÇIKIŞ BUTONU */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" style={{marginRight: 10}} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

  

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  
  // Başlık Stili
  header: { 
    fontSize: 28, fontWeight: 'bold', color: '#2d3436', 
    marginTop: 40, marginBottom: 20 
  },
  
  // Profil Kartı Tasarımı
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 20, borderRadius: 20, marginBottom: 30,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }
  },
  avatarContainer: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#6c5ce7', 
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#2d3436' },
  userEmail: { fontSize: 14, color: '#636e72', marginTop: 2 },

  // Menü Başlıkları ve Öğeleri
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#b2bec3', marginBottom: 10, marginLeft: 5 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 1,
  },
  menuIconInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  menuText: { fontSize: 16, color: '#2d3436', fontWeight: '500' },

  // Çıkış Butonu
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ff7675', padding: 15, borderRadius: 15, marginTop: 20, elevation: 3
  },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  
 
});