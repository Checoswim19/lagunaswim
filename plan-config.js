/* ============================================================
   PLAN A DISTANCIA · configuración
   Aquí van los links de Mercado Pago, los precios y el cupo.
   Mientras un link esté vacío, el botón abre WhatsApp con el coach.
   ============================================================ */
window.LS_PLAN = {
  // Link de pago de Mercado Pago de la semana de prueba ($100, pago único)
  PRUEBA_URL: '',
  // Link del plan de suscripción de Mercado Pago ($500 al mes)
  MENSUAL_URL: '',
  PRECIO_PRUEBA: 100,
  PRECIO_MES: 500,
  CUPO: 20,
  WHATSAPP: '528713164850',
  OBJETIVOS: [
    { id: 'tecnica', nombre: 'Técnica y salud', detalle: '3 sesiones por semana. Corregir técnica y nadar sin dolor.' },
    { id: 'competencia', nombre: 'Masters competencia', detalle: '4 a 5 sesiones por semana. Control de marcas y plan por temporada.' },
    { id: 'aguas', nombre: 'Aguas abiertas', detalle: 'Alberca y aguas abiertas: sighting, navegación y estrategia para 1.5 K, 3 K, 5 K o 10 K. Copa 2027 y Oceanman.' },
  ],
  FIREBASE: {
    apiKey: 'AIzaSyAox5JQc_swfKXpPrPOS_v3ReHpkuxDasA',
    authDomain: 'laguna-swim-chrono.firebaseapp.com',
    databaseURL: 'https://laguna-swim-chrono-default-rtdb.firebaseio.com',
    projectId: 'laguna-swim-chrono',
    storageBucket: 'laguna-swim-chrono.firebasestorage.app',
    messagingSenderId: '618459577354',
    appId: '1:618459577354:web:2e26bda92112ce241c33f3'
  }
};
