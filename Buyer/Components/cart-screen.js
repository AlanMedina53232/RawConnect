"use client"

import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native"
import { Button, Card, Divider, HelperText, IconButton, Modal, Portal, Text, TextInput } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import {
    addDoc,
    auth,
    collection,
    db,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
} from "../../config/fb"

const CartScreen = () => {
    const navigation = useNavigation()
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalPrice, setTotalPrice] = useState(0)
    const [checkoutModalVisible, setCheckoutModalVisible] = useState(false)
    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: "",
        cardHolder: "",
        expiryDate: "",
        cvv: "",
    })
    const [savedCard, setSavedCard] = useState(null)
    const [useStoredCard, setUseStoredCard] = useState(false)
    const [errors, setErrors] = useState({})
    const [processingPayment, setProcessingPayment] = useState(false)

    useEffect(() => {
        fetchCartItems()
        fetchSavedCardInfo()

        // Añadir un listener para cuando la pantalla recibe el foco
        const unsubscribeFocus = navigation.addListener("focus", () => {
            fetchCartItems()
            fetchSavedCardInfo()
        })

        // Limpiar el listener cuando el componente se desmonta
        return unsubscribeFocus
    }, [navigation])

    useEffect(() => {
        // Calculate total price whenever cart items change
        const total = cartItems.reduce((sum, item) => {
            return sum + item.price * item.quantity
        }, 0)
        setTotalPrice(total)
    }, [cartItems])

    const fetchSavedCardInfo = async () => {
        try {
            if (!auth.currentUser) return

            const userEmail = auth.currentUser.email
            const cardDocRef = doc(db, "userPaymentMethods", userEmail)
            const cardDoc = await getDoc(cardDocRef)

            if (cardDoc.exists()) {
                const cardData = cardDoc.data()
                setSavedCard(cardData)

                // Pre-fill the form with saved data except CVV
                if (cardData) {
                    setPaymentInfo({
                        cardNumber: cardData.cardNumber || "",
                        cardHolder: cardData.cardHolder || "",
                        expiryDate: cardData.expiryDate || "",
                        cvv: "", // CVV nunca se guarda por seguridad
                    })
                    setUseStoredCard(true)
                }
            } else {
                setSavedCard(null)
                setUseStoredCard(false)

                // Reset payment info if no saved card
                setPaymentInfo({
                    cardNumber: "",
                    cardHolder: "",
                    expiryDate: "",
                    cvv: "",
                })
            }
        } catch (error) {
            console.error("Error fetching saved card:", error)
            setSavedCard(null)
            setUseStoredCard(false)
        }
    }

    const fetchCartItems = async () => {
        try {
            setLoading(true)
            if (!auth.currentUser) {
                Alert.alert("Error", "You must be logged in to view your cart")
                navigation.navigate("Login")
                return
            }

            const userEmail = auth.currentUser.email
            const cartQuery = query(collection(db, "cart"), where("userEmail", "==", userEmail))

            const querySnapshot = await getDocs(cartQuery)
            const items = []

            querySnapshot.forEach((doc) => {
                items.push({
                    id: doc.id,
                    ...doc.data(),
                })
            })

            console.log("Cart items fetched:", items.length)
            setCartItems(items)
        } catch (error) {
            console.error("Error fetching cart items:", error)
            Alert.alert("Error", "Failed to load cart items")
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveItem = async (itemId) => {
        try {
            await deleteDoc(doc(db, "cart", itemId))
            // Update local state
            setCartItems(cartItems.filter((item) => item.id !== itemId))
            Alert.alert("Success", "Item removed from cart")
        } catch (error) {
            console.error("Error removing item from cart:", error)
            Alert.alert("Error", "Failed to remove item from cart")
        }
    }

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return

        try {
            const itemIndex = cartItems.findIndex((item) => item.id === itemId)
            if (itemIndex === -1) return

            const item = cartItems[itemIndex]

            // Check if new quantity exceeds available stock
            if (newQuantity > item.productStock) {
                Alert.alert("Error", `Only ${item.productStock} units available in stock`)
                return
            }

            // Update in Firestore
            await updateDoc(doc(db, "cart", itemId), {
                quantity: newQuantity,
            })

            // Update local state
            const updatedItems = [...cartItems]
            updatedItems[itemIndex] = {
                ...item,
                quantity: newQuantity,
            }
            setCartItems(updatedItems)
        } catch (error) {
            console.error("Error updating quantity:", error)
            Alert.alert("Error", "Failed to update quantity")
        }
    }

    const validatePaymentInfo = () => {
        const newErrors = {}

        if (useStoredCard) {
            // Si usa tarjeta guardada, solo validar CVV
            if (!paymentInfo.cvv.trim() || paymentInfo.cvv.length < 3) {
                newErrors.cvv = "Please enter a valid CVV"
            }
        } else {
            // Validación completa para nueva tarjeta
            if (!paymentInfo.cardNumber.trim() || paymentInfo.cardNumber.length < 16) {
                newErrors.cardNumber = "Please enter a valid 16-digit card number"
            }

            if (!paymentInfo.cardHolder.trim()) {
                newErrors.cardHolder = "Please enter the cardholder name"
            }

            if (!paymentInfo.expiryDate.trim() || !paymentInfo.expiryDate.includes("/")) {
                newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)"
            } else {
                const [month, year] = paymentInfo.expiryDate.split("/")
                const currentYear = new Date().getFullYear() % 100
                const currentMonth = new Date().getMonth() + 1

                if (
                    Number.parseInt(year) < currentYear ||
                    (Number.parseInt(year) === currentYear && Number.parseInt(month) < currentMonth) ||
                    Number.parseInt(month) > 12 ||
                    Number.parseInt(month) < 1
                ) {
                    newErrors.expiryDate = "Card has expired or date is invalid"
                }
            }

            if (!paymentInfo.cvv.trim() || paymentInfo.cvv.length < 3) {
                newErrors.cvv = "Please enter a valid CVV"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const saveCardInformation = async () => {
        try {
            if (!auth.currentUser) return

            const userEmail = auth.currentUser.email
            const cardDocRef = doc(db, "userPaymentMethods", userEmail)

            // Guardar información de la tarjeta excepto el CVV
            await setDoc(cardDocRef, {
                cardNumber: paymentInfo.cardNumber,
                cardHolder: paymentInfo.cardHolder,
                expiryDate: paymentInfo.expiryDate,
                lastFour: paymentInfo.cardNumber.slice(-4),
                updatedAt: new Date(),
            })

            console.log("Card information saved successfully")
        } catch (error) {
            console.error("Error saving card information:", error)
        }
    }

    const handleCheckout = async () => {
        if (!validatePaymentInfo()) return

        try {
            setProcessingPayment(true)

            if (cartItems.length === 0) {
                Alert.alert("Error", "Your cart is empty")
                return
            }

            // Si no está usando una tarjeta guardada, guardar la información de la tarjeta
            if (!useStoredCard) {
                await saveCardInformation()
            }

            // Group items by vendor
            const itemsByVendor = {}
            cartItems.forEach((item) => {
                if (!itemsByVendor[item.vendorEmail]) {
                    itemsByVendor[item.vendorEmail] = []
                }
                itemsByVendor[item.vendorEmail].push(item)
            })

            // Create an order for each vendor
            for (const vendorEmail in itemsByVendor) {
                const vendorItems = itemsByVendor[vendorEmail]
                const vendorTotal = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

                // Create order in Firestore
                await addDoc(collection(db, "orders"), {
                    buyerEmail: auth.currentUser.email,
                    vendorEmail: vendorEmail,
                    items: vendorItems.map((item) => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        price: item.price,
                        unitMeasure: item.unitMeasure,
                    })),
                    totalAmount: vendorTotal,
                    status: "pending",
                    paymentMethod: "Credit Card",
                    createdAt: new Date(),
                    // Store last 4 digits of card for reference
                    paymentDetails: {
                        cardLast4: useStoredCard ? savedCard.lastFour : paymentInfo.cardNumber.slice(-4),
                        cardHolder: useStoredCard ? savedCard.cardHolder : paymentInfo.cardHolder,
                    },
                })

                // Update product stock in Firestore
                for (const item of vendorItems) {
                    const productRef = doc(db, "products", item.productId)
                    await updateDoc(productRef, {
                        quantity: item.productStock - item.quantity,
                    })
                }
            }

            // Clear cart after successful order
            for (const item of cartItems) {
                await deleteDoc(doc(db, "cart", item.id))
            }

            // Actualizar el estado local inmediatamente
            setCartItems([])
            setCheckoutModalVisible(false)

            Alert.alert("Order Placed Successfully", "Your order has been placed and is pending approval from the vendor.", [
                {
                    text: "View My Orders",
                    onPress: () => navigation.navigate("MyOrders"),
                },
                {
                    text: "Continue Shopping",
                    onPress: () => navigation.navigate("Home"),
                },
            ])
        } catch (error) {
            console.error("Error processing checkout:", error)
            Alert.alert("Error", "Failed to process your order. Please try again.")
        } finally {
            setProcessingPayment(false)
        }
    }

    const formatCardNumber = (text) => {
        // Remove all non-digit characters
        const cleaned = text.replace(/\D/g, "")
        // Limit to 16 digits
        const trimmed = cleaned.substring(0, 16)
        // Format with spaces every 4 digits
        const formatted = trimmed.replace(/(\d{4})(?=\d)/g, "$1 ")

        setPaymentInfo({ ...paymentInfo, cardNumber: formatted })
    }

    const formatExpiryDate = (text) => {
        // Remove all non-digit characters
        const cleaned = text.replace(/\D/g, "")
        // Limit to 4 digits
        const trimmed = cleaned.substring(0, 4)

        // Format as MM/YY
        if (trimmed.length > 2) {
            const formatted = `${trimmed.substring(0, 2)}/${trimmed.substring(2)}`
            setPaymentInfo({ ...paymentInfo, expiryDate: formatted })
        } else {
            setPaymentInfo({ ...paymentInfo, expiryDate: trimmed })
        }
    }

    const renderEmptyCart = () => (
        <View style={styles.emptyCartContainer}>
            <Icon name="cart-off" size={80} color="#6bb2db" />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <Button mode="contained" style={styles.shopButton} onPress={() => navigation.navigate("Home")}>
                Start Shopping
            </Button>
        </View>
    )

    const toggleUseStoredCard = () => {
        setUseStoredCard(!useStoredCard)
        setErrors({})
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6bb2db" />
                <Text style={styles.loadingText}>Loading your cart...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" iconColor="#FFFFFF" size={24} onPress={() => navigation.goBack()} />
                <Text style={styles.title}>Shopping Cart</Text>
                <View style={{ width: 40 }} />
            </View>

            {cartItems.length === 0 ? (
                renderEmptyCart()
            ) : (
                <>
                    <ScrollView style={styles.cartItemsContainer}>
                        {cartItems.map((item) => (
                            <Card key={item.id} style={styles.cartItemCard}>
                                <Card.Content style={styles.cartItemContent}>
                                    <View style={styles.productImageContainer}>
                                        {item.imageUrl ? (
                                            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                                        ) : (
                                            <View style={styles.productImagePlaceholder}>
                                                <Icon name="image-off" size={30} color="#FFFFFF" />
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.productDetails}>
                                        <Text style={styles.productName}>{item.productName}</Text>
                                        <Text style={styles.productVendor}>Seller: {item.vendorEmail}</Text>
                                        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>

                                        <View style={styles.quantityContainer}>
                                            <TouchableOpacity
                                                style={styles.quantityButton}
                                                onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Icon name="minus" size={16} color="#6bb2db" />
                                            </TouchableOpacity>
                                            <Text style={styles.quantityText}>{item.quantity}</Text>
                                            <TouchableOpacity
                                                style={styles.quantityButton}
                                                onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Icon name="plus" size={16} color="#6bb2db" />
                                            </TouchableOpacity>
                                            <Text style={styles.unitText}>{item.unitMeasure}</Text>
                                        </View>
                                    </View>
                                    <IconButton
                                        icon="delete"
                                        iconColor="#D32F2F"
                                        size={20}
                                        onPress={() => handleRemoveItem(item.id)}
                                        style={styles.removeButton}
                                    />
                                </Card.Content>
                            </Card>
                        ))}
                    </ScrollView>

                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Shipping</Text>
                                <Text style={styles.summaryValue}>$0.00</Text>
                            </View>
                            <Divider style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
                            </View>
                            <Button mode="contained" style={styles.checkoutButton} onPress={() => setCheckoutModalVisible(true)}>
                                Proceed to Checkout
                            </Button>
                        </Card.Content>
                    </Card>
                </>
            )}

            <Portal>
                <Modal
                    visible={checkoutModalVisible}
                    onDismiss={() => setCheckoutModalVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <ScrollView>
                        <Text style={styles.modalTitle}>Payment Information</Text>
                        <Text style={styles.modalSubtitle}>Enter your card details to complete your purchase</Text>

                        <View style={styles.cardIconsContainer}>
                            <Icon name="credit-card" size={24} color="#6bb2db" style={styles.cardIcon} />
                            <Icon name="credit-card-outline" size={24} color="#6bb2db" style={styles.cardIcon} />
                            <Icon name="credit-card-multiple" size={24} color="#6bb2db" style={styles.cardIcon} />
                        </View>

                        {savedCard && (
                            <Card style={styles.savedCardContainer}>
                                <Card.Content>
                                    <View style={styles.savedCardHeader}>
                                        <Text style={styles.savedCardTitle}>Saved Card</Text>
                                        <TouchableOpacity onPress={toggleUseStoredCard}>
                                            <Icon
                                                name={useStoredCard ? "checkbox-marked" : "checkbox-blank-outline"}
                                                size={24}
                                                color="#6bb2db"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {useStoredCard && (
                                        <View style={styles.savedCardDetails}>
                                            <Text style={styles.savedCardNumber}>•••• •••• •••• {savedCard.lastFour}</Text>
                                            <Text style={styles.savedCardName}>{savedCard.cardHolder}</Text>
                                            <Text style={styles.savedCardExpiry}>Expires: {savedCard.expiryDate}</Text>
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>
                        )}

                        {!useStoredCard && (
                            <>
                                <TextInput
                                    label="Card Number"
                                    value={paymentInfo.cardNumber}
                                    onChangeText={formatCardNumber}
                                    style={styles.input}
                                    keyboardType="numeric"
                                    maxLength={19} // 16 digits + 3 spaces
                                    error={!!errors.cardNumber}
                                    left={<TextInput.Icon icon="credit-card" />}
                                />
                                {errors.cardNumber && <HelperText type="error">{errors.cardNumber}</HelperText>}

                                <TextInput
                                    label="Cardholder Name"
                                    value={paymentInfo.cardHolder}
                                    onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cardHolder: text })}
                                    style={styles.input}
                                    error={!!errors.cardHolder}
                                    left={<TextInput.Icon icon="account" />}
                                />
                                {errors.cardHolder && <HelperText type="error">{errors.cardHolder}</HelperText>}

                                <View style={styles.row}>
                                    <View style={styles.halfInput}>
                                        <TextInput
                                            label="Expiry Date (MM/YY)"
                                            value={paymentInfo.expiryDate}
                                            onChangeText={formatExpiryDate}
                                            style={styles.input}
                                            keyboardType="numeric"
                                            maxLength={5} // MM/YY
                                            error={!!errors.expiryDate}
                                            left={<TextInput.Icon icon="calendar" />}
                                        />
                                        {errors.expiryDate && <HelperText type="error">{errors.expiryDate}</HelperText>}
                                    </View>

                                    <View style={styles.halfInput}>
                                        <TextInput
                                            label="CVV"
                                            value={paymentInfo.cvv}
                                            onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cvv: text.replace(/\D/g, "") })}
                                            style={styles.input}
                                            keyboardType="numeric"
                                            maxLength={4}
                                            secureTextEntry
                                            error={!!errors.cvv}
                                            left={<TextInput.Icon icon="lock" />}
                                        />
                                        {errors.cvv && <HelperText type="error">{errors.cvv}</HelperText>}
                                    </View>
                                </View>
                            </>
                        )}

                        {useStoredCard && (
                            <View style={styles.cvvOnlyContainer}>
                                <TextInput
                                    label="CVV"
                                    value={paymentInfo.cvv}
                                    onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cvv: text.replace(/\D/g, "") })}
                                    style={styles.input}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    secureTextEntry
                                    error={!!errors.cvv}
                                    left={<TextInput.Icon icon="lock" />}
                                />
                                {errors.cvv && <HelperText type="error">{errors.cvv}</HelperText>}
                            </View>
                        )}

                        <View style={styles.secureNotice}>
                            <Icon name="shield-check" size={20} color="#4CAF50" />
                            <Text style={styles.secureText}>Your payment information is secure and encrypted</Text>
                        </View>

                        <View style={styles.modalButtons}>
                            <Button mode="outlined" onPress={() => setCheckoutModalVisible(false)} style={styles.cancelButton}>
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleCheckout}
                                style={styles.payButton}
                                loading={processingPayment}
                                disabled={processingPayment}
                            >
                                Pay ${totalPrice.toFixed(2)}
                            </Button>
                        </View>
                    </ScrollView>
                </Modal>
            </Portal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 15,
        paddingTop: Platform.OS === "ios" ? 50 : 15, // Añadir más padding para iOS
        backgroundColor: "#2c3e50",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        flex: 1, // Permitir que el título ocupe el espacio disponible
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyCartText: {
        fontSize: 18,
        color: "#666",
        marginTop: 10,
        marginBottom: 20,
    },
    shopButton: {
        backgroundColor: "#6bb2db",
    },
    cartItemsContainer: {
        flex: 1,
        padding: 10,
    },
    cartItemCard: {
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2,
    },
    cartItemContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    productImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#e0e0e0",
    },
    productImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    productImagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#6bb2db",
        justifyContent: "center",
        alignItems: "center",
    },
    productDetails: {
        flex: 1,
        marginLeft: 15,
    },
    productName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    productVendor: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#6bb2db",
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    quantityButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    quantityText: {
        marginHorizontal: 10,
        fontSize: 14,
        fontWeight: "bold",
    },
    unitText: {
        marginLeft: 5,
        fontSize: 12,
        color: "#666",
    },
    removeButton: {
        margin: 0,
    },
    summaryCard: {
        margin: 10,
        borderRadius: 10,
        elevation: 3,
        marginBottom: Platform.OS === "ios" ? 30 : 10, // Añadir más margen en la parte inferior para iOS
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: "#666",
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: "500",
    },
    divider: {
        marginVertical: 10,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "bold",
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#6bb2db",
    },
    checkoutButton: {
        marginTop: 15,
        backgroundColor: "#2c3e50",
    },
    modalContainer: {
        backgroundColor: "white",
        padding: 20,
        margin: 20,
        borderRadius: 10,
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
        textAlign: "center",
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
    },
    cardIconsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    cardIcon: {
        marginHorizontal: 10,
    },
    input: {
        marginBottom: 10,
        backgroundColor: "#fff",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    halfInput: {
        width: "48%",
    },
    secureNotice: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15,
        padding: 10,
        backgroundColor: "#f0f8ff",
        borderRadius: 5,
    },
    secureText: {
        marginLeft: 10,
        fontSize: 12,
        color: "#666",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        marginRight: 10,
        borderColor: "#6bb2db",
    },
    payButton: {
        flex: 2,
        backgroundColor: "#6bb2db",
    },
    savedCardContainer: {
        marginBottom: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#6bb2db",
    },
    savedCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    savedCardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2c3e50",
    },
    savedCardDetails: {
        marginTop: 10,
    },
    savedCardNumber: {
        fontSize: 16,
        marginBottom: 5,
    },
    savedCardName: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    savedCardExpiry: {
        fontSize: 14,
        color: "#666",
    },
    cvvOnlyContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
})

export default CartScreen

