import bcrypt from 'bcrypt';

const password = '123456';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Hash generado para "123456":');
  console.log(hash);
  process.exit(0);
});
