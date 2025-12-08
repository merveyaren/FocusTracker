import { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, AppState, Modal, StatusBar 
} from 'react-native';

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState("Ders Çalışma");
  const [distractionCount, setDistractionCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  const appState = useRef(AppState.currentState);

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
    setTimeLeft(25 * 60);
    setDistractionCount(0);
  };

  const handleFinish = () => {
    setIsActive(false);
    setShowSummary(true);
  };

  const closeSummary = () => {
    setShowSummary(false);
    handleReset();
  };

  return (
    <View style={styles.container}>
      {/* Üstteki barın rengini koyu yapıyoruz ki beyaz ekranda görünsün */}
      <StatusBar barStyle="dark-content" /> 
      
      <Text style={styles.header}>Odaklanma Zamanı 🎯</Text>

      <View style={styles.categoryContainer}>
        {["Ders Çalışma", "Kodlama", "Kitap"].map((cat) => (
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

      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.distractionText}>
           Dikkat Dağınıklığı: {distractionCount}
        </Text>
      </View>

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

      <Modal visible={showSummary} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seans Özeti 📝</Text>
            
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Kategori:</Text>
              <Text style={styles.modalValue}>{category}</Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Süre:</Text>
              <Text style={styles.modalValue}>
                {Math.floor((25 * 60 - timeLeft) / 60)} dk
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

// --- YENİ RENK PALETİ VE TASARIM ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', // Kırık Beyaz (Modern Arkaplan)
    alignItems: 'center', 
    paddingTop: 60,
  },
  header: { 
    fontSize: 28, 
    color: '#2d3436', // Koyu Gri (Siyah yerine daha yumuşak)
    fontWeight: 'bold', 
    marginBottom: 30,
    letterSpacing: 1,
  },
  // Kategori Stilleri
  categoryContainer: { 
    flexDirection: 'row', 
    marginBottom: 40, 
    gap: 12,
  },
  catButton: { 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25, 
    borderWidth: 1.5, 
    borderColor: '#dfe6e9', 
    backgroundColor: '#fff',
    elevation: 2, // Hafif gölge
  },
  catButtonActive: { 
    backgroundColor: '#6c5ce7', // Modern Mor (Lila)
    borderColor: '#6c5ce7', 
  },
  catText: { 
    color: '#b2bec3', 
    fontWeight: '600',
  },
  catTextActive: { 
    color: '#fff', 
    fontWeight: 'bold', 
  },
  // Sayaç Stilleri
  timerCircle: { 
    width: 280, 
    height: 280, 
    borderRadius: 140, 
    borderWidth: 8, 
    borderColor: '#a29bfe', // Açık Mor
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 50, 
    backgroundColor: '#fff',
    elevation: 10, // Belirgin gölge (3D efekti)
    shadowColor: '#6c5ce7',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  timerText: { 
    fontSize: 70, 
    color: '#2d3436', // Koyu Gri
    fontWeight: 'bold', 
    fontVariant: ['tabular-nums'], // Rakamların titremesini engeller
  },
  distractionText: { 
    color: '#ff7675', // Soft Kırmızı
    marginTop: 10, 
    fontSize: 16,
    fontWeight: '600'
  },
  // Buton Stilleri
  buttonContainer: { 
    flexDirection: 'row', 
    gap: 20,
  },
  button: { 
    paddingVertical: 18, 
    paddingHorizontal: 40, 
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 }
  },
  startButton: { backgroundColor: '#00b894' }, // Mint Yeşili
  pauseButton: { backgroundColor: '#fdcb6e' }, // Hardal Sarısı
  resetButton: { backgroundColor: '#ff7675' }, // Soft Kırmızı (Mercan)
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: 0.5 
  },
  // Modal Stilleri
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(45, 52, 54, 0.8)', // Arkası hafif koyu
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
    backgroundColor: '#6c5ce7', // Ana Mor Renk
    paddingVertical: 15,
    borderRadius: 15, 
    width: '100%', 
    alignItems: 'center', 
  },
});