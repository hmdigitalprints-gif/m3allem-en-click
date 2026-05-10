import fs from 'fs';

let content = fs.readFileSync('server/index.ts', 'utf8');

// 1. Helmet
content = content.replace(
  /app\.use\(helmet\(\{\s*contentSecurityPolicy: false,\s*crossOriginEmbedderPolicy: false,?\s*\}\)\);/,
`app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "wss:", "ws:"],
      }
    },
    crossOriginEmbedderPolicy: false,
  }));`
);

// 2. Limits
content = content.replace(/limit: '50mb'/g, "limit: '10mb'");

// 3. Socket.io Authentication
const ioAuth = `
  // Secure socket connection
  io.use((socket, next) => {
    let token = '';
    const cookieHeader = socket.request.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/token=([^;]+)/);
      if (match) token = match[1];
    }
    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }
    if (!token) return next(new Error('Authentication error'));
    
    import('jsonwebtoken').then(jwt => {
      jwt.default.verify(token, process.env.JWT_SECRET || '', (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.data.user = decoded;
        next();
      });
    });
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      // Secure: only allow user to join their own room
      socket.join(socket.data.user.id);
    });
`;

content = content.replace(/io\.on\("connection",\s*\(socket\)\s*=>\s*\{\s*socket\.on\("join",\s*\(userId\)\s*=>\s*\{\s*socket\.join\(userId\);\s*\}\);/g, ioAuth);

// 4. Secure socket routes to use socket.data.user.id where appropriate?
// Actually if they send a message, we should verify sender_id === socket.data.user.id
content = content.replace(/const \{ sender_id, receiver_id/g, `
      if (sender_id !== socket.data.user.id) return;
      const { sender_id, receiver_id`);

fs.writeFileSync('server/index.ts', content);

// 5. Fix forEach(async) in bookings.ts
let bookings = fs.readFileSync('server/routes/bookings.ts', 'utf8');
bookings = bookings.replace(/matchingArtisans\.forEach\(async\s*\(artisan\)\s*=>\s*\{/g, `await Promise.all(matchingArtisans.map(async (artisan) => {`);
bookings = bookings.replace(/if\s*\(io\)\s*\{\s*const\s+client.*?\}\s*\n\s*\}\s*\n\s*\}\s*\n\s*\}\);\s*res\.status\(201\)/s, (match) => {
  return match.replace(/}\);\s*res\.status\(201\)/, '}));\n          res.status(201)');
});
fs.writeFileSync('server/routes/bookings.ts', bookings);

// 6. Fix backend upload MIME types
let uploadCodeOld = `      const matches = file.match(/^data:([A-Za-z-+\\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 string' });
      }

      const mimeType = matches[1];
      const ext = mimeType.split('/')[1] || (type === 'audio' ? 'webm' : 'png');
      const buffer = Buffer.from(matches[2], 'base64');`;

let uploadCodeNew = `      const matches = file.match(/^data:([A-Za-z-+\\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 string' });
      }

      const mimeType = matches[1];
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'application/pdf'];
      if (!allowedMimes.includes(mimeType)) {
        return res.status(400).json({ error: 'Disallowed file type' });
      }
      
      const buffer = Buffer.from(matches[2], 'base64');
      if (buffer.length > 5 * 1024 * 1024) { // 5MB limit
        return res.status(400).json({ error: 'File size limit exceeded (5MB maximum)' });
      }

      const ext = mimeType.split('/')[1] || (type === 'audio' ? 'webm' : 'png');`;

content = fs.readFileSync('server/index.ts', 'utf8');
content = content.replace(uploadCodeOld, uploadCodeNew);
fs.writeFileSync('server/index.ts', content);

console.log('Backend fixes applied!');
