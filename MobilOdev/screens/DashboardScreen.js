import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, StatusBar } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

// Ekran genişliğini al
const screenWidth = Dimensions.get("window").width;

// --- 1. KÜÇÜK BİLEŞEN: İSTATİSTİK KARTI ---
// Hocanın istediği "Bileşen Bazlı" yapıya uygun olarak kartı ayırdık.
const StatCard = ({ title, value, color, icon }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statLabel}>{title} {icon}</Text>
    <Text style={[styles.statValue, { color: color }]}>{value}</Text>
  </View>
);

export default function DashboardScreen() {
  
  // SİMÜLASYON VERİLERİ
  const [stats] = useState({
    bugunOdak: 45,           
    toplamOdak: 1240,        
    dikkatDaginikligi: 12    
  });

  // --- GRAFİK 1: ÇUBUK GRAFİK (Son 7 Gün) ---
  const barData = {
    labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    datasets: [{ data: [30, 60, 45, 90, 20, 120, 10] }]
  };

  // --- GRAFİK 2: PASTA GRAFİK (Kategoriler) ---
  const pieData = [
    {
      name: "Kodlama",
      population: 50,
      color: "#6c5ce7", // Mor (Ana Renk)
      legendFontColor: "#7f7f7f",
      legendFontSize: 12
    },
    {
      name: "Ders",
      population: 30,
      color: "#00b894", // Mint (Başarı Rengi)
      legendFontColor: "#7f7f7f",
      legendFontSize: 12
    },
    {
      name: "Kitap",
      population: 20,
      color: "#ff7675", // Mercan (Vurgu Rengi)
      legendFontColor: "#7f7f7f",
      legendFontSize: 12
    }
  ];

  // Grafik Ayarları (Modern Tema)
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`, // Çubuklar Mor
    labelColor: (opacity = 1) => `rgba(99, 110, 114, ${opacity})`, // Yazılar Gri
    barPercentage: 0.6,
    decimalPlaces: 0, // Virgüllü sayı gösterme
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Status Bar Rengi */}
      <StatusBar barStyle="dark-content" />

      {/* BAŞLIK */}
      <Text style={styles.header}>Haftalık Özet 📑</Text>

      {/* --- BÖLÜM 1: GENEL İSTATİSTİKLER --- */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Genel Durum 📌</Text>
        <View style={styles.statsRow}>
          <StatCard title="Bugün" value={`${stats.bugunOdak} dk`} color="#00b894" icon="🔥" />
          <StatCard title="Toplam" value={`${stats.toplamOdak} dk`} color="#6c5ce7" icon="⏳" />
          <StatCard title="Dikkat" value={`${stats.dikkatDaginikligi}`} color="#ff7675" icon="⚠️" />
        </View>
      </View>

      {/* --- BÖLÜM 2: ÇUBUK GRAFİK --- */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Günlük Performans 📊</Text>
        <BarChart
          data={barData}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix=" dk"
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero={true}
          showValuesOnTopOfBars={true}
          withInnerLines={false} // Arkadaki çizgileri kaldırdık (daha temiz)
          style={styles.chartStyle}
        />
      </View>

      {/* --- BÖLÜM 3: PASTA GRAFİK --- */}
      <View style={[styles.chartContainer, { marginBottom: 50 }]}>
        <Text style={styles.chartTitle}>Kategori Dağılımı 🍰</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', // Kırık Beyaz Arka Plan
    padding: 20,
    paddingTop: 40
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#2d3436', 
    marginBottom: 25,
    textAlign: 'center' // Ortalanmış Başlık
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#636e72',
    marginBottom: 15,
    marginLeft: 5,
    letterSpacing: 0.5
  },
  // İstatistik Kartları Tasarımı
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  statCard: { 
    width: '31%', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 15, 
    borderLeftWidth: 4, 
    // Kart Gölgelendirme (3D Efekt)
    elevation: 4, 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'center',
    alignItems: 'center'
  },
  statLabel: { 
    fontSize: 12, 
    color: '#b2bec3', 
    fontWeight: 'bold',
    marginBottom: 8 
  },
  statValue: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  // Grafik Kutuları Tasarımı
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
    // Grafik Kutusu Gölgesi
    elevation: 3,
    shadowColor: '#6c5ce7', // Mor gölge
    shadowOpacity: 0.05,
    shadowRadius: 10,
    alignItems: 'center'
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
    alignSelf: 'flex-start', // Sola yasla
    marginLeft: 10
  },
  chartStyle: {
    borderRadius: 16,
    marginTop: 10
  }
});