/*
const fs = require('fs');
const path = require('path');

function cleanupOldBackups() {
    const backupPath = path.join(__dirname, 'backups');
    const files = fs.readdirSync(backupPath);
    const now = Date.now();

    files.forEach(file => {
        const filePath = path.join(backupPath, file);
        const stat = fs.statSync(filePath);
        // Convert age in days for easier readability and management
        const ageInDays = (now - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);

        console.log(`File: ${file}, Modified Time: ${stat.mtime}`);
        console.log(`Current Time: ${new Date(now)}`);
        console.log(`File Age in Days: ${ageInDays.toFixed(2)}`);

        if (ageInDays > 7) { // Change this to whatever your time criteria are
            fs.unlinkSync(filePath);
            console.log(`Deleted old backup: ${file}`);
        }
    });
}

module.exports = cleanupOldBackups;
*/

//(Testing Functionality)
const fs = require('fs');
const path = require('path');

function cleanupOldBackups() {
    const backupPath = path.join(__dirname, 'backups');
    const files = fs.readdirSync(backupPath);
    const now = Date.now();

    files.forEach(file => {
        const filePath = path.join(backupPath, file);
        const stat = fs.statSync(filePath);
        const ageInMinutes = (now - stat.mtime.getTime()) / 1000 / 60;

        console.log(`File: ${file}, Modified Time: ${stat.mtime} \n`);
        console.log(`Current Time: ${new Date(now)} \n`);
        console.log(`File Age in Minutes: ${ageInMinutes.toFixed(2)} \n`);

        if (ageInMinutes > 2) { 
            fs.unlinkSync(filePath);
            console.log(`Deleted old backup: ${file}`);
        }
    });
}

module.exports = cleanupOldBackups;