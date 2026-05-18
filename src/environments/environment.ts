import { FirebaseOptions } from '@firebase/app-types';

const gatewayBaseUrl = 'https://api.ecosystemfx.net';

export const environment = {
  production: false,
  apis: {
    apiUrl: 'https://recycoin.net/',
    accountService: '/api/v1',
    accountServiceSignalR: `${gatewayBaseUrl}/hubs/tickets`,
    systemConfigurationService: '/api/v1',
    inventoryService: '/api/v1',
    walletService: '/api/v1',
    coinPayment: 'https://www.coinpayments.net/index.php',
  },
  googleAuth: {
    clientId: '',
  },
  openAI: {
    apiKey: '',
  },
  tokens: {
    coinPayment: 'bfd40db8f711397a6c5b7653175afc38',
    accountService:
      'eco-keygJ-MrM8y9jUD/b1dN24=neYjxeUA=N-f?9sHuDCcJ0JWfx-ajo7yjVn441',
    systemConfigurationService:
      'eco-key8ZgMhRytu-Jrv1FU1rZSw2jM-FaBP!ou!sJNBITT3tA63GBrrQiVe3zvS',
    inventoryService:
      'eco-keyLd5DU5faBWLfLrE1ATUK0c1qpvSci1x5TvFkDVw3FEM7JO30Jm!zXyB4w',
    walletService:
      'eco-keypFvQnUOko=r4/G!chia5Fe2-6OU?2YNYqAPWlaiN!uYrZIdwoUNv9P4d7',
    clientID: 'eco-keyhFvQoUOk=r6/F!chia2Fe1-8OU?4YNWqAVWlaiN!tYrWIdvoUMv8Q6d6',
  },
  coinPaymentConfiguration: {
    publicApiKey:
      '2a4ae9a2a58b59f4cf3cecf76e89f04155ccdcca4dc0c76b8665cf852cc127c2',
    privateApiKey:
      '36b880a10b1c6e87443132B57eE715e8511730D6aCbc47188d0dcff521D3eEc9',
    currency: 'USDC.TRC20',
    reset: '1',
    cmd: '_pay_simple',
    success_url: 'https://recycoin.net/#/conpayment-confirmation',
    format: 'json',
  },
};

export const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyBVM9OkEJa_rdAID5ydC8gGKjNaU6fFzQI',
  authDomain: 'ecosystem-6b056.firebaseapp.com',
  projectId: 'ecosystem-6b056',
  storageBucket: 'ecosystem-6b056.appspot.com',
  messagingSenderId: '1077107109427',
  appId: '1:1077107109427:web:bbe6268a7b4f1831717d46',
  measurementId: 'G-64EF1WMHB8',
};
