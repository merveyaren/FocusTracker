import { useState, useEffect, useRef } from 'react'; // <-- Sadece kancaları alıyoruz
import { 
  View, Text, StyleSheet, TouchableOpacity, AppState, Modal 
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

      <Modal visible={showSummary} transparent={true} animationType="slide">
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
              <Text style={[styles.modalValue, { color: 'red' }]}>
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
  container: { flex: 1, backgroundColor: '#2c3e50', alignItems: 'center', paddingTop: 50 },
  header: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 20 },
  categoryContainer: { flexDirection: 'row', marginBottom: 30, gap: 10 },
  catButton: { padding: 10, borderRadius: 20, borderWidth: 1, borderColor: '#bdc3c7' },
  catButtonActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  catText: { color: '#bdc3c7' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  timerCircle: { width: 250, height: 250, borderRadius: 125, borderWidth: 5, borderColor: '#3498db', justifyContent: 'center', alignItems: 'center', marginBottom: 40, backgroundColor: 'rgba(52, 152, 219, 0.1)' },
  timerText: { fontSize: 60, color: '#fff', fontWeight: 'bold' },
  distractionText: { color: '#e74c3c', marginTop: 10, fontSize: 14 },
  buttonContainer: { flexDirection: 'row', gap: 20 },
  button: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  startButton: { backgroundColor: '#27ae60' },
  pauseButton: { backgroundColor: '#f39c12' },
  resetButton: { backgroundColor: '#c0392b' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  modalLabel: { fontSize: 16, color: '#7f8c8d' },
  modalValue: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  closeButton: { marginTop: 20, backgroundColor: '#3498db', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
});