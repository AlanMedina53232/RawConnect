
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Provider as PaperProvider, Text } from "react-native-paper";

// Importa la pantalla de perfil
import ProfileScreen from "./componentes/ProfileScreen"; 

const Drawer = createDrawerNavigator();
const { width } = Dimensions.get("window");

const GradientBackground = ({ colors, style, children }) => {
  return (
    <View style={[styles.gradientContainer, style]}>
      {colors.map((color, index) => (
        <View
          key={index}
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: color,
              opacity: 1 - index / colors.length,
            },
          ]}
        />
      ))}
      {children}
    </View>
  );
};

const CategoryItem = ({ title, colors, onPress }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
    <GradientBackground colors={colors} style={styles.categoryGradient}>
      <Text style={styles.categoryText}>{title}</Text>
    </GradientBackground>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <GradientBackground
          colors={["#2c3e50", "#34495e"]}
          style={styles.header}
        >
          <Text style={styles.headerText}>Marketplace</Text>
          <Text style={styles.subHeaderText}>
            ¡Descubre productos sin intermediarios!
          </Text>
        </GradientBackground>
        <View style={styles.categoriesContainer}>
          <CategoryItem
            title="Agrícolas"
            colors={["#27ae60", "#2ecc71"]}
            onPress={() => alert("Categoría Agrícolas")}
          />
          <CategoryItem
            title="Minerales y Metales"
            colors={["#2980b9", "#3498db"]}
            onPress={() => alert("Categoría Minerales y Metales")}
          />
          <CategoryItem
            title="Productos Forestales"
            colors={["#16a085", "#1abc9c"]}
            onPress={() => alert("Categoría Productos Forestales")}
          />
          <CategoryItem
            title="Químicos y Petroquímicos"
            colors={["#8e44ad", "#9b59b6"]}
            onPress={() => alert("Categoría Químicos y Petroquímicos")}
          />
        </View>
        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>Productos Destacados</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredScroll}
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <GradientBackground
                key={item}
                colors={["#34495e", "#2c3e50"]}
                style={styles.featuredItem}
              >
                <Text style={styles.featuredItemText}>Producto {item}</Text>
              </GradientBackground>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DrawerContent = (props) => (
  <GradientBackground
    colors={["#2c3e50", "#34495e"]}
    style={styles.drawerContent}
  >
    <View style={styles.drawerHeader}>
      <Text style={styles.drawerTitle}>RawConnect</Text>
    </View>
    <View style={styles.drawerItems}>
      <Button
        icon="home"
        mode="contained"
        onPress={() => props.navigation.navigate("Home")}
        style={styles.drawerButton}
      >
        Inicio
      </Button>
      <Button
        icon="account"
        mode="contained"
        onPress={() => props.navigation.navigate("Profile")}
        style={styles.drawerButton}
      >
        Perfil
      </Button>
      <Button
        icon="cog"
        mode="contained"
        onPress={() => alert("Configuración")}
        style={styles.drawerButton}
      >
        Configuración
      </Button>
    </View>
  </GradientBackground>
);

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <DrawerContent {...props} />}
        >
          <Drawer.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerStyle: {
                backgroundColor: "#2c3e50",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Drawer.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerStyle: {
                backgroundColor: "#2c3e50",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              title: "Perfil",
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
  },
  scrollView: {
    flex: 1,
  },
  gradientContainer: {
    overflow: "hidden",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  subHeaderText: {
    fontSize: 18,
    color: "#fff",
    marginTop: 10,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 20,
  },
  categoryItem: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  categoryGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  featuredSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
  },
  featuredScroll: {
    paddingBottom: 20,
  },
  featuredItem: {
    width: 150,
    height: 200,
    marginRight: 15,
    borderRadius: 10,
    justifyContent: "flex-end",
    padding: 10,
  },
  featuredItemText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  drawerContent: {
    flex: 1,
    paddingTop: 50,
  },
  drawerHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  drawerItems: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  drawerButton: {
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});
