// src/data/menuCategories.jsx
import React from "react";

export const menuCategories = [
{ 
id: "Espresso Based", 
name: "Espresso Based",
icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2M4 3h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4V3z"/>
    </svg>
)
},
{ 
id: "Flavoured Based", 
name: "Flavoured Based",
icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.5 2h-13c-.28 0-.5.22-.5.5v19c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-19c0-.28-.22-.5-.5-.5M12 19c-.83 0-1.5-.67-1.5-1.5S11.17 16 12 16s1.5.67 1.5 1.5S12.83 19 12 19m5.5-5H6.5V4h11v10z"/>
    </svg>
)
},
{ 
id: "Matcha Series", 
name: "Matcha Series",
icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2v2l1 1v13a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5l1-1V2H4m11 16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3h8v3m0-5H7V5h8v8z"/>
    </svg>
)
},
{ 
id: "Milk Series", 
name: "Milk Series",
icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 19H7c-1.1 0-2-.9-2-2V8h14v9c0 1.1-.9 2-2 2M19 6H5V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2m3 5h-2V9h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1z"/>
    </svg>
)
},
{ 
id: "Pastry", 
name: "Pastry",
icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 2C9.5 2 7 4.5 7 7.5c0 1.9 1 3.6 2.4 4.7L8 22h9l-1.4-9.8c1.4-1.1 2.4-2.8 2.4-4.7C18 4.5 15.5 2 12.5 2m0 2c2.5 0 4.5 2 4.5 4.5c0 1.7-1 3.2-2.4 4l-.6.4.8 5.6h-5.7l.8-5.6-.6-.4c-1.4-.8-2.4-2.3-2.4-4C8 6 10 4 12.5 4z"/>
    </svg>
)
},
{ 
id: "Sourdough", 
name: "Sourdough",
icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 4v7l2 3v2h1v2h-1v4H5v-4H4v-2h1v-2l2-3V4c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2M9 4v7.75L7.5 14h9L15 11.75V4H9m-1 13h8v2H8v-2z"/>
    </svg>
)
},
{ 
id: "Instant", 
name: "Instant",
icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2M1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1m16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
)
},
];