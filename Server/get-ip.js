// Script to help find your IP address
const os = require('os');

console.log('\n🔍 Finding your IP addresses...\n');

const interfaces = os.networkInterfaces();
let found = false;

for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
            console.log(`📍 ${name}: ${interface.address}`);
            console.log(`   → Use this in .env: HOST=${interface.address}`);
            console.log(`   → Access URL: http://${interface.address}:5000\n`);
            found = true;
        }
    }
}

if (!found) {
    console.log('❌ No network interfaces found');
    console.log('\n💡 Try these options:');
    console.log('   - HOST=127.0.0.1  (Local only)');
    console.log('   - HOST=0.0.0.0    (All interfaces)');
}

console.log('✅ Done!');