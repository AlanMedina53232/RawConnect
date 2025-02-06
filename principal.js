import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Footer from '../components/Footer';

export default function Principal({ navigation }) {  // Accedemos al prop navigation
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la Pantalla Principal</Text>

      <Footer/>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
