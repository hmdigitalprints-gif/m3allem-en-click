import http from 'http';

http.get('http://127.0.0.1:3000/api/health', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', data));
}).on('error', (err) => console.log('Error:', err.message));

http.get('http://127.0.0.1:3000/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Home length:', data.length, data.substring(0, 100)));
}).on('error', (err) => console.log('Error:', err.message));
