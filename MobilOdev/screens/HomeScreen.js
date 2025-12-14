import { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, AppState, Modal, StatusBar, Alert 
} from 'react-native';
import { Audio } from 'expo-av'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { db, auth } from '../firebaseConfig'; 

export default function HomeScreen() {
  // STATE TANIMLARI
  const [isBreak, setIsBreak] = useState(false);        // Mola modu mu?
  const [initialTime, setInitialTime] = useState(25 * 60); // Başlangıç süresi (sn)
  const [timeLeft, setTimeLeft] = useState(25 * 60);    // Kalan süre (sn)
  const [isActive, setIsActive] = useState(false);      // Sayaç çalışıyor mu?
  const [category, setCategory] = useState("Ders");     // Seçili kategori
  const [distractionCount, setDistractionCount] = useState(0); // Dikkat dağınıklığı sayısı
  const [showSummary, setShowSummary] = useState(false); // Modal görünürlüğü
  
  // Ses ve Uygulama Durumu
  const [sound, setSound] = useState();
  const appState = useRef(AppState.currentState);

  // Mola: Yeşil Odak: Mor
  const themeColor = isBreak ? '#00b894' : '#6c5ce7'; 

  // SES AYARLARI (Sessiz modda çalması için) 
  useEffect(() => {
    async function configureAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.log("Ses ayar hatası:", e);
      }
    }
    configureAudio();
  }, []);

  // SES FONKSİYONLARI
  async function playSound() {
    try {
      // Varsa eski sesi temizle
      if (sound) await sound.unloadAsync();

      // Yeni sesi yükle ve çal
      const { sound: newSound } = await Audio.Sound.createAsync(
         require('../assets/alarm.mp3'), 
         { shouldPlay: true } 
      );
      setSound(newSound);
    } catch (error) {
      Alert.alert("Hata", "Ses çalınamadı.");
    }
  }

  async function stopSound() {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  }

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  // VERİTABANI KAYDI
  async function saveSession() {
    // Mola modundaysak veya kullanıcı yoksa kaydetme
    if (isBreak || !auth.currentUser) return;

    const elapsedSeconds = initialTime - timeLeft;
    const durationInMinutes = Math.floor(elapsedSeconds / 60);
    if (durationInMinutes < 1) {
      console.log("Süre 1 dakikadan az, kaydedilmedi.");
      return; 
    }
    try {
      await addDoc(collection(db, "sessions"), {
        userId: auth.currentUser.uid,
        category: category,
        duration: durationInMinutes, // Dakika cinsinden
        distractions: distractionCount,
        createdAt: serverTimestamp()
      });
      console.log("Oturum kaydedildi.");
    } catch (error) {
      console.error(" Kayıt hatası:", error);
    }
  }

  // ZAMANLAYICI VE MOD MANTIĞI
  
  // Süre değiştir (+5 / -5 dk)
  const changeTime = (minutes) => {
    const newTime = initialTime + (minutes * 60);
    if (newTime >= 60 && newTime <= 7200) {
      setInitialTime(newTime);
      setTimeLeft(newTime); 
    }
  };

  // Mod değiştir (Odaklan / Mola)
  const switchMode = (mode) => {
    stopSound(); 
    setIsActive(false);
    if (mode === 'break') {
      setIsBreak(true);
      setInitialTime(5 * 60); // Mola: 5 dk
      setTimeLeft(5 * 60);
    } else {
      setIsBreak(false);
      setInitialTime(25 * 60); // Odak: 25 dk
      setTimeLeft(25 * 60);
    }
  };

  // Sayaç Döngüsü
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // SÜRE BİTTİ
      setIsActive(false);
      playSound();   // Alarm çal
      saveSession(); // Kaydet
      setShowSummary(true); 
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // DİKKAT DAĞINIKLIĞI TAKİBİ
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Uygulama alta atılırsa (Background) ve sayaç çalışıyorsa
      if (
        appState.current.match(/active/) && 
        nextAppState.match(/inactive|background/) &&
        isActive && !isBreak 
      ) {
        setIsActive(false); // Duraklat
        setDistractionCount((prev) => prev + 1); // Sayacı artır
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive, isBreak]);

  // YARDIMCI FONKSİYONLAR
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFinish = () => {
    setIsActive(false);
    saveSession();
    setShowSummary(true);
  };

  const closeSummary = () => {
    stopSound();
    setShowSummary(false);
    setIsActive(false);
    setTimeLeft(initialTime); // Süreyi başa sar
    setDistractionCount(0);   // Dikkat sayacını sıfırla
  };

  const categories = ["Ders", "Kodlama", "Kitap", "Proje"];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" /> 
      <Text style={styles.header}>Pomodoro Uygulaması</Text>

      {/*  MOD SEÇİMİ  */}
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

      {/*  KATEGORİLER (Sadece Odak Modunda)  */}
      {!isBreak && (
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catButton, category === cat && {backgroundColor: themeColor, borderColor: themeColor}]}
              onPress={() => setCategory(cat)}
              disabled={isActive}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Mola Mesajı */}
      {isBreak && (
        <View style={styles.breakMessageContainer}>
           <Text style={styles.breakMessageText}>☕ Kahveni al ve dinlen.</Text>
        </View>
      )}

      {/*  SÜRE AYARLAMA  */}
      <View style={styles.timeSelector}>
         <TouchableOpacity style={[styles.timeBtn, isActive && styles.disabledBtn]} onPress={() => changeTime(-5)} disabled={isActive}>
            <Text style={[styles.timeBtnText, {color: themeColor}]}>-5</Text>
         </TouchableOpacity>

         <View style={styles.timeDisplay}>
            <Text style={styles.timeLabel}>HEDEF SÜRE</Text>
            <Text style={styles.timeValue}>{Math.floor(initialTime / 60)} dk</Text>
         </View>

         <TouchableOpacity style={[styles.timeBtn, isActive && styles.disabledBtn]} onPress={() => changeTime(5)} disabled={isActive}>
            <Text style={[styles.timeBtnText, {color: themeColor}]}>+5</Text>
         </TouchableOpacity>
      </View>

      {/*  ANA SAYAÇ DAİRESİ  */}
      <View style={[styles.timerCircle, {borderColor: themeColor, shadowColor: themeColor}]}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        {!isBreak && (
           <Text style={[styles.distractionText, {color: '#ff7675'}]}>Dikkat: {distractionCount}</Text>
        )}
        {isBreak && (
            <Text style={[styles.distractionText, {color: themeColor}]}>İyi dinlenmeler!</Text>
        )}
      </View>

      {/* KONTROL BUTONLARI */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isActive ? styles.pauseButton : {backgroundColor: themeColor}]} 
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.buttonText}>{isActive ? "Duraklat" : "Başlat"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleFinish}>
          <Text style={styles.buttonText}>Bitir</Text>
        </TouchableOpacity>
      </View>

      {/*  SONUÇ MODALI  */}
      <Modal visible={showSummary} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isBreak ? "Mola Bitti! ☕" : "Seans Özeti "}</Text>
            
            {!isBreak && (
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Kategori:</Text>
                <Text style={styles.modalValue}>{category}</Text>
              </View>
            )}

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Toplam Süre:</Text>
              <Text style={styles.modalValue}>{Math.floor((initialTime - timeLeft) / 60)} dk</Text>
            </View>

            {!isBreak && (
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Dikkat Dağınıklığı:</Text>
                <Text style={[styles.modalValue, { color: '#ff7675' }]}>{distractionCount} Kez</Text>
              </View>
            )}

            <TouchableOpacity style={[styles.closeButton, {backgroundColor: themeColor}]} onPress={closeSummary}>
              <Text style={styles.buttonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', alignItems: 'center', paddingTop: 50 },
  header: { fontSize: 26, color: '#2d3436', fontWeight: 'bold', marginBottom: 20, letterSpacing: 1 },
  
  // Tablar
  tabContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#fff', borderRadius: 30, padding: 5, elevation: 2 },
  tabButton: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 25, borderWidth: 2, borderColor: 'transparent' },
  activeTab: { backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' },
  tabText: { fontWeight: 'bold', color: '#b2bec3' },

  // Kategori Butonları
  categoryContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  catButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#dfe6e9', backgroundColor: '#fff', elevation: 2 },
  catText: { color: '#b2bec3', fontWeight: '600', fontSize: 12 },
  catTextActive: { color: '#fff', fontWeight: 'bold' },

  // Mola Mesajı
  breakMessageContainer: { marginBottom: 20, padding: 10 },
  breakMessageText: { fontSize: 18, color: '#00b894', fontStyle: 'italic', fontWeight: '600' },

  // Süre Seçici
  timeSelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, backgroundColor: '#fff', padding: 10, borderRadius: 20, elevation: 3 },
  timeBtn: { backgroundColor: '#f1f2f6', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  disabledBtn: { opacity: 0.3 },
  timeBtnText: { fontSize: 18, fontWeight: 'bold' },
  timeDisplay: { marginHorizontal: 20, alignItems: 'center', minWidth: 80 },
  timeLabel: { fontSize: 10, color: '#b2bec3', fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 },
  timeValue: { fontSize: 22, fontWeight: 'bold', color: '#2d3436' },

  // Sayaç Yuvarlağı
  timerCircle: { 
    width: 260, height: 260, borderRadius: 130, borderWidth: 8, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 40, 
    backgroundColor: '#fff', elevation: 10, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }
  },
  timerText: { fontSize: 65, color: '#2d3436', fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  distractionText: { marginTop: 10, fontSize: 16, fontWeight: '600' },

  // Alt Butonlar
  buttonContainer: { flexDirection: 'row', gap: 20 },
  button: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 3 } },
  pauseButton: { backgroundColor: '#fdcb6e' }, 
  resetButton: { backgroundColor: '#ff7675' }, 
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },

  // Modal Tasarımı
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(45, 52, 54, 0.9)' },
  modalContent: { width: '85%', backgroundColor: '#fff', padding: 25, borderRadius: 20, alignItems: 'center', elevation: 10 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2d3436' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f2f6', paddingBottom: 10 },
  modalLabel: { fontSize: 16, color: '#636e72', fontWeight: '500' },
  modalValue: { fontSize: 18, fontWeight: 'bold', color: '#2d3436' },
  closeButton: { marginTop: 20, paddingVertical: 15, borderRadius: 15, width: '100%', alignItems: 'center' },
});