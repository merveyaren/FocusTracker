import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity, Alert } from "react-native";
import { PieChart, BarChart } from "react-native-gifted-charts"; 
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [totalFocus, setTotalFocus] = useState(0);       // Tüm Zamanlar
  const [todayFocus, setTodayFocus] = useState(0);       // YENİ: Bugün
  const [distractionCount, setDistractionCount] = useState(0); // Dikkat Dağınıklığı
  
  const [categoryData, setCategoryData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();

  // --- ÇIKIŞ FONKSİYONU ---
  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabından çıkış yapmak istediğine emin misin?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Çıkış Yap", style: "destructive", onPress: async () => await signOut(auth) }
      ]
    );
  };

  // Dakikayı Saate Çevirme (Örn: 1 sa 30 dk)
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} dk`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs} sa ${mins} dk`;
  };

  const fetchData = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, "sessions"), 
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      
      let calcTotalTime = 0;
      let calcTodayTime = 0; // Bugünün toplamı
      let calcTotalDistraction = 0;
      let categories = {};
      
      // Tarih Ayarları
      const now = new Date();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0); // Bugünün başlangıcı (00:00)

      // Haftalık Grafik İçin Hazırlık
      const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
      let tempWeekly = Array(7).fill(0).map((_, i) => ({
        label: days[i],
        value: 0,
        frontColor: '#6c5ce7',
        topLabelComponent: () => <Text style={{color: '#6c5ce7', fontSize: 10, marginBottom: 2}}>0</Text>
      }));
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const duration = data.duration || 0;
        
        // 1. Tüm Zamanlar Toplamı
        calcTotalTime += duration;
        calcTotalDistraction += data.distractions || 0;

        // 2. Bugünün Toplamı (Tarih Kontrolü)
        if (data.createdAt) {
            const sessionDate = data.createdAt.toDate();
            if (sessionDate >= startOfToday) {
                calcTodayTime += duration;
            }

            // 3. Haftalık Grafik Verisi
            if (sessionDate >= sevenDaysAgo) {
                const dayIndex = sessionDate.getDay();
                tempWeekly[dayIndex].value += duration;
                tempWeekly[dayIndex].topLabelComponent = () => (
                   <Text style={{color: '#6c5ce7', fontSize: 10, marginBottom: 2}}>
                     {tempWeekly[dayIndex].value}
                   </Text>
                );
            }
        }

        // 4. Kategori Verisi
        if (categories[data.category]) {
          categories[data.category] += duration;
        } else {
          categories[data.category] = duration;
        }
      });

      // State'leri Güncelle
      setTotalFocus(calcTotalTime);
      setTodayFocus(calcTodayTime); // YENİ
      setDistractionCount(calcTotalDistraction);
      setWeeklyData(tempWeekly);

      // Pie Chart Renkleri
      const colors = ['#00b894', '#6c5ce7', '#fab1a0', '#0984e3', '#fdcb6e'];
      const pieData = Object.keys(categories).map((key, index) => ({
        value: categories[key],
        color: colors[index % colors.length],
        text: `${Math.round((categories[key] / calcTotalTime) * 100)}%`,
        legend: key 
      }));
      setCategoryData(pieData);

    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const CenterLabel = () => (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2d3436' }}>{categoryData.length}</Text>
      <Text style={{ fontSize: 10, color: '#636e72' }}>Kategori</Text>
    </View>
  );

  const renderLegend = () => (
    <View style={styles.legendContainer}>
      {categoryData.map((item, index) => (
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
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Haftalık Analiz 📈</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ff7675" />
        </TouchableOpacity>
      </View>

      {/* --- YENİLENMİŞ İSTATİSTİK KARTLARI (3 Tane Yan Yana) --- */}
      <View style={styles.statsRow}>
        {/* KART 1: BUGÜN */}
        <View style={[styles.statCard, { borderLeftColor: '#00b894' }]}>
          <Text style={styles.statLabel}>Bugün</Text>
          <Text style={[styles.statValue, { color: '#00b894' }]}>{formatTime(todayFocus)}</Text>
        </View>

        {/* KART 2: TOPLAM */}
        <View style={[styles.statCard, { borderLeftColor: '#6c5ce7' }]}>
          <Text style={styles.statLabel}>Toplam</Text>
          <Text style={[styles.statValue, { color: '#6c5ce7' }]}>{formatTime(totalFocus)}</Text>
        </View>

        {/* KART 3: DİKKAT */}
        <View style={[styles.statCard, { borderLeftColor: '#ff7675' }]}>
          <Text style={styles.statLabel}>Dikkat</Text>
          <Text style={[styles.statValue, { color: '#ff7675' }]}>{distractionCount}</Text>
        </View>
      </View>

      {/* --- BAR CHART (ÇUBUK GRAFİK) --- */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Günlük Performans (dk)</Text>
        {loading ? <ActivityIndicator size="small" color="#6c5ce7" /> : (
          <View style={{ overflow: 'hidden' }}> 
            <BarChart
              data={weeklyData}
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

      {/* --- PIE CHART (HALKA GRAFİK) --- */}
      <View style={[styles.chartCard, { marginBottom: 50 }]}>
        <Text style={styles.cardTitle}>Kategori Dağılımı</Text>
        {loading ? <ActivityIndicator size="large" color="#6c5ce7" /> : categoryData.length > 0 ? (
          <View style={{ alignItems: 'center' }}>
            <PieChart
              data={categoryData}
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
            <Text style={styles.emptyText}>Henüz veri bulunmuyor. 📉</Text>
          </View>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "#2d3436" },
  logoutButton: {
    padding: 8, backgroundColor: '#fff', borderRadius: 12, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {width: 0, height: 1}
  },

  // İstatistik Kartları (3'lü yapı)
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { 
    width: '31%', // Ekrana 3 tane sığması için %31 yaptık
    backgroundColor: "#fff", 
    paddingVertical: 15, paddingHorizontal: 5, 
    borderRadius: 12, 
    borderLeftWidth: 3, 
    elevation: 3, 
    alignItems: 'center', // Yazıları ortaladık
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 } 
  },
  statLabel: { fontSize: 11, color: "#b2bec3", fontWeight: "bold", marginBottom: 5 },
  statValue: { fontSize: 16, fontWeight: "bold", textAlign: 'center' },

  chartCard: { 
    backgroundColor: "#fff", padding: 20, borderRadius: 20, marginBottom: 20, 
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.05
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#2d3436", marginBottom: 20, textAlign: "center" },
  
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { fontSize: 12, color: "#636e72" },

  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#b2bec3' }
});