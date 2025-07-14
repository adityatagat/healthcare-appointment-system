// Switch to admin database to create the database
db = db.getSiblingDB('admin');

// Create the healthcare_appointments database
const appDb = db.getSiblingDB('healthcare_appointments');

// Create the user in the healthcare_appointments database with proper roles
print('Creating healthcare_user in healthcare_appointments database...');
try {
  // First, ensure the user doesn't exist
  db.dropUser('healthcare_user');
  print('Dropped existing healthcare_user');
} catch (e) {
  print('No existing healthcare_user to drop');
}

try {
  // Create the user in the healthcare_appointments database
  const createUserResult = db.getSiblingDB('healthcare_appointments').createUser({
    user: 'healthcare_user',
    pwd: 'healthcare_password',
    roles: [
      { role: 'readWrite', db: 'healthcare_appointments' },
      { role: 'dbAdmin', db: 'healthcare_appointments' }
    ],
    mechanisms: ['SCRAM-SHA-256']
  });
  print('Successfully created user:', JSON.stringify(createUserResult, null, 2));
} catch (e) {
  print('Error creating user:', e);
  throw e; // Rethrow to ensure the script fails if user creation fails
}

// Create initial collections with validation
const collections = ['appointments', 'availabilities'];

collections.forEach((collectionName) => {
  // Try to create collection, ignore if it already exists
  try {
    appDb.createCollection(collectionName, {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [],
          properties: {},
        },
      },
      validationLevel: 'strict',
      validationAction: 'error',
    });
    print(`Created collection: ${collectionName}`);
  } catch (e) {
    print(`Collection ${collectionName} already exists or error: ${e}`);
  }
});

// Create indexes for better query performance
try {
  appDb.appointments.createIndex({ patientId: 1 });
  appDb.appointments.createIndex({ doctorId: 1 });
  appDb.appointments.createIndex({ appointmentDate: 1, startTime: 1 });
  appDb.availabilities.createIndex({ doctorId: 1 });
  appDb.availabilities.createIndex({ date: 1, startTime: 1 });
  print('Created indexes');
} catch (e) {
  print(`Error creating indexes: ${e}`);
}

print('MongoDB initialization completed');
