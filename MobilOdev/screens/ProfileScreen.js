import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function ProfileScreen() {

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Uygulamadan ayrılmak istiyor musun?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Evet, Çıkış Yap", 
          style: "destructive", 
          onPress: () => signOut(auth).catch(err => console.log(err)) 
        }
      ]
    );
  };

  // Kullanıcı bilgisini güvenli şekilde al
  const userEmail = auth.currentUser?.email || "misafir@ogrenci.com";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profilim 👤</Text>

      {/* --- KULLANICI KARTI --- */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Öğrenci Hesabı</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>
      </View>

      {/* --- AYARLAR MENÜSÜ (Görsel Amaçlı) --- */}
      <Text style={styles.sectionTitle}>Ayarlar</Text>
      
      <View style={styles.menuItem}>
        <View style={styles.menuIconInfo}>
          <Ionicons name="notifications-outline" size={24} color="#6c5ce7" />
          <Text style={styles.menuText}>Bildirimler</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
      </View>

      <View style={styles.menuItem}>
        <View style={styles.menuIconInfo}>
          <Ionicons name="moon-outline" size={24} color="#6c5ce7" />
          <Text style={styles.menuText}>Karanlık Mod</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
      </View>
      
      <View style={styles.menuItem}>
        <View style={styles.menuIconInfo}>
          <Ionicons name="language-outline" size={24} color="#6c5ce7" />
          <Text style={styles.menuText}>Dil Seçeneği</Text>
        </View>
        <Text style={{color: '#b2bec3'}}>Türkçe</Text>
      </View>

      {/* --- ÇIKIŞ BUTONU --- */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" style={{marginRight: 10}} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>v1.0.0 • FocusTracker App</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#2d3436', 
    marginTop: 40, 
    marginBottom: 20 
  },
  
  // Profil Kartı
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 }
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6c5ce7', // Mor tema
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#2d3436' },
  userEmail: { fontSize: 14, color: '#636e72', marginTop: 2 },

  // Menü
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#b2bec3', marginBottom: 10, marginLeft: 5 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 1,
  },
  menuIconInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  menuText: { fontSize: 16, color: '#2d3436', fontWeight: '500' },

  // Çıkış Butonu
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff7675', // Kırmızı
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    elevation: 3
  },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  versionText: { textAlign: 'center', color: '#b2bec3', marginTop: 20, fontSize: 12 }
});