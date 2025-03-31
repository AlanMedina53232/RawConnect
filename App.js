import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { DefaultTheme, Provider as PaperProvider, Text } from "react-native-paper"
import Agricultural from "./Buyer/Components/Agricultural"
import ProductDetails from "./Buyer/Components/ProductDetails"
import MainBuyer from "./Buyer/MainBuyer"
import AddProductScreen from "./Producer/Components/add-product-screen"
import DeleteProduct from "./Producer/Components/DeleteProduct"
import EditProduct from "./Producer/Components/EditProduct"
import MyOrdersScreen from "./Producer/Components/my-orders-screen"
import MyProducts from "./Producer/Components/MyProducts"
import ProductManagementScreen from "./Producer/Components/product-management-screen"
import ProfileScreen from "./Producer/Components/profile-screen"
import { default as HomeScreen, default as MainProducer } from "./Producer/MainProducer"
import Login from "./screens/login"
import Principal from "./screens/principal"
import Register from "./screens/register"
import OrderDetails from "./Producer/Components/OrderDetails"

const Stack = createStackNavigator()

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2c3e50",
    accent: "#3498db",
    background: "#f8f9fa",
    surface: "#FFFFFF",
  },
}

function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Principal"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2c3e50',
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(236, 240, 241, 0.1)',
            },
            headerTitleStyle: {
              color: '#ecf0f1',
              fontSize: 20,
              fontWeight: '700',
              letterSpacing: 1,
              textTransform: 'uppercase',
            },
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            headerTintColor: '#ecf0f1',
          }}
        >
          <Stack.Screen
            name="Principal"
            component={Principal}
            options={({ navigation }) => ({
              headerTitle: () => null, // Remove the title
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
              ),
              // Center the button by adding left space
              headerLeft: () => <View style={{ width: 24, marginLeft: 15 }} />,
            })}
          />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen
            name="MainProducer"
            component={MainProducer}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MainBuyer"
            component={MainBuyer}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Agricultural" component={Agricultural} />
          <Stack.Screen name="ProductDetails" component={ProductDetails} />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{
              title: "My Profile",
              headerStyle: {
                backgroundColor: "#2c3e50",
              },
              headerTintColor: "#ecf0f1",
            }}
          />
          <Stack.Screen
            name="ProducerHome"
            component={HomeScreen}
            options={{
              headerShown: false,
              title: "Producer Dashboard",
            }}
          />
          <Stack.Screen
            name="ProductManagement"
            component={ProductManagementScreen}
            options={{
              headerShown: false,
              title: "Product Management",
            }}
          />
          <Stack.Screen
            name="AddProduct"
            component={AddProductScreen}
            options={{
              headerShown: false,
              title: "Add Product",
            }}
          />
          <Stack.Screen
            name="MyOrders"
            component={MyOrdersScreen}
            options={{
              headerShown: false,
              title: "My Orders",
            }}
          />
          <Stack.Screen
            name="MyProducts"
            component={MyProducts}
            options={{
              title: "My Products",
              headerStyle: {
                backgroundColor: "#2c3e50",
              },
              headerTintColor: "#ecf0f1",
            }}
          />
          <Stack.Screen
            name="EditProduct"
            component={EditProduct}
            options={{
              title: "Edit Product",
              headerStyle: {
                backgroundColor: "#2c3e50",
              },
              headerTintColor: "#ecf0f1",
            }}
          />
          <Stack.Screen
            name="DeleteProduct"
            component={DeleteProduct}
            options={{
              title: "Delete Product",
              headerStyle: {
                backgroundColor: "#2c3e50",
              },
              headerTintColor: "#ecf0f1",
            }}
          />
          <Stack.Screen
            name="OrderDetails"
            component={OrderDetails}
            options={{
              title: "Order Details",
              headerStyle: {
                backgroundColor: "#2c3e50",
              },
              headerTintColor: "#ecf0f1",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  )
}

export default App
const styles = StyleSheet.create({
  loginText: {
    marginRight: 25,
    color: "#ecf0f1",
    fontSize: 19,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
    textTransform: "uppercase",
    opacity: 0.9,
  },
});
