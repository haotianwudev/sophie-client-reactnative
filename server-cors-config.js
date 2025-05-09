// CORS Configuration for the Sophie GraphQL Server
// Copy these settings to your server.js file

app.use(cors({
  origin: [
    'https://studio.apollographql.com', // Apollo Studio
    'https://sophie-ai-finance.vercel.app',
    'http://localhost:3000',
    'http://localhost:8081', // Expo web development server
    'http://localhost:19006', // Expo web development server (alternative port)
    /^http:\/\/localhost(:\d+)?$/, // All localhost ports
    /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/, // HTTP/HTTPS local network IPs
    /^exp:\/\/192\.168\.\d+\.\d+:\d+$/, // Expo local network URIs
    /^https?:\/\/[^\/]*sophie-ai-finance[^\/]*$/, // Any sophie-ai-finance domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Apollo-Require-Preflight',
    'apollographql-client-name',
    'apollographql-client-version'
  ],
  exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials']
})); 