import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

export default function DashboardScreen() {
  const [stats] = useState({
    bugunOdak: 45,           
    toplamOdak: 1240,        
    dikkatDaginikligi: 12    
  });

  const graphData = [
    { day: "Pzt", minutes: 30 }, { day: "Sal", minutes: 60 },
    { day: "Çar", minutes: 45 }, { day: "Per", minutes: 90 }, 
    { day: "Cum", minutes: 20 }, { day: "Cmt", minutes: 120 }, 
    { day: "Paz", minutes: 10 },
  ];
  const maxMinute = Math.max(...graphData.map(item => item.minutes));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📊 Raporlar</Text>

      {/* --- İSTATİSTİK KARTLARI --- */}
      <View style={styles.statsSection}>
        
        {/* Kart 1: Bugün (Mint Yeşili - Pozitif) */}
        <View style={[styles.statCard, { borderLeftColor: '#00b894' }]}>
          <Text style={styles.statLabel}>Bugün</Text>
          <Text style={[styles.statValue, { color: '#00b894' }]}>{stats.bugunOdak} dk</Text>
        </View>

        {/* Kart 2: Toplam (Mor - Ana Renk) */}
        <View style={[styles.statCard, { borderLeftColor: '#6c5ce7' }]}>
          <Text style={styles.statLabel}>Toplam</Text>
          <Text style={[styles.statValue, { color: '#6c5ce7' }]}>{stats.toplamOdak} dk</Text>
        </View>

        {/* Kart 3: Dikkat (Kırmızı - Uyarı) */}
        <View style={[styles.statCard, { borderLeftColor: '#ff7675' }]}>
          <Text style={styles.statLabel}>Dikkat Dağ.</Text>
          <Text style={[styles.statValue, { color: '#ff7675' }]}>{stats.dikkatDaginikligi}</Text>
        </View>
      </View>

      {/* --- GRAFİK ALANI --- */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Haftalık Performans</Text>
        
        <View style={styles.chartBox}>
          {/* Arka plandaki çizgiler (Dekoratif) */}
          <View style={styles.gridLines}>
             <View style={styles.gridLine} />
             <View style={styles.gridLine} />
             <View style={styles.gridLine} />
          </View>

          {/* Çubuklar */}
          {graphData.map((item, index) => {
             // Yükseklik hesabı
             const height = (item.minutes / maxMinute) * 150;
             // En yüksek günü belirgin yap
             const isMax = item.minutes === maxMinute;

             return (
              <View key={index} style={styles.barWrapper}>
                 {/* Dakika Baloncuğu (Sadece uzun çubuklarda göster) */}
                 {height > 50 && (
                   <Text style={styles.barValueText}>{item.minutes}</Text>
                 )}
                 
                 {/* Çubuğun Kendisi */}
                 <View style={[
                    styles.bar, 
                    { 
                      height: height || 5, // 0 olsa bile minik görünsün
                      backgroundColor: isMax ? '#6c5ce7' : '#a29bfe', // Max ise koyu mor, değilse açık mor
                      opacity: isMax ? 1 : 0.7 
                    }
                 ]} />
                 
                 {/* Gün İsmi */}
                 <Text style={styles.dayText}>{item.day}</Text>
              </View>
             );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', // Kırık Beyaz
    padding: 20 
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#2d3436', 
    marginTop: 40, 
    marginBottom: 25,
    letterSpacing: 0.5
  },
  
  // İSTATİSTİK KARTLARI
  statsSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 30 
  },
  statCard: { 
    width: '31%', // Ekrana tam sığsın diye
    backgroundColor: '#fff', 
    paddingVertical: 15,
    paddingHorizontal: 10, 
    borderRadius: 15, 
    borderLeftWidth: 4, 
    // Gölgeler (Shadow)
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'center'
  },
  statLabel: { 
    fontSize: 12, 
    color: '#636e72', 
    marginBottom: 5,
    fontWeight: '600'
  },
  statValue: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },

  // GRAFİK TASARIMI
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#6c5ce7', // Mor gölge
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 50
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 20
  },
  chartBox: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    height: 180,
    position: 'relative' // Çizgiler için gerekli
  },
  // Arka Plan Çizgileri
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingBottom: 20,
    zIndex: -1
  },
  gridLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#f1f2f6'
  },
  // Çubuklar
  barWrapper: {
    alignItems: 'center', 
    width: 30,
    justifyContent: 'flex-end'
  },
  bar: {
    width: 16, // Biraz daha kalın
    borderRadius: 8, // Tam yuvarlak köşeler
    marginBottom: 8,
  },
  dayText: {
    fontSize: 11,
    color: '#636e72',
    fontWeight: 'bold'
  },
  barValueText: {
    fontSize: 10,
    color: '#a29bfe',
    marginBottom: 2,
    fontWeight: 'bold'
  }
});