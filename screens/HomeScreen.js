import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  // 1. STATE TANIMLARI (Durum değişkenleri)
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 dakika (saniye cinsinden)
  const [isActive, setIsActive] = useState(false);   // Sayaç çalışıyor mu?

  // 2. SAYACIN MANTIĞI (useEffect)
  useEffect(() => {
    let interval = null;

    // Eğer sayaç aktifse ve süre bitmediyse
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1); // Her saniye 1 azalt
      }, 1000);
    } else if (timeLeft === 0) {
      // Süre bittiyse durdur
      setIsActive(false);
      alert("Süre doldu! 🎉"); // Basit bir uyarı
    }

    // Temizlik fonksiyonu (Memory leak önlemek için)
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 3. ZAMANI FORMATLAMA FONKSİYONU (Örn: 1500 sn -> 25:00)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // Eğer sayı 10'dan küçükse başına '0' koy (örn: 09)
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 4. BUTON FONKSİYONLARI
  const handleStartStop = () => {
    setIsActive(!isActive); // Durumu tersine çevir
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(25 * 60); // Tekrar 25 dakikaya döndür
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Zamanı</Text>
      
      {/* Sayaç Göstergesi */}
      <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>

      {/* Butonlar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isActive ? styles.stopButton : styles.startButton]} 
          onPress={handleStartStop}
        >
          <Text style={styles.buttonText}>{isActive ? "Durdur" : "Başlat"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 5. TASARIM (STYLES)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50', // Koyu güzel bir arka plan
  },
  title: {
    fontSize: 24,
    color: '#ecf0f1',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 80, // Büyük puntolu saat
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5, // Android gölgesi
  },
  startButton: {
    backgroundColor: '#27ae60', // Yeşil
  },
  stopButton: {
    backgroundColor: '#c0392b', // Kırmızı
  },
  resetButton: {
    backgroundColor: '#7f8c8d', // Gri
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});