import { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, AppState, Modal, StatusBar, Alert 
} from 'react-native';
import { Audio } from 'expo-av'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { db, auth } from '../firebaseConfig'; 

export default function HomeScreen() {
  // --- STATE TANIMLARI ---
  const [isBreak, setIsBreak] = useState(false); 
  const [initialTime, setInitialTime] = useState(25 * 60); 
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState("Ders"); 
  const [distractionCount, setDistractionCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  // SES STATE
  const [sound, setSound] = useState();
  
  const appState = useRef(AppState.currentState);

  // --- RENK TEMASI ---
  const themeColor = isBreak ? '#00b894' : '#6c5ce7'; 

  // --- 1. SES AYARLARINI YAPILANDIR ---
  useEffect(() => {
    async function configureAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true, // iOS Sessiz modda çal
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false, // Android'de HOPARLÖRDEN çal
        });
      } catch (e) {
        console.log("Ses modu hatası:", e);
      }
    }
    configureAudio();
  }, []);

  // --- 2. SESİ ÇALMA FONKSİYONU ---
  async function playSound() {
    console.log('1. Ses yükleme işlemi başladı...');
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Dosya yolu '../assets/alarm.mp3' olarak ayarlandı
      const { sound: newSound } = await Audio.Sound.createAsync(
         require('../assets/alarm.mp3'), 
         { shouldPlay: true, volume: 1.0 } 
      );
      
      setSound(newSound);
      console.log('2. Ses başarıyla yüklendi ve çalıyor!');

      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await newSound.unloadAsync();
        }
      });

    } catch (error) {
      console.error("SES ÇALMA HATASI:", error);
      Alert.alert("Hata", "Ses çalınamadı.");
    }
  }

  // --- 3. SESİ DURDURMA ---
  async function stopSound() {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  }

  // Component kapanırsa sesi temizle
  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  // --- VERİTABANINA KAYIT FONKSİYONU (YENİ EKLENDİ) ---
  async function saveSession() {
    // Mola modundaysak veya kullanıcı giriş yapmamışsa kaydetme
    if (isBreak || !auth.currentUser) return;

    // Geçen süreyi hesapla (Dakika)
    const completedDuration = Math.floor(initialTime / 60);

    // 0 dakikalık oturumları kaydetmek istemiyorsan burayı açabilirsin:
    // if (completedDuration < 1) return;

    try {
      await addDoc(collection(db, "sessions"), {
        userId: auth.currentUser.uid,
        category: category,
        duration: completedDuration,
        distractions: distractionCount,
        createdAt: serverTimestamp()
      });
      console.log("✅ Oturum başarıyla veritabanına kaydedildi!");
    } catch (error) {
      console.error("❌ Kayıt hatası:", error);
    }
  }

  // --- SÜRE DEĞİŞTİRME ---
  const changeTime = (minutes) => {
    const newTime = initialTime + (minutes * 60);
    if (newTime >= 60 && newTime <= 7200) {
      setInitialTime(newTime);
      setTimeLeft(newTime); 
    }
  };

  // --- MOD DEĞİŞİMİ ---
  const switchMode = (mode) => {
    stopSound(); 
    setIsActive(false);
    if (mode === 'break') {
      setIsBreak(true);
      setInitialTime(1 * 60); 
      setTimeLeft(1 * 60);
    } else {
      setIsBreak(false);
      setInitialTime(25 * 60); 
      setTimeLeft(25 * 60);
    }
  };

  // --- SAYAÇ MANTIĞI ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // --- SÜRE BİTTİ ---
      setIsActive(false);
      playSound();     // 1. Alarm Çal
      saveSession();   // 2. Veriyi Kaydet (YENİ)
      setShowSummary(true); 
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // --- ARKA PLAN TAKİBİ ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) && 
        nextAppState.match(/inactive|background/) &&
        isActive &&
        !isBreak 
      ) {
        setIsActive(false);
        setDistractionCount((prev) => prev + 1);
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive, isBreak]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinish = () => {
    setIsActive(false);
    // İstersen burada da saveSession() çağırabilirsin ama 
    // şimdilik sadece süre bitince kaydediyoruz.
    setShowSummary(true);
  };

  const closeSummary = () => {
    stopSound();
    setShowSummary(false);
    setIsActive(false);
    setTimeLeft(initialTime);
    setDistractionCount(0);
  };

  const categories = ["Ders", "Kodlama", "Kitap", "Proje"];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" /> 
      
      <Text style={styles.header}>Pomodoro Asistanı ⏳</Text>

      {/* --- MOD SEÇİM SEKMELERİ --- */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, !isBreak && styles.activeTab, {borderColor: themeColor}]} 
          onPress={() => switchMode('focus')}
        >
          <Text style={[styles.tabText, !isBreak && {color: '#fff'}]}>ODAKLAN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, isBreak && styles.activeTab, isBreak && {backgroundColor: themeColor, borderColor: themeColor}]} 
          onPress={() => switchMode('break')}
        >
          <Text style={[styles.tabText, isBreak && {color: '#fff'}]}>MOLA</Text>
        </TouchableOpacity>
      </View>

      {/* KATEGORİLER */}
      {!isBreak && (
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catButton, category === cat && {backgroundColor: themeColor, borderColor: themeColor}]}
              onPress={() => setCategory(cat)}
              disabled={isActive}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* MOLA MESAJI */}
      {isBreak && (
        <View style={styles.breakMessageContainer}>
           <Text style={styles.breakMessageText}>☕ Kahveni al ve dinlen.</Text>
        </View>
      )}

      {/* SÜRE SEÇİCİ */}
      <View style={styles.timeSelector}>
         <TouchableOpacity 
            style={[styles.timeBtn, isActive && styles.disabledBtn]} 
            onPress={() => changeTime(-5)}
            disabled={isActive}
         >
            <Text style={[styles.timeBtnText, {color: themeColor}]}>-5</Text>
         </TouchableOpacity>

         <View style={styles.timeDisplay}>
            <Text style={styles.timeLabel}>HEDEF SÜRE</Text>
            <Text style={styles.timeValue}>{Math.floor(initialTime / 60)} dk</Text>
         </View>

         <TouchableOpacity 
            style={[styles.timeBtn, isActive && styles.disabledBtn]} 
            onPress={() => changeTime(5)}
            disabled={isActive}
         >
            <Text style={[styles.timeBtnText, {color: themeColor}]}>+5</Text>
         </TouchableOpacity>
      </View>

      {/* SAYAÇ DAİRESİ */}
      <View style={[styles.timerCircle, {borderColor: themeColor, shadowColor: themeColor}]}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        
        {!isBreak && (
           <Text style={[styles.distractionText, {color: '#ff7675'}]}>
             Dikkat: {distractionCount}
           </Text>
        )}
        {isBreak && (
            <Text style={[styles.distractionText, {color: themeColor}]}>
             İyi dinlenmeler!
            </Text>
        )}
      </View>

      {/* BUTONLAR */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.button, 
            isActive ? styles.pauseButton : {backgroundColor: themeColor} 
          ]} 
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.buttonText}>{isActive ? "Duraklat" : "Başlat"}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={handleFinish}
        >
          <Text style={styles.buttonText}>Bitir</Text>
        </TouchableOpacity>
      </View>

      {/* ÖZET MODAL */}
      <Modal visible={showSummary} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
               {isBreak ? "Mola Bitti! ☕" : "Seans Özeti "}
            </Text>
            
            {!isBreak && (
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Kategori:</Text>
                <Text style={styles.modalValue}>{category}</Text>
              </View>
            )}

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Toplam Süre:</Text>
              <Text style={styles.modalValue}>
                {Math.floor((initialTime - timeLeft) / 60)} dk
              </Text>
            </View>

            {!isBreak && (
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Dikkat Dağınıklığı:</Text>
                <Text style={[styles.modalValue, { color: '#ff7675' }]}>
                  {distractionCount} Kez
                </Text>
              </View>
            )}

            <TouchableOpacity style={[styles.closeButton, {backgroundColor: themeColor}]} onPress={closeSummary}>
              <Text style={styles.buttonText}>Tamam (Alarmı Sustur)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    alignItems: 'center', 
    paddingTop: 50,
  },
  header: { 
    fontSize: 26, 
    color: '#2d3436', 
    fontWeight: 'bold', 
    marginBottom: 20,
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 5,
    elevation: 2,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#6c5ce7', 
    borderColor: '#6c5ce7',
  },
  tabText: {
    fontWeight: 'bold',
    color: '#b2bec3',
  },
  categoryContainer: { 
    flexDirection: 'row', 
    marginBottom: 20, 
    gap: 10,
  },
  breakMessageContainer: {
    marginBottom: 20,
    padding: 10,
  },
  breakMessageText: {
    fontSize: 18,
    color: '#00b894',
    fontStyle: 'italic',
    fontWeight: '600'
  },
  catButton: { 
    paddingVertical: 8,
    paddingHorizontal: 12, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#dfe6e9', 
    backgroundColor: '#fff',
    elevation: 2, 
  },
  catText: { 
    color: '#b2bec3', 
    fontWeight: '600',
    fontSize: 12, 
  },
  catTextActive: { 
    color: '#fff', 
    fontWeight: 'bold', 
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2}
  },
  timeBtn: {
    backgroundColor: '#f1f2f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.3
  },
  timeBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeDisplay: {
    marginHorizontal: 20,
    alignItems: 'center',
    minWidth: 80
  },
  timeLabel: {
    fontSize: 10,
    color: '#b2bec3',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2
  },
  timeValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436'
  },
  timerCircle: { 
    width: 260, 
    height: 260, 
    borderRadius: 130, 
    borderWidth: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 40, 
    backgroundColor: '#fff',
    elevation: 10, 
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  timerText: { 
    fontSize: 65, 
    color: '#2d3436', 
    fontWeight: 'bold', 
    fontVariant: ['tabular-nums'], 
  },
  distractionText: { 
    marginTop: 10, 
    fontSize: 16,
    fontWeight: '600'
  },
  buttonContainer: { 
    flexDirection: 'row', 
    gap: 20,
  },
  button: { 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 }
  },
  pauseButton: { backgroundColor: '#fdcb6e' }, 
  resetButton: { backgroundColor: '#ff7675' }, 
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: 0.5 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(45, 52, 54, 0.9)', 
  },
  modalContent: { 
    width: '85%', 
    backgroundColor: '#fff', 
    padding: 25, 
    borderRadius: 20, 
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#2d3436',
  },
  modalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f2f6', 
    paddingBottom: 10, 
  },
  modalLabel: { fontSize: 16, color: '#636e72', fontWeight: '500' },
  modalValue: { fontSize: 18, fontWeight: 'bold', color: '#2d3436' },
  closeButton: { 
    marginTop: 20, 
    paddingVertical: 15,
    borderRadius: 15, 
    width: '100%', 
    alignItems: 'center', 
  },
});