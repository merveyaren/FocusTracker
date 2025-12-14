import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from 'react-native';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  //  STATE 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Yükleniyor animasyonu için

  // GİRİŞ YAP FONKSİYONU
  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurunuz.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Giriş başarılı!');
    } catch (error) {
      Alert.alert("Giriş Hatası", "Hatalı e-posta veya şifre.");
    } finally {
      setLoading(false);
    }
  };

  //KAYIT OL FONKSİYONU
  const handleRegister = async () => {
    if (email === '' || password === '') {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurunuz.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Başarılı", "Hesap oluşturuldu! Giriş yapılıyor...");
    } catch (error) {
      Alert.alert("Kayıt Hatası", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Uygulaması 🍅</Text>
      
      {/* E-Posta Girişi */}
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Şifre Girişi */}
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/*  BUTONLAR */}
      {loading ? (
        <ActivityIndicator size="large" color="#6c5ce7" style={{ marginTop: 20 }} />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  
  title: { 
    fontSize: 28, fontWeight: 'bold', marginBottom: 40, 
    textAlign: 'center', color: '#2d3436' 
  },
  
  input: {
    backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15,
    borderWidth: 1, borderColor: '#dfe6e9', fontSize: 16
  },
  
  button: { 
    backgroundColor: '#6c5ce7', padding: 16, borderRadius: 12, 
    alignItems: 'center', marginBottom: 12,
    elevation: 2 
  },
  
  registerButton: { backgroundColor: '#a29bfe' }, 
  
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});