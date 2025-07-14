const jwt = require('jsonwebtoken');

// This should match the JWT_SECRET in your .env file
const JWT_SECRET = 'your_jwt_secret_key_here';

// Test user data
const testUser = {
  id: '64d5f7b3e8b9f6b5e8f7c6d5',
  email: 'test@example.com',
  role: 'admin',
  name: 'Test User'
};

// Generate token
const token = jwt.sign(
  { user: testUser },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Generated JWT Token:');
console.log(token);
