"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState , useEffect} from "react"
import {Image, Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import {  collection, query, where, getDocs } from "firebase/firestore"; 

import { db } from "../../config/fb"; 

const { width } = Dimensions.get("window")


const COLORS = {
    primary: "#00BCD4", 
    secondary: "#80DEEA", 
    accent: "#0097A7", 
    white: "#FFFFFF",
    lightGray: "#F5F5F5",
    gray: "#9E9E9E",
    text: "#263238",
    textLight: "#546E7A",
}

export default function DetailsBuyer({ navigation }) {
    
    
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
          try {
            
            const productsCollection = collection(db, "products");
    
            
            const q = query(productsCollection, where("category", "==", "Forestal"));
    
            
            const querySnapshot = await getDocs(q);
    
            
            console.log("Cantidad de productos encontrados: ", querySnapshot.size);
    
            
            const productsList = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
    
            
            console.log("Productos obtenidos: ", productsList);
    
            
            setProducts(productsList);
          } catch (error) {
            console.error("Error obteniendo productos: ", error);
          }
        };
    
        fetchProducts();
      }, []); 
    

    
    const categories = ["Agricultural", "Minerals", "Forestry", "Chemicals"]

    const [selectedCategory, setSelectedCategory] = useState("Todos")

    
    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const halfStar = rating - fullStars >= 0.5

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Ionicons key={i} name="star" size={14} color={COLORS.primary} />)
            } else if (i === fullStars && halfStar) {
                stars.push(<Ionicons key={i} name="star-half" size={14} color={COLORS.primary} />)
            } else {
                stars.push(<Ionicons key={i} name="star-outline" size={14} color={COLORS.primary} />)
            }
        }

        return (
            <View style={styles.ratingContainer}>
                {stars}
                <Text style={styles.ratingText}>{rating}</Text>
            </View>
        )
    }

    
    const navigateToProductDetails = (product) => {
        
        navigation.navigate("ProductDetails", { product })
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

            
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Marketplace</Text>
                    <Text style={styles.headerSubtitle}>Encuentra los mejores productos empresariales</Text>
                </View>
                <TouchableOpacity style={styles.searchButton}>
                    <Ionicons name="search-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            
            <View style={styles.categoriesContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesScrollView}
                >
                    {categories.map((category, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text
                                style={[styles.categoryButtonText, selectedCategory === category && styles.categoryButtonTextActive]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.productsContainer}>
                
                <View style={styles.featuredContainer}>
                    <Text style={styles.sectionTitle}>Productos Destacados</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredScrollView}
                    >
                        {products.slice(0, 3).map((product) => (
                            <TouchableOpacity
                                key={product.id}
                                style={styles.featuredProductCard}
                                onPress={() => navigateToProductDetails(product)}
                            >
                                
                                {product.imageUrl ? (
                                    <Image
                                      source={{ uri: product.imageUrl }}
                                      style={styles.productImage}
                                    />
                                  ) : (
                                    <View style={styles.productImagePlaceholder}>
                                      <Text style={styles.imagePlaceholderText}>Image</Text>
                                    </View>
                                  )}
                                <View style={styles.featuredProductInfo}>
                                    <Text style={styles.productCategory}>{product.category}</Text>
                                    <Text style={styles.featuredProductName} numberOfLines={1}>
                                        {product.name}
                                    </Text>
                                    <Text style={styles.featuredProductPrice}>${product.price}</Text>
                                    {renderStars(product.rating)}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                
                 <View style={styles.allProductsContainer}>
                          <Text style={styles.sectionTitle}>Productos "Forestry"</Text>
                          <View style={styles.productsGrid}>
                            {products.length === 0 ? (
                              <Text>No hay productos disponibles en esta categoría.</Text>
                            ) : (
                              products.map((product) => (
                                <TouchableOpacity key={product.id} style={styles.productCard}>
                                  
                                  {product.imageUrl ? (
                                    <Image
                                      source={{ uri: product.imageUrl }}
                                      style={styles.productImage}
                                    />
                                  ) : (
                                    <View style={styles.productImagePlaceholder}>
                                      <Text style={styles.imagePlaceholderText}>Image</Text>
                                    </View>
                                  )}
                                  <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={1}>
                                      {product.name}
                                    </Text>
                                    <Text style={styles.productPrice}>${product.price}</Text>
                                    {renderStars(product.rating || 0)} 
                                  </View>
                                </TouchableOpacity>
                              ))
                            )}
                          </View>
                        </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 2,
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    categoriesContainer: {
        paddingVertical: 10,
        backgroundColor: COLORS.white,
    },
    categoriesScrollView: {
        paddingHorizontal: 15,
    },
    categoryButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: COLORS.lightGray,
    },
    categoryButtonActive: {
        backgroundColor: COLORS.primary,
    },
    categoryButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.textLight,
    },
    categoryButtonTextActive: {
        color: COLORS.white,
    },
    productsContainer: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    featuredContainer: {
        marginTop: 15,
    },
    featuredScrollView: {
        paddingLeft: 20,
        paddingRight: 5,
    },
    featuredProductCard: {
        width: width * 0.7,
        marginRight: 15,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: "hidden",
    },
    productImage: {
        height: 150,
        width: "100%",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      },
    featuredImagePlaceholder: {
        height: 180,
        backgroundColor: COLORS.secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    productImagePlaceholder: {
        height: 150,
        backgroundColor: COLORS.secondary,
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    imagePlaceholderText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "500",
    },
    featuredProductInfo: {
        padding: 15,
    },
    productCategory: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: "600",
        marginBottom: 5,
    },
    featuredProductName: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 5,
    },
    featuredProductPrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.accent,
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 12,
        color: COLORS.textLight,
    },
    allProductsContainer: {
        marginTop: 25,
    },
    productsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    productCard: {
        width: (width - 50) / 2,
        marginBottom: 15,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        overflow: "hidden",
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.text,
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.accent,
        marginBottom: 5,
    },
})

