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
    
    console.log('Circus Maximus game initialized');
});
