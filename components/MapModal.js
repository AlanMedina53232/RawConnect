import React, { useState } from "react";
import { Modal, View, Button, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps"; // Asegúrate de que se importa correctamente MapView

const MapModal = ({ isVisible, onClose, onLocationSelect }) => {
  const [position, setPosition] = useState({
    latitude: 32.5149,
    longitude: -117.0382, // Tijuana
  });

  const handlePress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPosition({ latitude, longitude });
    onLocationSelect({ latitude, longitude });
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={{
            latitude: position.latitude,
            longitude: position.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={handlePress}
        >
          <Marker coordinate={position} />
        </MapView>
        <Button title="Cerrar" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fondo oscuro con transparencia
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    height: "80%",
    width: "100%",
  },
});

export default MapModal;
