"use client"

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { Card } from "react-native-paper"
import { addDoc, auth, collection, db, doc, getDocs, query, updateDoc, where } from "../../config/fb"
const { width } = Dimensions.get("window")

const COLORS = {
    primary: "#2c3e50",
    secondary: "#1976D2",
    accent: "#2196F3",
    white: "#FFFFFF",
    lightGray: "#F5F5F5",
    gray: "#9E9E9E",
    text: "#263238",
    textLight: "#546E7A",
    background: "#ECEFF1",
    success: "#4CAF50",
    warning: "#FFC107",
    danger: "#F44336",
}

// Map unit values to readable labels
const unitLabels = {
    ud: "Units",
    box: "Boxes",
    pack: "Packs",
    kg: "Kilograms",
    g: "Grams",
    t: "Tons",
    L: "Liters",
    ml: "Milliliters",
    "m³": "Cubic meters",
    m: "Meters",
    cm: "Centimeters",
    mm: "Millimeters",
    in: "Inches",
    ft: "Feet",
    pallets: "Pallets",
    containers: "Containers",
    rolls: "Rolls",
    barrels: "Barrels",
}

export default function ProductDetails({ route, navigation }) {
    const { product } = route.params
    const [quantity, setQuantity] = useState(1)
    const [stockStatus, setStockStatus] = useState("high") // high, medium, low

    useEffect(() => {
        // Determine stock status based on available quantity
        if (product.quantity) {
            if (product.quantity < 10) {
                setStockStatus("low")
            } else if (product.quantity < 50) {
                setStockStatus("medium")
            } else {
                setStockStatus("high")
            }
        }
    }, [product])

    // Format the createdAt timestamp
    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A"

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        } catch (error) {
            console.error("Error formatting date:", error)
            return "N/A"
        }
    }

    // Parse specifications if it's a string
    const getSpecifications = () => {
        if (!product.specifications) return {}

        if (typeof product.specifications === "string") {
            try {
                return JSON.parse(product.specifications)
            } catch (e) {
                // If it's not valid JSON, return it as a single specification
                return { Details: product.specifications }
            }
        }

        return product.specifications
    }

    const incrementQuantity = () => {
        if (product.quantity && quantity >= product.quantity) {
            Alert.alert("Maximum Stock", `Only ${product.quantity} ${getUnitLabel()} available.`)
            return
        }
        setQuantity(quantity + 1)
    }

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1)
        }
    }

    // Add this function to the ProductDetails component to handle adding to cart

    const addToCart = async () => {
        if (product.quantity && quantity > product.quantity) {
            Alert.alert("Insufficient Stock", `Only ${product.quantity} ${getUnitLabel()} available.`)
            return
        }

        try {
            if (!auth.currentUser) {
                Alert.alert("Please Login", "You need to be logged in to add items to your cart", [
                    {
                        text: "Login",
                        onPress: () => navigation.navigate("Login"),
                    },
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                ])
                return
            }

            // Check if the item is already in the cart
            const cartQuery = query(
                collection(db, "cart"),
                where("userEmail", "==", auth.currentUser.email),
                where("productId", "==", product.id),
            )

            const querySnapshot = await getDocs(cartQuery)

            if (!querySnapshot.empty) {
                // Item already in cart, update quantity
                const cartItem = querySnapshot.docs[0]
                const currentQuantity = cartItem.data().quantity
                const newQuantity = currentQuantity + quantity

                if (newQuantity > product.quantity) {
                    Alert.alert(
                        "Insufficient Stock",
                        `You already have ${currentQuantity} in your cart. Only ${product.quantity} units available in total.`,
                    )
                    return
                }

                await updateDoc(doc(db, "cart", cartItem.id), {
                    quantity: newQuantity,
                })

                Alert.alert("Success", `Updated quantity in cart to ${newQuantity} ${getUnitLabel()}`)
            } else {
                // Add new item to cart
                await addDoc(collection(db, "cart"), {
                    userEmail: auth.currentUser.email,
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    quantity: quantity,
                    unitMeasure: product.unitMeasure || "units",
                    imageUrl: product.imageUrl || null,
                    vendorEmail: product.vendor || "Unknown vendor",
                    productStock: product.quantity,
                    addedAt: new Date(),
                })

                Alert.alert("Success", `Added ${quantity} ${getUnitLabel()} to your cart`)
            }
        } catch (error) {
            console.error("Error adding to cart:", error)
            Alert.alert("Error", "Failed to add item to cart. Please try again.")
        }
    }

    const getUnitLabel = () => {
        if (!product.unitMeasure) return "units"
        return unitLabels[product.unitMeasure] || product.unitMeasure
    }

    const getStockColor = () => {
        switch (stockStatus) {
            case "high":
                return "#6bb2db" // Changed from COLORS.success to blue
            case "medium":
                return COLORS.warning
            case "low":
                return COLORS.danger
            default:
                return COLORS.gray
        }
    }

    const getStockText = () => {
        switch (stockStatus) {
            case "high":
                return "In Stock"
            case "medium":
                return "Limited Stock"
            case "low":
                return "Low Stock"
            default:
                return "Stock Unknown"
        }
    }

    // Verificar si la cantidad es mayor o igual a la cantidad del producto
    const isMaxQuantity = () => {
        if (!product.quantity) return false
        return quantity >= product.quantity
    }

    // Verificar si el producto está fuera de stock
    const isOutOfStock = () => {
        return !product.quantity || product.quantity === 0
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        const previousScreen = route.params?.previousScreen || "Agricultural"
                        navigation.navigate(previousScreen)
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Product Details</Text>
                <TouchableOpacity style={styles.shareButton}>
                    <Ionicons name="share-social-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    {product.imageUrl ? (
                        <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.productImagePlaceholder}>
                            <Ionicons name="image-outline" size={80} color={COLORS.white} />
                            <Text style={styles.imagePlaceholderText}>No Image Available</Text>
                        </View>
                    )}

                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{product.category}</Text>
                    </View>
                </View>

                <View style={styles.productInfoContainer}>
                    <View style={styles.nameAndPriceContainer}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productPrice}>${product.price}</Text>
                    </View>

                    {/* Stock Status Card */}
                    <Card style={[styles.stockCard, { borderLeftColor: "#2C3E50", backgroundColor: "#f9fbfc" }]}>
                        <Card.Content style={styles.stockCardContent}>
                            <View style={styles.stockInfo}>
                                <MaterialCommunityIcons
                                    name="storefront" // Cambia este icono por el que prefieras
                                    size={24}
                                    color="#2C3E50"
                                />
                                <View style={styles.stockTextContainer}>
                                    <Text style={[styles.stockQuantity, { color: "#2C3E50" }]}>
                                        {product.quantity ? `${product.quantity} ${getUnitLabel()} available` : "Stock not specified"}
                                    </Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>




                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.dateText}>Listed on: {formatDate(product.createdAt)}</Text>
                    </View>

                    {product.vendor && (
                        <View style={styles.vendorContainer}>
                            <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
                            <Text style={styles.vendorText}>Vendor: {product.vendor}</Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{product.description || "No description available"}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Specifications</Text>
                        {Object.entries(getSpecifications()).length > 0 ? (
                            Object.entries(getSpecifications()).map(([key, value], index) => (
                                <View key={index} style={styles.specificationItem}>
                                    <Text style={styles.specificationKey}>{key}:</Text>
                                    <Text style={styles.specificationValue}>{value}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>No specifications available</Text>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Order Information</Text>
                        <View style={styles.orderInfoItem}>
                            <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.orderInfoText}>
                                Minimum Order: {product.minimumOrder || 1} {getUnitLabel()}
                            </Text>
                        </View>
                        {product.unitMeasure && (
                            <View style={styles.orderInfoItem}>
                                <MaterialCommunityIcons name="scale" size={20} color={COLORS.primary} />
                                <Text style={styles.orderInfoText}>Unit of Measure: {getUnitLabel()}</Text>
                            </View>
                        )}
                        {product.deliveryOptions && (
                            <View style={styles.orderInfoItem}>
                                <Ionicons name="car-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.orderInfoText}>Delivery: {product.deliveryOptions}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <LinearGradient colors={["rgba(255,255,255,0.8)", "#FFFFFF"]} style={styles.footerGradient}>
                <View style={styles.footer}>
                    <View style={styles.quantitySelector}>
                        <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity} disabled={quantity <= 1}>
                            <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.gray : COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity} disabled={isMaxQuantity()}>
                            <Ionicons name="add" size={20} color={isMaxQuantity() ? COLORS.gray : COLORS.text} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.addToCartButton, isOutOfStock() && styles.disabledButton]}
                        onPress={addToCart}
                        disabled={isOutOfStock()}
                    >
                        <Ionicons name="cart-outline" size={20} color={COLORS.white} />
                        <Text style={styles.addToCartText}>{isOutOfStock() ? "Out of Stock" : "Add to Cart"}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        paddingTop: Platform.OS === "ios" ? 60 : 25, // Aumentado para iOS
        backgroundColor: COLORS.white,
        elevation: 2,
        height: Platform.OS === "ios" ? 100 : 70, // Altura explícita para la barra
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.lightGray,
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.lightGray,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.text,
        textAlign: "center",
        flex: 1, // Allow the title to take up available space
    },
    imageContainer: {
        width: "100%",
        height: 300,
        position: "relative",
        backgroundColor: COLORS.white,
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    productImagePlaceholder: {
        height: "100%",
        backgroundColor: COLORS.secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    imagePlaceholderText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "500",
        marginTop: 10,
    },
    categoryBadge: {
        position: "absolute",
        top: 15,
        right: 15,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    categoryText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "bold",
    },
    productInfoContainer: {
        padding: 20,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -20,
    },
    nameAndPriceContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 15,
    },
    productName: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLORS.text,
        flex: 1,
        marginRight: 10,
    },
    productPrice: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    stockCard: {
        marginBottom: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        elevation: 1,
    },
    stockCardContent: {
        padding: 10,
    },
    stockInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    stockTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    stockQuantity: {
        fontSize: 16,
        fontWeight: "bold",
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    dateText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginLeft: 5,
    },
    vendorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    vendorText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginLeft: 5,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginVertical: 15,
    },
    sectionContainer: {
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
        color: COLORS.textLight,
    },
    specificationItem: {
        flexDirection: "row",
        marginBottom: 8,
    },
    specificationKey: {
        fontSize: 15,
        fontWeight: "500",
        color: COLORS.text,
        width: "40%",
    },
    specificationValue: {
        fontSize: 15,
        color: COLORS.textLight,
        width: "60%",
    },
    noDataText: {
        fontSize: 15,
        color: COLORS.gray,
        fontStyle: "italic",
    },
    orderInfoItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    orderInfoText: {
        fontSize: 15,
        color: COLORS.text,
        marginLeft: 10,
    },
    footerGradient: {
        paddingTop: 10,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingBottom: Platform.OS === "ios" ? 30 : 15, // Add extra padding at the bottom for iOS
        backgroundColor: COLORS.white,
    },
    quantitySelector: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
        marginRight: 15,
    },
    quantityButton: {
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "500",
        color: COLORS.text,
        paddingHorizontal: 10,
    },
    addToCartButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        elevation: 2,
    },
    disabledButton: {
        backgroundColor: COLORS.gray,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.white,
        marginLeft: 8,
    },
})

