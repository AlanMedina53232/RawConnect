import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { createDrawerNavigator } from "@react-navigation/drawer"
import { LinearGradient } from "expo-linear-gradient"
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { Button, Text } from "react-native-paper"

// Import ProfileScreen (assuming it's in the same directory)
import ProfileScreen from "./Components/ProfileScreen"

const { width } = Dimensions.get("window")
const Drawer = createDrawerNavigator()

const GradientBackground = ({ colors, style, children }) => (
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
)

const CategoryCard = ({ title, icon, imagePrompt }) => (
  <TouchableOpacity style={styles.categoryCard}>
    <Image
      source={{ uri: `https://api.a0.dev/assets/image?text=${encodeURIComponent(imagePrompt)}&aspect=16:9` }}
      style={styles.categoryBackground}
    />
    <LinearGradient colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]} style={styles.categoryGradient}>
      <View style={styles.categoryContent}>
        {icon}
        <Text style={styles.categoryTitle}>{title}</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
)

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <GradientBackground colors={["#2c3e50", "#34495e"]} style={styles.header}>
        <Text style={styles.headerText}>Marketplace</Text>
        <Text style={styles.subHeaderText}>¡Descubre productos sin intermediarios!</Text>
      </GradientBackground>

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <View style={styles.categoriesGrid}>
          <CategoryCard
            title="Productos Agrícolas"
            icon={<MaterialCommunityIcons name="tractor" size={40} color="white" />}
            imagePrompt="modern agricultural machinery in a vast golden wheat field at sunset, dramatic lighting"
          />
          <CategoryCard
            title="Minerales y Metales"
            icon={<MaterialCommunityIcons name="mine" size={40} color="white" />}
            imagePrompt="industrial mining operation with massive machinery and raw minerals, dramatic industrial scene"
          />
          <CategoryCard
            title="Productos Forestales"
            icon={<FontAwesome5 name="tree" size={40} color="white" />}
            imagePrompt="sustainable forestry operation with lumber mill and forest management, morning mist"
          />
          <CategoryCard
            title="Químicos y Petroquímicos"
            icon={<MaterialIcons name="science" size={40} color="white" />}
            imagePrompt="modern chemical plant with sophisticated equipment and blue lighting, industrial scene"
          />
        </View>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.featuredTitle}>Productos Destacados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {[1, 2, 3, 4, 5].map((item) => (
            <GradientBackground key={item} colors={["#34495e", "#2c3e50"]} style={styles.featuredItem}>
              <Text style={styles.featuredItemText}>Producto {item}</Text>
            </GradientBackground>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  )
}

const DrawerContent = (props) => (
  <GradientBackground colors={["#2c3e50", "#34495e"]} style={styles.drawerContent}>
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
      <Button icon="cog" mode="contained" onPress={() => alert("Configuración")} style={styles.drawerButton}>
        Configuración
      </Button>
    </View>
  </GradientBackground>
)

const MainBuyer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2c3e50",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Drawer.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
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
    textAlign: "center",
  },
  subHeaderText: {
    fontSize: 18,
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
  },
  categoriesContainer: {
    padding: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#263238",
    textAlign: "center",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: (width - 48) / 2,
    height: 160,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  categoryGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryContent: {
    alignItems: "center",
    padding: 16,
  },
  categoryTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
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
    textAlign: "center",
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
  profileButton: {
    margin: 20,
    backgroundColor: "#2c3e50",
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
})

export default MainBuyer

