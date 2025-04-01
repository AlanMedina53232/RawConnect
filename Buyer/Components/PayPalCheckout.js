import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';

const BACKEND_URL = 'http://192.168.0.166:3001'; // Cambia por tu IP

const PayPalCheckout = ({ amount, onPaymentSuccess, onClose }) => {
  const [approvalUrl, setApprovalUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const isPaymentFinalized = useRef(false);
  const webViewRef = useRef(null);

  // 1. Iniciar proceso de pago
  useEffect(() => {
    console.log('[PayPal] Monto recibido:', amount);
    
    const initPayment = async () => {
      try {
        console.log('[PayPal] Solicitando URL de pago...');
        const response = await axios.post(`${BACKEND_URL}/create-payment`, {
          amount: Number(amount)
        });

        console.log('[PayPal] Respuesta del backend:', response.data);
        
        if (!response.data?.approvalUrl) {
          throw new Error('No se recibió la URL de PayPal');
        }

        setApprovalUrl(response.data.approvalUrl);

      } catch (err) {
        console.error('[PayPal] Error:', {
          message: err.message,
          response: err.response?.data,
        });
        Alert.alert('Error', 'No se pudo conectar con PayPal');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [amount]);

  // 2. Manejar redirecciones de PayPal
  const handleNavigationStateChange = (navState) => {
    console.log('[PayPal] Navegando a:', navState.url);

    if (isPaymentFinalized.current) return;

    // Detectar éxito
    if (
      navState.url.includes('/checkout/complete') || 
      navState.url.includes('success') ||
      navState.url.includes('capture')
    ) {
      console.log('[PayPal] Pago exitoso confirmado');
      isPaymentFinalized.current = true;
      onPaymentSuccess();
      onClose();
    }

    // Detectar cancelación
    if (
      navState.url.includes('/checkout/error') ||
      navState.url.includes('cancel')
    ) {
      console.log('[PayPal] Pago cancelado');
      isPaymentFinalized.current = true;
      onClose();
    }
  };

  // 3. Timeout de seguridad
  useEffect(() => {
    const paymentTimeout = setTimeout(() => {
      if (!isPaymentFinalized.current) {
        console.warn('[PayPal] Tiempo de espera agotado');
        Alert.alert('Error', 'El pago tardó demasiado en completarse');
        onClose();
      }
    }, 45000); // 45 segundos

    return () => clearTimeout(paymentTimeout);
  }, []);

  // 4. Renderizado
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator 
          size="large" 
          color="#00457C"
          style={styles.loader}
        />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: approvalUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onError={(error) => {
            console.error('[WebView] Error:', error.nativeEvent);
            if (!isPaymentFinalized.current) onClose();
          }}
          onHttpError={(error) => {
            console.error('[WebView] HTTP Error:', error.nativeEvent.statusCode);
            if (!isPaymentFinalized.current) onClose();
          }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={false}
          incognito={true}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator 
              size="large" 
              color="#00457C" 
              style={styles.loader}
            />
          )}
        />
      )}
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  webview: {
    flex: 1,
    marginTop: 15,
    opacity: 1, // Asegurar visibilidad
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default PayPalCheckout;