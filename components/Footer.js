import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Footer = () => {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        <Text style={styles.footerText}>© CopyRight 2025</Text>
      </View>
    <View style={styles.footer}>
      <Text style={styles.text}>© CopyRight 2025 </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
  footer: {
    backgroundColor: '#000000',
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#ffff',
  },
  linkText: {
    fontSize: 14,
    color: '#3498db',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ecf0f1',
    marginBottom: 10,
  },
});

export default Footer;
