import http from 'http';

http.get('http://127.0.0.1:3000/src/App.tsx', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(data.length);
    if (data.includes('Error')) {
      console.log('Error found:', data.substring(0, 500));
    }
  });
}).on('error', (err) => console.log('Error:', err.message));
