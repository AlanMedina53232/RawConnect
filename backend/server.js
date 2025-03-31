require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Configuración de middlewares
app.use(cors());
app.use(express.json());

// Middleware de logging para todas las solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Función para obtener token de PayPal
const getPayPalAccessToken = async () => {
  try {
    console.log('[PayPal] Obteniendo token de acceso...');
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
    
    const response = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('[PayPal] Token obtenido con éxito');
    return response.data.access_token;

  } catch (error) {
    console.error('[PayPal] Error al obtener token:', error.response?.data || error.message);
    throw error;
  }
};

// Ruta para crear pagos
app.post('/create-payment', async (req, res) => {
  try {
    console.log('[Create Payment] Body recibido:', req.body);
    
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
      console.error('[Create Payment] Monto inválido:', amount);
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const accessToken = await getPayPalAccessToken();
    console.log('[Create Payment] Creando orden en PayPal...');

    const response = await axios.post(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'MXN',
            value: Number(amount).toFixed(2)
          }
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[Create Payment] Orden creada:', response.data.id);
    const approvalLink = response.data.links.find(link => link.rel === 'approve');

    res.json({
      paymentId: response.data.id,
      approvalUrl: approvalLink.href
    });

  } catch (error) {
    console.error('[Create Payment] Error crítico:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para ejecutar pagos
app.post('/execute-payment', async (req, res) => {
  try {
    console.log('[Execute Payment] Ejecutando pago:', req.body);
    
    const { paymentId, payerId } = req.body;
    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paymentId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[Execute Payment] Pago completado:', response.data.id);
    res.json({ success: true, data: response.data });

  } catch (error) {
    console.error('[Execute Payment] Error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    res.status(500).json({ success: false, error: 'Error al procesar pago' });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  console.log(`🔑 PayPal Client ID: ${process.env.PAYPAL_CLIENT_ID ? 'Configurado' : 'NO CONFIGURADO'}`);
  console.log(`=================================`);
});