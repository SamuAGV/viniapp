import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.welcome}>¡Bienvenido, {user?.name}! 👋</Text>
        <Text style={styles.message}>
          Esta aplicación está diseñada con principios de accesibilidad y usabilidad.
        </Text>
        <View style={styles.features}>
          <Text style={styles.feature}>✅ Diseño responsivo</Text>
          <Text style={styles.feature}>♿ Accesibilidad integrada</Text>
          <Text style={styles.feature}>📱 Compatible con lectores de pantalla</Text>
          <Text style={styles.feature}>🔍 Texto escalable</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 24,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  features: {
    marginTop: 8,
  },
  feature: {
    fontSize: 15,
    color: '#34495e',
    marginVertical: 6,
    paddingLeft: 8,
  },
});