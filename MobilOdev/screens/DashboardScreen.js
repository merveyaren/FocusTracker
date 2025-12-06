import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

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

      <View style={styles.statsSection}>
        <View style={styles.statCard}><Text style={styles.statLabel}>Bugün</Text><Text style={styles.statValue}>{stats.bugunOdak} dk</Text></View>
        <View style={[styles.statCard, { borderLeftColor: '#3498db' }]}><Text style={styles.statLabel}>Toplam</Text><Text style={[styles.statValue, { color: '#3498db' }]}>{stats.toplamOdak} dk</Text></View>
        <View style={[styles.statCard, { borderLeftColor: '#e74c3c' }]}><Text style={styles.statLabel}>Dikkat Dağ.</Text><Text style={[styles.statValue, { color: '#e74c3c' }]}>{stats.dikkatDaginikligi}</Text></View>
      </View>

      <View style={styles.chartBox}>
          {graphData.map((item, index) => (
            <View key={index} style={{alignItems: 'center', width: 30}}>
               <View style={{width: 14, backgroundColor: '#2c3e50', borderRadius: 4, height: (item.minutes / maxMinute) * 150}} />
               <Text style={{fontSize: 10, marginTop: 5}}>{item.day}</Text>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 20 },
  header: { fontSize: 30, fontWeight: 'bold', color: '#2c3e50', marginTop: 30, marginBottom: 20 },
  statsSection: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  statCard: { width: '30%', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#27ae60', elevation: 2 },
  statLabel: { fontSize: 10, color: '#777' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
  chartBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 180, backgroundColor: '#fff', padding: 15, borderRadius: 15, elevation: 2, marginTop: 20 }
});