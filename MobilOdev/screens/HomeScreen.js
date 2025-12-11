import { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, AppState, Modal, StatusBar 
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function HomeScreen() {
  // 1. YENİ STATE: Başlangıç süresini tutuyoruz (Değiştirilebilir)
  const [initialTime, setInitialTime] = useState(25 * 60); 
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState("📚 Ders"); 
  const [distractionCount, setDistractionCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  const appState = useRef(AppState.currentState);

  // --- SÜRE DEĞİŞTİRME MANTIĞI ---
  const changeTime = (minutes) => {
    const newTime = initialTime + (minutes * 60);
    // Sınırlar: En az 5 dk, En çok 120 dk
    if (newTime >= 5 * 60 && newTime <= 120 * 60) {
      setInitialTime(newTime);
      setTimeLeft(newTime); // Sayacı da hemen güncelle
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setShowSummary(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) && 
        nextAppState.match(/inactive|background/) &&
        isActive
      ) {
        setIsActive(false);
        setDistractionCount((prev) => prev + 1);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleReset = () => {
    setIsActive(false);
    // Sıfırlarken "initialTime" neyse ona dön
    setTimeLeft(initialTime); 
    setDistractionCount(0);
  };
const quotes = [
  "Başlamak, bitirmenin yarısıdır. 🚀",
  "Bugün ektiğin tohumlar, yarın çiçek açacak. 🌱",
  "Odaklanmak, hayır diyebilme sanatıdır. 🎨",
  "Yorgun olduğunda değil, bittiğinde dur. 💪",
  "Kod yazmak bir süper güçtür. 💻"
];
// Rastgele birini seçmek için:
const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const handleFinish = async () => {
    setIsActive(false);
    
    // 1. Süreyi hesapla
    const focusDuration = Math.floor((initialTime - timeLeft) / 60);
    
    // 2. Eğer süre 0 ise kaydetme (opsiyonel)
    if (focusDuration <= 0) {
        setShowSummary(true);
        return;
    }

    try {
      // 3. Firebase Firestore'a kaydet (CREATE)
      await addDoc(collection(db, "sessions"), {
        userId: auth.currentUser.uid, // Hangi kullanıcı kaydetti?
        category: category,
        duration: focusDuration, // Dakika cinsinden
        distractions: distractionCount,
        createdAt: serverTimestamp() // Sunucu saati
      });
      console.log("Seans kaydedildi!");
    } catch (error) {
      console.error("Hata:", error);
    }

    setShowSummary(true);
  };

  const closeSummary = () => {
    setShowSummary(false);
    handleReset();
  };

  const categories = ["📚 Ders", "💻 Kodlama", "📖 Kitap", "🧘 Spor"];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" /> 
      
      <Text style={styles.header}>Pomodoro Sayacı ⏳</Text>

      {/* KATEGORİ SEÇİMİ */}
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.catButton, category === cat && styles.catButtonActive]}
            onPress={() => setCategory(cat)}
            disabled={isActive}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- YENİ EKLENEN SÜRE SEÇİM ALANI --- */}
      <View style={styles.timeSelector}>
         <TouchableOpacity 
            style={[styles.timeBtn, isActive && styles.disabledBtn]} 
            onPress={() => changeTime(-5)}
            disabled={isActive}
         >
            <Text style={styles.timeBtnText}>-5</Text>
         </TouchableOpacity>

         <View style={styles.timeDisplay}>
            <Text style={styles.timeLabel}>SÜRE</Text>
            <Text style={styles.timeValue}>{initialTime / 60} dk</Text>
         </View>

         <TouchableOpacity 
            style={[styles.timeBtn, isActive && styles.disabledBtn]} 
            onPress={() => changeTime(5)}
            disabled={isActive}
         >
            <Text style={styles.timeBtnText}>+5</Text>
         </TouchableOpacity>
      </View>

      {/* SAYAÇ DAİRESİ */}
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.distractionText}>
           Dikkat: {distractionCount}
        </Text>
      </View>

      {/* BUTONLAR */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isActive ? styles.pauseButton : styles.startButton]} 
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
            <Text style={styles.modalTitle}>Seans Özeti 📝</Text>
            
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Kategori:</Text>
              <Text style={styles.modalValue}>{category}</Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Hedef Süre:</Text>
              <Text style={styles.modalValue}>{initialTime / 60} dk</Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Çalışılan:</Text>
              <Text style={styles.modalValue}>
                {Math.floor((initialTime - timeLeft) / 60)} dk
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Dikkat Dağınıklığı:</Text>
              <Text style={[styles.modalValue, { color: '#ff7675' }]}>
                {distractionCount} Kez
              </Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={closeSummary}>
              <Text style={styles.buttonText}>Kaydet ve Kapat</Text>
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
  // Kategori
  categoryContainer: { 
    flexDirection: 'row', 
    marginBottom: 20, 
    gap: 10,
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
  catButtonActive: { 
    backgroundColor: '#6c5ce7', 
    borderColor: '#6c5ce7', 
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
  
  // --- YENİ EKLENEN SÜRE SEÇİCİ STİLLERİ ---
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
    color: '#6c5ce7'
  },
  timeDisplay: {
    marginHorizontal: 20,
    alignItems: 'center'
  },
  timeLabel: {
    fontSize: 10,
    color: '#b2bec3',
    fontWeight: 'bold',
    letterSpacing: 1
  },
  timeValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436'
  },

  // Sayaç
  timerCircle: { 
    width: 260, 
    height: 260, 
    borderRadius: 130, 
    borderWidth: 8, 
    borderColor: '#a29bfe', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 40, 
    backgroundColor: '#fff',
    elevation: 10, 
    shadowColor: '#6c5ce7',
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
    color: '#ff7675', 
    marginTop: 10, 
    fontSize: 16,
    fontWeight: '600'
  },
  // Butonlar
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
  startButton: { backgroundColor: '#00b894' }, 
  pauseButton: { backgroundColor: '#fdcb6e' }, 
  resetButton: { backgroundColor: '#ff7675' }, 
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: 0.5 
  },
  // Modal
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
    backgroundColor: '#6c5ce7', 
    paddingVertical: 15,
    borderRadius: 15, 
    width: '100%', 
    alignItems: 'center', 
  },
});