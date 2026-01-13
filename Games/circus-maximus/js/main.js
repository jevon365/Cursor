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
    // Create game engine
    gameEngine = new GameEngine(CONFIG);
    
    // Create UI manager
    uiManager = new UIManager(gameEngine);
    
    // Make available globally for debugging
    window.gameEngine = gameEngine;
    window.uiManager = uiManager;
    
    console.log('Circus Maximus game initialized');
    console.log('Note: Game mechanics will be implemented after rulebook analysis');
});
