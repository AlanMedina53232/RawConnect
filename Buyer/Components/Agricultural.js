// Buyer/DetailsBuyer.js
import React from 'react';
import { Button, Text, View } from 'react-native';

export default function Categotys({ navigation }) {
    return (
        <View>
            <Text>¡Bienvenido a DetailsBuyer!</Text>
            <Button title="Volver" onPress={() => navigation.goBack()} />
        </View>
    );
}