// src/data/menuCategories.jsx
// CORRECTED VERSION - Flavoured Based icon fixed!
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
    id: "Flavoured Lattes", 
    name: "Flavoured Lattes",
    icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 19h18v2H3v-2M5 6v7c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4V6H5m2 0h10v1c0 .28-.11.53-.29.71-.19.19-.44.29-.71.29H8c-.28 0-.53-.11-.71-.29C7.11 7.53 7 7.28 7 7V6m0 3h10v4c0 1.11-.89 2-2 2H9c-1.11 0-2-.89-2-2V9m3-7c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v2h-4V2z"/>
    </svg>
    )
},
{ 
    id: "Matcha Series", 
    name: "Matcha Series",
    icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 3H6C4.9 3 4 3.9 4 5v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h0V5c0-1.1-.9-2-2-2m0 9c0 3.31-2.69 6-6 6s-6-2.69-6-6V5h12v7M8 20v2h8v-2H8z"/>
    </svg>
    )
},
{ 
    id: "Milk Series", 
    name: "Milk Series",
    icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 2v2l1 1v13a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5l1-1V2H4m11 16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3h8v3m0-5H7V5h8v8z"/>
    </svg>
    )
}
];