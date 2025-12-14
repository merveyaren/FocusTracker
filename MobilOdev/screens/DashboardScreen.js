import React, { useState, useCallback } from "react";
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  ActivityIndicator, TouchableOpacity, Alert 
} from "react-native";
import { PieChart, BarChart } from "react-native-gifted-charts"; 
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Firebase
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from '../firebaseConfig';

export default function DashboardScreen() {
  // STATELER
  const [stats, setStats] = useState({ total: 0, today: 0, distractions: 0 });
  const [chartData, setChartData] = useState({ weekly: [], category: [] });
  const [loading, setLoading] = useState(false);

  // ÇIKIŞ İŞLEMİ
  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Hesabından çıkış yapmak istiyor musun?", [
      { text: "İptal", style: "cancel" },
      { text: "Evet", style: "destructive", onPress: () => signOut(auth) }
    ]);
  };

  // --- SÜRE (dk -> sa dk) ---
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} dk`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs} sa ${mins} dk`;
  };

  // VERİ ÇEKME VE HESAPLAMA
  const fetchData = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      // 1. Veritabanı Sorgusu
      const q = query(
        collection(db, "sessions"), 
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      // Geçici Değişkenler
      let totalTime = 0, todayTime = 0, totalDistractions = 0;
      let categoryMap = {};
      
      // Tarih Hesapları
      const now = new Date();
      const startOfToday = new Date(now.setHours(0,0,0,0));
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Haftalık Grafik Şablonu
      const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
      let weeklyTemp = Array(7).fill(0).map((_, i) => ({
        label: days[i], value: 0, frontColor: '#6c5ce7',
        topLabelComponent: () => <Text style={{color: '#6c5ce7', fontSize: 10, marginBottom: 2}}>0</Text>
      }));

      // 2. Verileri İşle
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const duration = data.duration || 0;
        const sessionDate = data.createdAt?.toDate();

        // Genel Toplamlar
        totalTime += duration;
        totalDistractions += (data.distractions || 0);

        // Tarih Kontrolleri
        if (sessionDate) {
          // Bugün mü?
          if (sessionDate >= startOfToday) todayTime += duration;

          // Son 7 gün mü? (Bar Chart)
          if (sessionDate >= sevenDaysAgo) {
            const dayIndex = sessionDate.getDay();
            weeklyTemp[dayIndex].value += duration;
            // Grafik üzerindeki sayı etiketi
            weeklyTemp[dayIndex].topLabelComponent = () => (
               <Text style={{color: '#6c5ce7', fontSize: 10, marginBottom: 2}}>
                 {weeklyTemp[dayIndex].value}
               </Text>
            );
          }
        }

        // Kategori Gruplama (Pie Chart)
        categoryMap[data.category] = (categoryMap[data.category] || 0) + duration;
      });

      // 3. Pasta Grafiği Verisini Hazırla
      const colors = ['#00b894', '#6c5ce7', '#fab1a0', '#0984e3', '#fdcb6e'];
      const pieTemp = Object.keys(categoryMap).map((key, index) => ({
        value: categoryMap[key],
        color: colors[index % colors.length],
        text: `${Math.round((categoryMap[key] / totalTime) * 100)}%`,
        legend: key 
      }));

      // State Güncelleme
      setStats({ total: totalTime, today: todayTime, distractions: totalDistractions });
      setChartData({ weekly: weeklyTemp, category: pieTemp });

    } catch (error) {
      console.error("Veri hatası:", error);
    }
    setLoading(false);
  };

  // Sayfa her odaklandığında veriyi yenile
  useFocusEffect(useCallback(() => { fetchData(); }, []));

  
  const CenterLabel = () => (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2d3436' }}>{chartData.category.length}</Text>
      <Text style={{ fontSize: 10, color: '#636e72' }}>Kategori</Text>
    </View>
  );

  const renderLegend = () => (
    <View style={styles.legendContainer}>
      {chartData.category.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.legend}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
      showsVerticalScrollIndicator={false}
    >
      {/* BAŞLIK */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Haftalık Analiz 📈</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ff7675" />
        </TouchableOpacity>
      </View>

      {/* İSTATİSTİK KARTLARI */}
      <View style={styles.statsRow}>
        <StatCard label="Bugün" value={formatTime(stats.today)} color="#00b894" />
        <StatCard label="Toplam" value={formatTime(stats.total)} color="#6c5ce7" />
        <StatCard label="Dikkat" value={stats.distractions} color="#ff7675" />
      </View>

      {/*  ÇUBUK GRAFİK (BAR CHART)  */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Günlük Performans (dk)</Text>
        {loading ? <ActivityIndicator color="#6c5ce7" /> : (
          <View style={{ overflow: 'hidden' }}> 
            <BarChart
              data={chartData.weekly}
              barWidth={22}
              noOfSections={4}
              barBorderRadius={4}
              frontColor="#6c5ce7"
              yAxisThickness={0}
              xAxisThickness={0}
              isAnimated
              rulesColor="#f1f2f6"
              yAxisTextStyle={{color: '#b2bec3'}}
              xAxisLabelTextStyle={{color: '#636e72', fontSize: 10}}
            />
          </View>
        )}
      </View>

      {/* PASTA GRAFİK (PIE CHART) */}
      <View style={[styles.chartCard, { marginBottom: 50 }]}>
        <Text style={styles.cardTitle}>Kategori Dağılımı</Text>
        {loading ? <ActivityIndicator color="#6c5ce7" /> : chartData.category.length > 0 ? (
          <View style={{ alignItems: 'center' }}>
            <PieChart
              data={chartData.category}
              donut 
              showText
              textColor="black"
              radius={120}
              innerRadius={80} 
              textSize={12}
              centerLabelComponent={CenterLabel} 
            />
            {renderLegend()}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Henüz veri yok. 📉</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Kart Bileşeni 
const StatCard = ({ label, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color: color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "#2d3436" },
  logoutButton: { padding: 8, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },

  // İstatistik Kartları
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { 
    width: '31%', backgroundColor: "#fff", paddingVertical: 15, borderRadius: 12, 
    borderLeftWidth: 3, elevation: 3, alignItems: 'center', shadowOpacity: 0.1 
  },
  statLabel: { fontSize: 11, color: "#b2bec3", fontWeight: "bold", marginBottom: 5 },
  statValue: { fontSize: 16, fontWeight: "bold", textAlign: 'center' },

  // Grafikler
  chartCard: { backgroundColor: "#fff", padding: 20, borderRadius: 20, marginBottom: 20, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#2d3436", marginBottom: 20, textAlign: "center" },
  
  // Legend (Açıklama)
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { fontSize: 12, color: "#636e72" },

  // Boş Durum
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#b2bec3' }
});