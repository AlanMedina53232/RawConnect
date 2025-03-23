"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"

const { width } = Dimensions.get("window")

const COLORS = {
    primary: "#0D47A1", // Changed to match the producer app theme
    secondary: "#1976D2",
    accent: "#2196F3",
    white: "#FFFFFF",
    lightGray: "#F5F5F5",
    gray: "#9E9E9E",
    text: "#263238",
    textLight: "#546E7A",
    background: "#ECEFF1",
}

export default function ProductDetails({ route, navigation }) {
    const { product } = route.params
    const [quantity, setQuantity] = useState(1)

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
        setQuantity(quantity + 1)
    }

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1)
        }
    }

    const addToCart = () => {
        alert(`Added to cart: ${quantity} units of ${product.name}`)
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Product Details</Text>
                <View style={{ width: 40 }} /> {/* Empty view for spacing */}
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

                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.dateText}>Listed on: {formatDate(product.createdAt)}</Text>
                    </View>

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
                                Minimum Order: {product.minimumOrder || 1} {product.minimumOrder > 1 ? "units" : "unit"}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.quantitySelector}>
                    <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity} disabled={quantity <= 1}>
                        <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.gray : COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
                        <Ionicons name="add" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
                    <Ionicons name="cart-outline" size={20} color={COLORS.white} />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        elevation: 2,
    },
    backButton: {
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
        marginBottom: 10,
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
        marginBottom: 8,
    },
    orderInfoText: {
        fontSize: 15,
        color: COLORS.text,
        marginLeft: 10,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
        elevation: 10,
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
    addToCartText: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.white,
        marginLeft: 8,
    },
})

