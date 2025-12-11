import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen() {
  const [totalFocus, setTotalFocus] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Sadece şu anki kullanıcının verilerini sorgula (READ)
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

        // Kategori hesabı
        if (categories[data.category]) {
          categories[data.category] += data.duration;
        } else {
          categories[data.category] = data.duration;
        }
      });

      setTotalFocus(totalTime);
      setDistractionCount(totalDistraction);

      // Pie Chart için veriyi formatla
      const pieData = Object.keys(categories).map((key, index) => ({
        value: categories[key],
        label: key,
        color: ['#00b894', '#0984e3', '#fdcb6e', '#e17055'][index % 4],
        text: `${key}`
      }));
      setCategoryData(pieData);

    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
    setLoading(false);
  };

  // Ekran her açıldığında veriyi yenile
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
    >
      <Text style={styles.title}>Raporlar 📊</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Genel İstatistikler</Text>
        <Text style={styles.cardItem}>Toplam Odaklanma: {totalFocus} dk</Text>
        <Text style={styles.cardItem}>Toplam Dikkat Dağınıklığı: {distractionCount}</Text>
      </View>

      {categoryData.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kategori Dağılımı</Text>
          <PieChart
            data={categoryData}
            radius={100}
            showText
            textColor="#fff"
            textSize={12}
            showTextBackground
            textBackgroundRadius={20}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  cardItem: { fontSize: 16, color: "#333", marginBottom: 5 },
});