// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();
const db = firebase.firestore();



// Make addContact available globally
window.addContact = async function (name, email, subject, message) {
    try {
        // Additional validation
        if (!name || !email || !subject || !message) {
            throw new Error('Missing required fields');
        }
        
        if (typeof name !== 'string' || typeof email !== 'string' || 
            typeof subject !== 'string' || typeof message !== 'string') {
            throw new Error('Invalid input types');
        }
        
        await db.collection("contacts").add({
            name: name,
            email: email,
            subject: subject,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Contact submitted!");
        return true;
    } catch (error) {
        console.error("Error adding contact: ", error);
        return false;
    }
};



// Make updateAnalytics available globally
window.updateAnalytics = async function() {
    try {
        const analyticsRef = db.collection("analytics").doc("siteData");
        
        // Get current data
        const doc = await analyticsRef.get();
        
        if (doc.exists) {
            // Update existing document
            await analyticsRef.update({
                pageViews: firebase.firestore.FieldValue.increment(1),
                lastVisited: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Create new document if it doesn't exist
            await analyticsRef.set({
                pageViews: 1,
                lastVisited: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        console.log("Analytics updated successfully");
        return true;
    } catch (error) {
        console.error("Error updating analytics: ", error);
        return false;
    }
};



async function addSubscriber(email) {
    try {
        // Additional validation
        if (!email || typeof email !== 'string') {
            throw new Error('Invalid email');
        }
        
        const docRef = await firebase.firestore().collection('subscribers').add({
            email: email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error adding subscriber: ", error);
        return false;
    }
}

// Simple sanitization function for text inputs
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remove HTML tags
    let clean = input.replace(/<[^>]*>?/gm, '');
    
    // Escape special characters
    clean = clean.replace(/[&<>"'`=\/]/g, function (s) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        }[s];
    });
    
    // Trim whitespace
    return clean.trim();
}

// For more complex HTML content (if needed)
function sanitizeHTML(input) {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [], // No HTML tags allowed by default
        ALLOWED_ATTR: []  // No attributes allowed
    });
}


// Add this function to your firebase-config.js
window.trackResumeDownload = async function(email = null) {
    try {
        await db.collection('resumeDownloads').add({
            email: email || 'anonymous', // Use provided email or 'anonymous'
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent,
            ip: await fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => data.ip)
                .catch(() => 'unknown')
        });
        return true;
    } catch (error) {
        console.error("Error tracking resume download: ", error);
        return false;
    }
};


