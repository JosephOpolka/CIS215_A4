const fs = require('fs');
const path = require('path');

function backupDatabase() {
    const backupsDir = path.join(__dirname, 'backups');
    // Ensuring the directory exists at all
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
        console.log('Created the backups directory.');
    }

    // Making date
    const date = new Date();
    const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;

    // Path to original database
    const source = path.join(__dirname, 'purchase_system.db');
    const destination = path.join(backupsDir, `backup-${dateString}.db`);

    try {
        fs.copyFileSync(source, destination);
        // Update file timestamps to current date
        fs.utimesSync(destination, new Date(), new Date());
        console.log(`Database backup was successful. Backup created at: ${destination}`);
    } catch (err) {
        console.error('Failed to create database backup:', err);
    }
}

module.exports = backupDatabase;