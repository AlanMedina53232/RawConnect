"use client"
import { useNavigation } from "@react-navigation/native"
import { getAuth } from "firebase/auth"
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { Button, Card, IconButton, Menu, Text, useTheme } from "react-native-paper"

const MyOrdersScreen = () => {
    const theme = useTheme()
    const navigation = useNavigation()

    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [customerNames, setCustomerNames] = useState({})
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [menuVisible, setMenuVisible] = useState(false)
    const [debugInfo, setDebugInfo] = useState("")

    const statusOptions = [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Accepted", value: "accepted" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
        { label: "Finalized", value: "finalized" },
        { label: "Rejected", value: "rejected" },
    ]

    const auth = getAuth()
    const user = auth.currentUser

    useEffect(() => {
        if (user) {
            console.log("Usuario autenticado:", user.email)
            fetchOrders(user.email)
        } else {
            console.log("No hay usuario autenticado")
            setDebugInfo("No hay usuario autenticado")
        }
    }, [user])

    useEffect(() => {
        const filtered =
            statusFilter === "all"
                ? orders.filter((order) =>
                    ["pending", "accepted", "rejected", "shipped", "delivered", "finalized"].includes(order.status),
                )
                : orders.filter((order) => order.status === statusFilter)
        setFilteredOrders(filtered)
        console.log(`Órdenes filtradas: ${filtered.length} con filtro: ${statusFilter}`)
    }, [statusFilter, orders])

    const fetchCustomerName = async (email) => {
        const db = getFirestore()
        try {
            const userRef = doc(db, "users", email)
            const userSnap = await getDoc(userRef)

            if (userSnap.exists()) {
                return userSnap.data().fullName || userSnap.data().displayName || email
            }
            return email
        } catch (error) {
            console.error("Error fetching customer name:", error)
            return email
        }
    }

    const fetchOrders = async (vendorEmail) => {
        setLoading(true)
        const db = getFirestore()
        const ordersRef = collection(db, "orders")

        console.log(`Buscando órdenes para vendorEmail: ${vendorEmail}`)
        setDebugInfo((prev) => prev + `\nBuscando órdenes para: ${vendorEmail}`)

        try {
            const allOrdersQuery = query(collection(db, "orders"))
            const allOrdersSnapshot = await getDocs(allOrdersQuery)
            console.log(`Total de órdenes en la base de datos: ${allOrdersSnapshot.size}`)
            setDebugInfo((prev) => prev + `\nTotal de órdenes en DB: ${allOrdersSnapshot.size}`)

            const q = query(ordersRef, where("vendorEmail", "==", vendorEmail))
            const querySnapshot = await getDocs(q)

            console.log(`Órdenes encontradas para ${vendorEmail}: ${querySnapshot.size}`)
            setDebugInfo((prev) => prev + `\nÓrdenes encontradas: ${querySnapshot.size}`)

            if (querySnapshot.empty) {
                const vendorEmails = new Set()
                allOrdersSnapshot.forEach((doc) => {
                    const data = doc.data()
                    if (data.vendorEmail) {
                        vendorEmails.add(data.vendorEmail)
                    }
                })
                console.log("VendorEmails existentes:", Array.from(vendorEmails))
                setDebugInfo((prev) => prev + `\nVendorEmails existentes: ${Array.from(vendorEmails).join(", ")}`)
            }

            const ordersData = []
            const namesCache = {}

            for (const doc of querySnapshot.docs) {
                const order = {
                    id: doc.id,
                    ...doc.data(),
                }
                ordersData.push(order)

                if (!namesCache[order.buyerEmail]) {
                    namesCache[order.buyerEmail] = await fetchCustomerName(order.buyerEmail)
                }
            }

            setOrders(ordersData)
            setCustomerNames(namesCache)
        } catch (error) {
            console.error("Error getting orders:", error)
            setDebugInfo((prev) => prev + `\nError: ${error.message}`)
            Alert.alert("Error", `Failed to load orders: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.toDate) {
            return "Invalid date"
        }
        try {
            const date = timestamp.toDate()
            return date.toLocaleDateString()
        } catch (error) {
            console.error("Error formatting date:", error)
            return "Invalid date"
        }
    }

    const getProductsSummary = (items) => {
        if (!items || items.length === 0) return "No products"

        if (items.length === 1) {
            return `${items[0].productName} (${items[0].quantity} ${items[0].unitMeasure})`
        }

        return `${items.length} products`
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "accepted":
                return "#4CAF50"
            case "rejected":
                return "#F44336"
            case "pending":
                return "#FFC107"
            case "shipped":
                return "#2196F3"
            case "delivered":
                return "#673AB7"
            case "finalized":
                return "#4CAF50"
            default:
                return "#000000"
        }
    }

    const renderOrder = (order) => (
        <Card
            key={order.id}
            style={styles.orderCard}
            onPress={() => navigation.navigate("OrderDetails", { orderId: order.id })}
        >
            <Card.Content>
                <Text style={styles.orderTitle}>Order #{order.id.substring(0, 8)}...</Text>
                <Text>Date: {formatDate(order.createdAt)}</Text>
                <Text>Products: {getProductsSummary(order.items)}</Text>
                <Text>Customer: {customerNames[order.buyerEmail] || order.buyerEmail}</Text>
                <Text style={{ color: getStatusColor(order.status) }}>
                    Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
                <Text>Total: ${order.totalAmount?.toLocaleString() || "0"}</Text>

                {order.paymentDetails && (
                    <View style={styles.paymentDetails}>
                        <Text style={styles.paymentTitle}>Payment Details:</Text>
                        <Text>Method: {order.paymentMethod || "Credit Card"}</Text>
                        {order.paymentDetails.cardLast4 && <Text>Card: •••• {order.paymentDetails.cardLast4}</Text>}
                    </View>
                )}
            </Card.Content>
        </Card>
    )

    const showDebugInfo = () => {
        Alert.alert("Debug Info", debugInfo)
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading orders...</Text>
                <Button mode="contained" onPress={showDebugInfo} style={styles.debugButton}>
                    Show Debug Info
                </Button>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" iconColor="#FFFFFF" size={24} onPress={() => navigation.goBack()} />
                <Text style={styles.title}>My Orders</Text>

                <View style={styles.filterContainer}>
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <Button
                                mode="contained"
                                onPress={() => setMenuVisible(true)}
                                style={styles.filterButton}
                                icon={!menuVisible ? "filter" : null}
                            >
                                Filter: {statusOptions.find((opt) => opt.value === statusFilter)?.label}
                            </Button>
                        }
                        anchorPosition="bottom"
                        contentStyle={styles.menuContent}
                    >
                        <ScrollView style={styles.menuScroll}>
                            {statusOptions.map((option) => (
                                <Menu.Item
                                    key={option.value}
                                    onPress={() => {
                                        setStatusFilter(option.value)
                                        setMenuVisible(false)
                                    }}
                                    title={option.label}
                                    style={styles.menuItem}
                                />
                            ))}
                        </ScrollView>
                    </Menu>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.ordersContainer}>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(renderOrder)
                ) : (
                    <View style={styles.noOrdersContainer}>
                        <Text style={styles.noOrdersText}>No orders found</Text>
                        <Text style={styles.noOrdersSubtext}>Make sure you're logged in with the correct account.</Text>
                        <Button mode="contained" onPress={showDebugInfo} style={styles.debugButton}>
                            Show Debug Info
                        </Button>
                        <Button
                            mode="contained"
                            onPress={() => fetchOrders(user?.email)}
                            style={[styles.debugButton, { marginTop: 10 }]}
                        >
                            Refresh Orders
                        </Button>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#263238",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
        marginTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginLeft: 10,
        flex: 1,
    },
    filterContainer: {
        zIndex: 1,
    },
    filterButton: {
        marginLeft: 10,
        backgroundColor: "#6200EE",
    },
    menuContent: {
        maxHeight: 300,
        width: 200,
    },
    menuScroll: {
        maxHeight: 250,
    },
    menuItem: {
        paddingVertical: 10,
    },
    ordersContainer: {
        paddingBottom: 20,
    },
    orderCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        marginBottom: 15,
        elevation: 2,
    },
    orderTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    noOrdersContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    noOrdersText: {
        fontSize: 18,
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 10,
    },
    noOrdersSubtext: {
        fontSize: 14,
        color: "#BBBBBB",
        textAlign: "center",
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        color: "#FFFFFF",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 20,
    },
    debugButton: {
        backgroundColor: "#FF5722",
    },
    paymentDetails: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    paymentTitle: {
        fontWeight: "bold",
        marginBottom: 5,
    },
})

export default MyOrdersScreen

