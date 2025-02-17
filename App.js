import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Principal from './screens/principal';  // Pantalla Principal
import Login from './screens/login';  // Pantalla Login
import Register from './screens/register';
import MainBuyer from './Buyer/MainBuyer';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Principal">
        <Stack.Screen
          name="Principal"
          component={Principal}
          options={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Login/Register</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register}/>
        <Stack.Screen name="MainBuyer" component={MainBuyer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  link: {
    color: '#444141',
    marginHorizontal: 20,
    textDecorationLine: 'underline',
  },
});
