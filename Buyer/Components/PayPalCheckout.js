import React, { useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const PayPalCheckout = ({ amount, onPaymentSuccess, onPaymentError }) => {
  const webviewRef = useRef(null);

  // Client ID de Sandbox Público (para pruebas)
  const paypalHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://www.paypal.com/sdk/js?client-id=sb&currency=USD"></script>
      </head>
      <body style="display: flex; min-height: 100vh; justify-content: center; align-items: center;">
        <div id="paypal-button-container" style="width: 100%; max-width: 500px;"></div>
        <script>
          paypal.Buttons({
            style: {
              layout: 'vertical',
              color:  'gold',
              shape:  'rect',
              label:  'paypal'
            },
            createOrder: function(data, actions) {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: '${amount}'
                  }
                }]
              });
            },
            onApprove: function(data, actions) {
              return actions.order.capture().then(function(details) {
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({
                    status: 'success',
                    details: details
                  })
                );
              });
            },
            onError: function(err) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  status: 'error',
                  error: err
                })
              );
            }
          }).render('#paypal-button-container');
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("Mensaje de PayPal:", data);
      
      if (data.status === "success") {
        if (data.details.status === "COMPLETED") {
          onPaymentSuccess(data.details);
        }
      } else {
        onPaymentError(data.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error procesando mensaje:", error);
      onPaymentError("Error en formato de respuesta");
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: paypalHtml }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        onMessage={handleMessage}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator 
            size="large" 
            color="#003087" 
            style={styles.loader}
          />
        )}
        style={styles.webview}
        ref={webviewRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default PayPalCheckout;