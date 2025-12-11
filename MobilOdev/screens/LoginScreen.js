import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Giriş başarılı, App.js otomatik olarak Ana Sayfaya yönlendirecek
        console.log('Giriş yapıldı:', userCredential.user.email);
      })
      .catch((error) => Alert.alert("Hata", error.message));
  };

  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        Alert.alert("Başarılı", "Kayıt oluşturuldu, giriş yapılıyor...");
      })
      .catch((error) => Alert.alert("Hata", error.message));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Uygulaması 🍅</Text>
      
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'center', color: '#2d3436' },
  input: {
    backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15,
    borderWidth: 1, borderColor: '#dfe6e9'
  },
  button: { backgroundColor: '#6c5ce7', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  registerButton: { backgroundColor: '#a29bfe' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});