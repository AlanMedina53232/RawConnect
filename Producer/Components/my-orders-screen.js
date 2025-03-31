"use client"
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from "react-native"
import { Card, Text, IconButton, useTheme, Menu, Button } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const MyOrdersScreen = () => {
    const theme = useTheme()
    const navigation = useNavigation()

    // Estados
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [customerNames, setCustomerNames] = useState({})
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [menuVisible, setMenuVisible] = useState(false)

    // Opciones de filtro
    const statusOptions = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Finalized', value: 'finalized' },
        { label: 'Rejected', value: 'rejected' }
    ]

    // Obtener el usuario autenticado
    const auth = getAuth()
    const user = auth.currentUser

    useEffect(() => {
        if (user) {
            fetchOrders(user.email)
        }
    }, [user])

    // Filtrar órdenes cuando cambia el filtro o las órdenes
    useEffect(() => {
        const filtered = statusFilter === 'all' 
            ? orders.filter(order => ['pending', 'accepted', 'rejected', 'shipped', 'delivered', 'finalized'].includes(order.status))
            : orders.filter(order => order.status === statusFilter);
        setFilteredOrders(filtered);
    }, [statusFilter, orders])

    // Función para obtener el nombre del cliente
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

    // Función para obtener las órdenes desde Firebase
    const fetchOrders = async (vendorEmail) => {
        setLoading(true)
        const db = getFirestore()
        const ordersRef = collection(db, "orders")
        const q = query(ordersRef, where("vendorEmail", "==", vendorEmail))

        try {
            const querySnapshot = await getDocs(q)
            const ordersData = []
            const namesCache = {}

            for (const doc of querySnapshot.docs) {
                const order = {
                    id: doc.id,
                    ...doc.data()
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
        } finally {
            setLoading(false)
        }
    }

    // Función para formatear la fecha
    const formatDate = (timestamp) => {
        const date = timestamp.toDate()
        return date.toLocaleDateString()
    }

    // Función para obtener el resumen de productos
    const getProductsSummary = (items) => {
        if (!items || items.length === 0) return "No products"
        
        if (items.length === 1) {
            return `${items[0].productName} (${items[0].quantity} ${items[0].unitMeasure})`
        }
        
        return `${items.length} products`
    }

    // Función para obtener color según status
    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return '#4CAF50'
            case 'rejected': return '#F44336'
            case 'pending': return '#FFC107'
            case 'shipped': return '#2196F3'
            case 'delivered': return '#673AB7'
            case "finalized": return "#4CAF50"
            default: return '#000000'
        }
    }

    // Función para renderizar cada orden
    const renderOrder = (order) => (
        <Card key={order.id} style={styles.orderCard} onPress={() => navigation.navigate("OrderDetails", { orderId: order.id })}>
            <Card.Content>
                <Text style={styles.orderTitle}>Order #{order.id.substring(0, 8)}...</Text>
                <Text>Date: {formatDate(order.createdAt)}</Text>
                <Text>Products: {getProductsSummary(order.items)}</Text>
                <Text>Customer: {customerNames[order.buyerEmail] || order.buyerEmail}</Text>
                <Text style={{ color: getStatusColor(order.status) }}>
                    Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
                <Text>Total: ${order.totalAmount?.toLocaleString() || '0'}</Text>
            </Card.Content>
        </Card>
    )

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton 
                    icon="arrow-left" 
                    iconColor="#FFFFFF" 
                    size={24} 
                    onPress={() => navigation.goBack()} 
                />
                <Text style={styles.title}>My Orders</Text>
                
                {/* Selector de filtro - Modificado */}
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
                                Filter: {statusOptions.find(opt => opt.value === statusFilter)?.label}
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
                    <Text style={styles.noOrdersText}>No orders found</Text>
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
        backgroundColor: '#6200EE',
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
    noOrdersText: {
        fontSize: 18,
        color: "#FFFFFF",
        textAlign: "center",
    },
    loadingText: {
        fontSize: 18,
        color: "#FFFFFF",
        textAlign: "center",
        marginTop: 20,
    },
})

export default MyOrdersScreen