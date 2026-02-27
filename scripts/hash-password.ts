async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const password = process.argv[2];
if (!password) {
  console.error('Usage: npx ts-node scripts/hash-password.ts <password>');
  process.exit(1);
}

hashPassword(password).then(hash => {
  console.log('Password hash (SHA-256):');
  console.log(hash);
  console.log('\nSet this as ADMIN_PASSWORD_HASH environment variable in Cloudflare Pages.');
});
