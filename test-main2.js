import http from 'http';

http.get('http://127.0.0.1:3000/src/main.tsx', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data.substring(0, 1000)));
}).on('error', (err) => console.log('Error:', err.message));
