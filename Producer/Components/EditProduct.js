"use client"

import { LinearGradient } from "expo-linear-gradient"
import { addDoc, collection } from "firebase/firestore"
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, View, Image } from "react-native"
import {
    Button,
    Card,
    Chip,
    Divider,
    HelperText,
    IconButton,
    Menu,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper"
import Ionicons from 'react-native-vector-icons/Ionicons'
import ImageUploader from "../../components/ImageUploader"
import { db } from "../../firebase/config"

const COLORS = {
    primary: "#0D47A1",
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

const categories = ["Forestal", "Chemical", "Mineral", "Agricultural"]

const unitMeasures = [
    { label: "Units (ud)", value: "ud", category: "Quantity" },
    { label: "Box (box)", value: "box", category: "Quantity" },
    { label: "Pack (pack)", value: "pack", category: "Quantity" },
    { label: "Kilograms (kg)", value: "kg", category: "Weight" },
    { label: "Grams (g)", value: "g", category: "Weight" },
    { label: "Tons (t)", value: "t", category: "Weight" },
    { label: "Liters (L)", value: "L", category: "Volume" },
    { label: "Milliliters (ml)", value: "ml", category: "Volume" },
    { label: "Cubic meters (m³)", value: "m³", category: "Volume" },
    { label: "Meters (m)", value: "m", category: "Length" },
    { label: "Centimeters (cm)", value: "cm", category: "Length" },
    { label: "Millimeters (mm)", value: "mm", category: "Length" },
    { label: "Inches (in)", value: "in", category: "Length" },
    { label: "Feet (ft)", value: "ft", category: "Length" },
    { label: "Pallets", value: "pallets", category: "Industry" },
    { label: "Containers", value: "containers", category: "Industry" },
    { label: "Rolls", value: "rolls", category: "Industry" },
    { label: "Barrels", value: "barrels", category: "Industry" },
]

export default function EditProduct({ route, navigation }) {
    const { product: initialProduct, userData } = route.params
    const [loading, setLoading] = useState(false)
    const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)
    const [unitMenuVisible, setUnitMenuVisible] = useState(false)
    const [quantityError, setQuantityError] = useState("")
    const [priceError, setPriceError] = useState("")
    const [minOrderError, setMinOrderError] = useState("")

    // Estado inicial con valores numéricos convertidos a string
    const [product, setProduct] = useState({
        ...initialProduct,
        price: initialProduct.price ? String(initialProduct.price) : "",
        minimumOrder: initialProduct.minimumOrder ? String(initialProduct.minimumOrder) : "1",
        quantity: initialProduct.quantity ? String(initialProduct.quantity) : "",
    })

    console.log("Product state:", product)

    // Función para actualizar el producto con validación numérica
    const updateProduct = (field, value) => {
        // Limpiar errores al actualizar
        if (field === "quantity") setQuantityError("")
        if (field === "price") setPriceError("")
        if (field === "minimumOrder") setMinOrderError("")

        // Validación especial para campos numéricos
        if (["price", "minimumOrder", "quantity"].includes(field)) {
            // Permitir solo números y un punto decimal
            const cleanedValue = value.replace(/[^0-9.]/g, "")
            
            // Validar que sea un número positivo
            const numValue = parseFloat(cleanedValue)
            if (cleanedValue && (isNaN(numValue) || numValue <= 0)) {
                if (field === "quantity") setQuantityError("La cantidad debe ser un número positivo")
                if (field === "price") setPriceError("El precio debe ser un número positivo")
                if (field === "minimumOrder") setMinOrderError("El pedido mínimo debe ser un número positivo")
            }
            
            setProduct({ ...product, [field]: cleanedValue })
        } else {
            setProduct({ ...product, [field]: value })
        }
    }

    const validateForm = () => {
        let isValid = true

        if (!product.name || !product.category) {
            Alert.alert("Error de validación", "Nombre y categoría son campos requeridos")
            isValid = false
        }

        // Validar precio
        const price = parseFloat(product.price)
        if (!product.price || isNaN(price) || price <= 0) {
            setPriceError("Ingrese un precio válido")
            isValid = false
        }

        // Validar cantidad mínima
        const minOrder = parseInt(product.minimumOrder, 10)
        if (!product.minimumOrder || isNaN(minOrder) || minOrder <= 0) {
            setMinOrderError("Ingrese una cantidad mínima válida")
            isValid = false
        }

        // Validar cantidad en stock
        const quantity = parseFloat(product.quantity)
        if (!product.quantity || isNaN(quantity) || quantity <= 0) {
            setQuantityError("Ingrese una cantidad válida")
            isValid = false
        }

        if (!product.unitMeasure) {
            Alert.alert("Error de validación", "Seleccione una unidad de medida")
            isValid = false
        }

        return isValid
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        if (!userData?.email) {
            Alert.alert("Error", "Vendedor no tiene un correo electrónico asociado.")
            return
        }

        try {
            setLoading(true)

            const productData = {
                ...product,
                name: product.name.trim(),
                description: product.description?.trim(),
                specifications: product.specifications?.trim(),
                price: parseFloat(product.price),
                minimumOrder: parseInt(product.minimumOrder, 10),
                quantity: parseFloat(product.quantity),
                createdAt: new Date(),
                vendor: userData.email,
            }

            console.log("Enviando datos a Firebase:", productData)
            await addDoc(collection(db, "products"), productData)

            Alert.alert("Éxito", "Producto agregado correctamente", [
                { text: "OK", onPress: () => navigation.goBack() }
            ])
        } catch (error) {
            console.error("Error al agregar producto:", error)
            Alert.alert("Error", "No se pudo agregar el producto. Intente nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    // Agrupar unidades de medida por categoría para el menú
    const groupedUnitMeasures = unitMeasures.reduce((acc, unit) => {
        if (!acc[unit.category]) {
            acc[unit.category] = []
        }
        acc[unit.category].push(unit)
        return acc
    }, {})

    return (
        <View style={styles.container}>
            <ScrollView style={styles.form}>
                <Card style={styles.imageCard}>
                    <Card.Content style={styles.imageCardContent}>
                        <View style={styles.imageContainer}>
                            {product.imageUrl ? (
                                <Image 
                                    source={{ uri: product.imageUrl }} 
                                    style={styles.productImage} 
                                    resizeMode="cover" 
                                />
                            ) : (
                                <View style={styles.productImagePlaceholder}>
                                    <Ionicons name="image-outline" size={80} color={COLORS.white} />
                                    <Text style={styles.imagePlaceholderText}>No hay imagen disponible</Text>
                                </View>
                            )}
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{product.category}</Text>
                            </View>
                        </View>
                        <ImageUploader 
                            uploadPreset="rawcn_products" 
                            onUploadComplete={(url) => updateProduct("imageUrl", url)} 
                        />
                    </Card.Content>
                </Card>

                <Text style={styles.sectionTitle}>Información Básica</Text>
                <Card style={styles.card}>
                    <Card.Content>
                        <TextInput
                            label="Nombre del Producto *"
                            value={product.name}
                            onChangeText={(text) => updateProduct("name", text)}
                            mode="outlined"
                            style={styles.input}
                            outlineColor="#4a90c0"
                            activeOutlineColor="#6bb2db"
                            left={<TextInput.Icon icon="tag" />}
                        />

                        <View style={styles.inputContainer}>
                            <TextInput
                                label="Categoría *"
                                value={product.category}
                                onChangeText={(text) => updateProduct("category", text)}
                                mode="outlined"
                                style={styles.input}
                                outlineColor="#4a90c0"
                                activeOutlineColor="#6bb2db"
                                left={<TextInput.Icon icon="shape" />}
                                right={<TextInput.Icon icon="menu-down" onPress={() => setCategoryMenuVisible(true)} />}
                            />
                            <Menu
                                visible={categoryMenuVisible}
                                onDismiss={() => setCategoryMenuVisible(false)}
                                anchor={{ x: 0, y: 0 }}
                                style={styles.menu}
                            >
                                {categories.map((category) => (
                                    <Menu.Item
                                        key={category}
                                        onPress={() => {
                                            updateProduct("category", category)
                                            setCategoryMenuVisible(false)
                                        }}
                                        title={category}
                                    />
                                ))}
                            </Menu>
                            <View style={styles.chipContainer}>
                                {categories.map((category) => (
                                    <Chip
                                        key={category}
                                        selected={product.category === category}
                                        onPress={() => updateProduct("category", category)}
                                        style={[styles.chip, product.category === category && { backgroundColor: "#d6eaf8" }]}
                                        textStyle={product.category === category ? { color: "#4a90c0" } : {}}
                                    >
                                        {category}
                                    </Chip>
                                ))}
                            </View>
                        </View>

                        <TextInput
                            label="Descripción"
                            value={product.description}
                            onChangeText={(text) => updateProduct("description", text)}
                            mode="outlined"
                            style={styles.input}
                            outlineColor="#4a90c0"
                            activeOutlineColor="#6bb2db"
                            multiline
                            numberOfLines={3}
                            left={<TextInput.Icon icon="text" />}
                        />
                    </Card.Content>
                </Card>

                <Text style={styles.sectionTitle}>Detalles del Producto</Text>
                <Card style={styles.card}>
                    <Card.Content>
                        <TextInput
                            label="Especificaciones"
                            value={product.specifications}
                            onChangeText={(text) => updateProduct("specifications", text)}
                            mode="outlined"
                            style={styles.input}
                            outlineColor="#4a90c0"
                            activeOutlineColor="#6bb2db"
                            multiline
                            numberOfLines={3}
                            left={<TextInput.Icon icon="clipboard-list" />}
                        />

                        <View style={styles.row}>
                            <View style={[styles.halfInput, { marginRight: 8 }]}>
                                <TextInput
                                    label="Precio *"
                                    value={product.price}
                                    onChangeText={(text) => updateProduct("price", text)}
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor={priceError ? "#F44336" : "#4a90c0"}
                                    activeOutlineColor={priceError ? "#F44336" : "#6bb2db"}
                                    keyboardType="decimal-pad"
                                    left={<TextInput.Icon icon="currency-usd" />}
                                    error={!!priceError}
                                />
                                {priceError && <HelperText type="error">{priceError}</HelperText>}
                            </View>

                            <View style={styles.halfInput}>
                                <TextInput
                                    label="Pedido Mínimo *"
                                    value={product.minimumOrder}
                                    onChangeText={(text) => updateProduct("minimumOrder", text)}
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor={minOrderError ? "#F44336" : "#4a90c0"}
                                    activeOutlineColor={minOrderError ? "#F44336" : "#6bb2db"}
                                    keyboardType="number-pad"
                                    left={<TextInput.Icon icon="package-variant" />}
                                    error={!!minOrderError}
                                />
                                {minOrderError && <HelperText type="error">{minOrderError}</HelperText>}
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.halfInput, { marginRight: 8 }]}>
                                <TextInput
                                    label="Cantidad en Stock *"
                                    value={product.quantity}
                                    onChangeText={(text) => updateProduct("quantity", text)}
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor={quantityError ? "#F44336" : "#4a90c0"}
                                    activeOutlineColor={quantityError ? "#F44336" : "#6bb2db"}
                                    keyboardType="decimal-pad"
                                    left={<TextInput.Icon icon="counter" />}
                                    error={!!quantityError}
                                />
                                {quantityError && <HelperText type="error">{quantityError}</HelperText>}
                            </View>

                            <View style={styles.halfInput}>
                                <TextInput
                                    label="Unidad de Medida *"
                                    value={
                                        product.unitMeasure
                                            ? unitMeasures.find((u) => u.value === product.unitMeasure)?.label || product.unitMeasure
                                            : ""
                                    }
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor="#4a90c0"
                                    activeOutlineColor="#6bb2db"
                                    left={<TextInput.Icon icon="scale" />}
                                    right={<TextInput.Icon icon="menu-down" onPress={() => setUnitMenuVisible(true)} />}
                                    editable={false}
                                />
                                <Menu
                                    visible={unitMenuVisible}
                                    onDismiss={() => setUnitMenuVisible(false)}
                                    anchor={{ x: 0, y: 0 }}
                                    style={styles.unitMenu}
                                >
                                    {Object.entries(groupedUnitMeasures).map(([category, units]) => (
                                        <View key={category}>
                                            <Menu.Item title={category} disabled titleStyle={styles.menuCategoryTitle} />
                                            <Divider />
                                            {units.map((unit) => (
                                                <Menu.Item
                                                    key={unit.value}
                                                    onPress={() => {
                                                        updateProduct("unitMeasure", unit.value)
                                                        setUnitMenuVisible(false)
                                                    }}
                                                    title={unit.label}
                                                />
                                            ))}
                                            {category !== Object.keys(groupedUnitMeasures).pop() && <Divider bold />}
                                        </View>
                                    ))}
                                </Menu>
                            </View>
                        </View>

                        <TextInput
                            label="Opciones de Entrega"
                            value={product.deliveryOptions}
                            onChangeText={(text) => updateProduct("deliveryOptions", text)}
                            mode="outlined"
                            style={styles.input}
                            outlineColor="#4a90c0"
                            activeOutlineColor="#6bb2db"
                            multiline
                            numberOfLines={2}
                            left={<TextInput.Icon icon="truck" />}
                        />
                    </Card.Content>
                </Card>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    loading={loading}
                    disabled={loading}
                    icon="check"
                >
                    Guardar Producto
                </Button>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    form: {
        flex: 1,
        padding: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: "#FFFFFF",
    },
    imageCard: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: "#FFFFFF",
    },
    imageCardContent: {
        alignItems: "center",
        padding: 16,
    },
    imageContainer: {
        width: "100%",
        height: 200,
        position: "relative",
        backgroundColor: COLORS.white,
        marginBottom: 16,
        borderRadius: 8,
        overflow: "hidden",
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    productImagePlaceholder: {
        width: "100%",
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
        top: 10,
        right: 10,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "bold",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4a90c0",
        marginTop: 16,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        marginBottom: 5,
        backgroundColor: "#FFFFFF",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    halfInput: {
        flex: 1,
    },
    menu: {
        marginTop: 70,
    },
    unitMenu: {
        marginTop: 70,
        width: 250,
    },
    menuCategoryTitle: {
        fontWeight: "bold",
        color: "#4a90c0",
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 10,
    },
    chip: {
        margin: 4,
        backgroundColor: "#f0f8ff",
    },
    submitButton: {
        marginTop: 20,
        marginBottom: 40,
        backgroundColor: "#6bb2db",
        paddingVertical: 8,
        borderRadius: 12,
        elevation: 4,
    },
})