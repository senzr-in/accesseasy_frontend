const fs = require('fs');

async function run() {
    const userId = '0008d876-5ec5-4f0c-8d76-5cc6e5ac75a4';
    let lat = 12.9716;
    let lng = 77.5946;

    console.log("Starting simulation for 1 minute...");
    
    for (let i = 0; i < 12; i++) {
        lng += 0.0001; // Move slightly East
        
        try {
            const res = await fetch('https://appv1.fieldseasy.com/directus/users/' + userId, {
                method: 'PATCH',
                headers: {
                    Authorization: 'Bearer p2pJHhZAjca6jQea0RbPVwNWRyrJG29X',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentLat: lat, currentLng: lng })
            });
            console.log(`Updated to ${lat}, ${lng} (status: ${res.status})`);
        } catch (e) {
            console.error(e);
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    console.log("Done");
}

run();
