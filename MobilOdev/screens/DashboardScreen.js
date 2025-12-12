import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Dimensions } from "react-native";
import { PieChart } from "react-native-gifted-charts"; 
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen() {
  const [totalFocus, setTotalFocus] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);

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
      
      let totalTime = 0;
      let totalDistraction = 0;
      let categories = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalTime += data.duration || 0;
        totalDistraction += data.distractions || 0;

        if (categories[data.category]) {
          categories[data.category] += data.duration;
        } else {
          categories[data.category] = data.duration;
        }
      });

      setTotalFocus(totalTime);
      setDistractionCount(totalDistraction);

      const colors = ['#00b894', '#6c5ce7', '#fab1a0', '#0984e3', '#fdcb6e'];
      const pieData = Object.keys(categories).map((key, index) => ({
        value: categories[key],
        color: colors[index % colors.length],
        text: `${Math.round((categories[key] / totalTime) * 100)}%`,
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
    >
      <Text style={styles.header}>Haftalık Analiz 📈</Text>

      {/* İSTATİSTİK KARTLARI */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#00b894' }]}>
          <Text style={styles.statLabel}>Toplam Odak</Text>
          <Text style={[styles.statValue, { color: '#00b894' }]}>{formatTime(totalFocus)}</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#ff7675' }]}>
          <Text style={styles.statLabel}>Dikkat Dağ.</Text>
          <Text style={[styles.statValue, { color: '#ff7675' }]}>{distractionCount} Kez</Text>
        </View>
      </View>

      {/* GRAFİK ALANI */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Kategori Dağılımı</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#6c5ce7" style={{ marginVertical: 20 }} />
        ) : categoryData.length > 0 ? (
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
            <Text style={styles.subEmptyText}>Bir odaklanma seansı başlatarak istatistiklerinizi burada görebilirsiniz.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  header: { fontSize: 28, fontWeight: "bold", color: "#2d3436", marginBottom: 20, marginTop: 40, textAlign: "center" },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: "#fff", padding: 15, borderRadius: 15, borderLeftWidth: 4, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 } },
  statLabel: { fontSize: 12, color: "#b2bec3", fontWeight: "bold", marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: "bold" },
  chartCard: { backgroundColor: "#fff", padding: 20, borderRadius: 20, marginBottom: 30, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#2d3436", marginBottom: 20, textAlign: "center" },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { fontSize: 12, color: "#636e72" },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#b2bec3', marginBottom: 5 },
  subEmptyText: { fontSize: 12, color: '#dfe6e9', textAlign: 'center' }
});