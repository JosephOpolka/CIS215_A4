const backupDatabase = require('./backup');
const cleanupOldBackups = require('./cleanup');

// Test backup
backupDatabase();

// Optionally wait a bit and then test cleanup
setTimeout(() => cleanupOldBackups(), 10000);
