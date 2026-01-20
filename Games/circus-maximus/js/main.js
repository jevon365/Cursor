/**
 * Main entry point for Circus Maximus game
 */

import { GameEngine } from './game/GameEngine.js';
import { UIManager } from './ui/UIManager.js';
import { CONFIG } from './utils/config.js';

// Initialize game
let gameEngine;
let uiManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    
    // Create game engine
    gameEngine = new GameEngine(CONFIG);
    
    // Create UI manager
    uiManager = new UIManager(gameEngine);
    
    // Make available globally for debugging
    window.gameEngine = gameEngine;
    window.uiManager = uiManager;
    
    // Verify button exists
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        console.log('Start game button found');
    } else {
        console.error('Start game button NOT found!');
    }
    
    // DIAGNOSTICS: Z-Index Layer Checker
    if (new URLSearchParams(window.location.search).get('diagnostics') === 'true') {
        console.log('%c=== Z-INDEX LAYER DIAGNOSTICS ===', 'font-size: 16px; font-weight: bold; color: red;');
        
        const checkZIndex = (selector, name) => {
            const el = document.querySelector(selector);
            if (el) {
                const zIndex = window.getComputedStyle(el).zIndex;
                const position = window.getComputedStyle(el).position;
                console.log(`${name}:`, {
                    selector,
                    zIndex: zIndex !== 'auto' ? zIndex : 'auto (needs position)',
                    position,
                    actualZIndex: position !== 'static' ? zIndex : 'static (z-index ignored)'
                });
                return { zIndex, position };
            } else {
                console.warn(`${name} not found:`, selector);
                return null;
            }
        };
        
        setTimeout(() => {
            checkZIndex('.game-container', 'Game Container');
            checkZIndex('.city-backdrop', 'City Backdrop');
            checkZIndex('.player-panels', 'Player Panels');
            checkZIndex('.markets-panel', 'Markets Panel');
            checkZIndex('.victory-tracks-panel', 'Victory Tracks Panel');
            checkZIndex('.round-info-panel', 'Round Info Panel');
            checkZIndex('.phase-indicator', 'Phase Indicator');
            checkZIndex('.action-panel', 'Action Panel');
            checkZIndex('.action-log', 'Action Log');
            checkZIndex('.location-tooltip', 'Location Tooltip');
            checkZIndex('select', 'Select Dropdowns');
            checkZIndex('input', 'Input Fields');
        }, 1000);
    }
    
    console.log('Circus Maximus game initialized');
});
