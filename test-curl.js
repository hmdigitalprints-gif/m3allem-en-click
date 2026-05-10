async function run() {
  const req = await fetch('http://localhost:3000/api/bookings', {
    headers: {
      'Authorization': 'Bearer undefined'
    }
  });
  console.log('STATUS:', req.status);
  console.log('CONTENT-TYPE:', req.headers.get('content-type'));
  const body = await req.text();
  console.log('BODY:', body.substring(0, 100));
}
run();
