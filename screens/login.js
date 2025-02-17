import React, { useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import {Text, Card, Button } from 'react-native-paper';
import { Input, NativeBaseProvider, Box} from 'native-base';

import Footer from '../components/Footer';

export default function Login({ navigation }) {  // Recibe la prop `navigation`
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [displayText, setDisplayText] = useState({
    user: "",
    pass: "",
  });

  const handlePress = () => {
    setDisplayText({
      user: user,
      pass: pass,
    });

    setUser("");
    setPass("");
  };

  return (
    <NativeBaseProvider> 
      <View style={styles.container}>
        <Box>
          <Card.Content style={{ boxShadow: '50%', borderRadius: 10, backgroundColor: '#f0f0f0', alignItems: 'center', width: 350, height: 600, marginBottom: 80 }}>
            <Text variant="displayLarge" style={{ margin: 40 }}>Login</Text>
            <Card.Content >
              <Image source={require('../assets/user.png')} style={styles.image} />
            </Card.Content>
            <Input
              variant="underlined"
              placeholder="User"
              value={user}
              onChangeText={setUser}
              style={styles.input}
            />
            <Input
              variant="underlined"
              placeholder="Password"
              value={pass}
              onChangeText={setPass}
              style={styles.input}
              secureTextEntry={true}
            />
            
            {/* Separando el texto y el TouchableOpacity */}
            <Text style={styles.text}>Don't have an Account?{" "}
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>  
                <Text style={styles.link}>Register</Text>
              </TouchableOpacity>
            </Text>

            <Button 
            icon="account" 
            mode="contained" 
            onPress={() => navigation.navigate('MainBuyer')} 
            style={{ margin: 25, backgroundColor: '#4f4f4f' }}>
              Login
              </Button>
          </Card.Content>

          <StatusBar style="auto" />

        </Box>

        <Footer />
      </View>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    margin: 20,
    width: 300,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    margin: 20
  },
  link: {
    color: '#3498db',
    marginLeft: 10,
  },
  title: {
    marginBottom: 50,
  },
});
