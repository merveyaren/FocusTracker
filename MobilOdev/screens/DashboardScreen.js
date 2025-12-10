import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";

export default function DashboardScreen() {
  const [todayFocus, setTodayFocus] = useState(0);
  const [totalFocus, setTotalFocus] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);

  const [last7DaysData, setLast7DaysData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    // TODO: Veritabanı verilerini buradan okuyacaksın.
    // Aşağıdaki örnek dummy veridir, veritabanına bağlanınca burayı doldururuz.

    setTodayFocus(120);          // 120 dakika
    setTotalFocus(1430);         // 1430 dakika
    setDistractionCount(12);     // 12 kere

    setLast7DaysData([
      { value: 60, label: "Pzt" },
      { value: 45, label: "Sal" },
      { value: 80, label: "Çar" },
      { value: 30, label: "Per" },
      { value: 100, label: "Cum" },
      { value: 50, label: "Cts" },
      { value: 90, label: "Paz" },
    ]);

    setCategoryData([
      { value: 50, label: "Kodlama", color: "#4CAF50" },
      { value: 30, label: "Ders", color: "#2196F3" },
      { value: 20, label: "Kitap", color: "#FF9800" },
    ]);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Raporlar (Dashboard)</Text>

      {/* GENEL İSTATİSTİKLER */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Genel İstatistikler</Text>
        <Text style={styles.cardItem}>Bugün Toplam Odaklanma: {todayFocus} dk</Text>
        <Text style={styles.cardItem}>Tüm Zamanların Odaklanması: {totalFocus} dk</Text>
        <Text style={styles.cardItem}>Dikkat Dağınıklığı Sayısı: {distractionCount}</Text>
      </View>

      {/* 7 GÜNLÜK BAR CHART */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Son 7 Gün – Odaklanma Süreleri</Text>

        <BarChart
          barWidth={22}
          noOfSections={4}
          barBorderRadius={6}
          data={last7DaysData}
          frontColor="#2196F3"
          yAxisTextStyle={{ color: "#555" }}
          xAxisLabelTextStyle={{ color: "#555" }}
        />
      </View>

      {/* KATEGORİ PIE CHART */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kategorilere Göre Odaklanma</Text>

        <PieChart
          data={categoryData}
          radius={120}
          showText
          textColor="#fff"
          textSize={14}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  cardItem: { fontSize: 16, color: "#333", marginBottom: 5 },
});
