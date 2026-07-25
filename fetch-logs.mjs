import fs from 'fs';

(async () => {
    try {
        const authData = await fetch('http://localhost:8055/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' }) // Or read a token if you prefer, going with standard credentials or checking via generic call if public 
        });
        
        let token = "";
        if (authData.ok) {
            const data = await authData.json();
            token = data.data.access_token;
        } else {
            // We can also just read the frontend token if the user is 
            console.log("Could not login. Trying to read Vue files logic...");
        }

        if(!token) return;

        const res = await fetch('http://localhost:8055/items/logs?limit=5&fields=*', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const d = await res.json();
        console.log("LOGS:", JSON.stringify(d, null, 2));
    } catch (e) {
        console.error(e);
    }
})();
