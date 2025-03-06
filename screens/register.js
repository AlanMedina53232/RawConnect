import React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Box, NativeBaseProvider, Text, Pressable, useColorModeValue } from "native-base";
import { TabView, SceneMap } from 'react-native-tab-view'; 
import { ScrollView } from 'react-native';

import { Card, Title, Paragraph } from 'react-native-paper'; 
import Footer from "../components/Footer";
import Reg from "../components/formReg"; 

export default function Register() {

  const FirstRoute = () => (
    <Box flex={1} my="4">
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <Box width="100%">
              <Reg />
            </Box>
          </ScrollView>
        </Card.Content>
      </Card>
    </Box>
  );
  
  const SecondRoute = () => (
    <Box flex={1} my="4">
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <Box width="100%">
              <Reg />
            </Box>
          </ScrollView>
        </Card.Content>
      </Card>
    </Box>
  );

  const initialLayout = {
    width: Dimensions.get('window').width
  };

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute
  });

  function Add() {
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
      { key: 'first', title: 'For a Buyer' },
      { key: 'second', title: 'For a Producer' }
    ]);

    const renderTabBar = props => {
      const inputRange = props.navigationState.routes.map((x, i) => i);
      return (
        <Box flexDirection="row" style={styles.tabBar}>
          {props.navigationState.routes.map((route, i) => {
            const color = index === i ? useColorModeValue('#000', '#e5e5e5') : useColorModeValue('#1f2937', '#a1a1aa');
            const borderColor = index === i ? 'cyan.500' : useColorModeValue('coolGray.200', 'gray.400');
            return (
              <Box
                borderBottomWidth="3"
                borderColor={borderColor}
                flex={1}
                alignItems="center"
                p="3"
                cursor="pointer"
                key={i}
              >
                <Pressable onPress={() => setIndex(i)}>
                  <Text style={{ color }}>{route.title}</Text>
                </Pressable>
              </Box>
            );
          })}
        </Box>
      );
    };

    return (
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        style={{ marginTop: StatusBar.currentHeight }}
      />
    );
  }

  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Box>
          <Add />
        </Box>

        <Footer />
      </View>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7', // Fondo gris claro para la pantalla
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  card: {
    width: '90%',
    height: '90%',
    marginTop: 20,
    marginRight: 20,
    marginLeft: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  cardContent: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Ajusta el contenido de la tarjeta al ancho
  },  
  tabBar: {
    width: '110%',
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});
