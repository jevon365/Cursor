/**
 * GameControls - Handles user input and game controls
 */

export class GameControls {
    constructor(gameEngine, uiManager) {
        this.gameEngine = gameEngine;
        this.uiManager = uiManager;
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for UI controls
     */
    setupEventListeners() {
        // Setup button
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.handleStartGame());
        }

        // Player count selector
        const playerCountSelect = document.getElementById('player-count');
        if (playerCountSelect) {
            // Initialize player config on load
            this.handlePlayerCountChange(parseInt(playerCountSelect.value));
            
            playerCountSelect.addEventListener('change', (e) => {
                this.handlePlayerCountChange(parseInt(e.target.value));
            });
        }

        // Footer buttons
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.handleHelp());
        }

        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }

        const loadBtn = document.getElementById('load-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.handleLoad());
        }
    }

    /**
     * Handle start game button
     */
    handleStartGame() {
        const playerCount = parseInt(document.getElementById('player-count').value);
        const players = [];
        
        // Get player configurations
        for (let i = 0; i < playerCount; i++) {
            const playerTypeSelect = document.getElementById(`player-${i}-type`);
            const playerNameInput = document.getElementById(`player-${i}-name`);
            
            const isAI = playerTypeSelect ? playerTypeSelect.value === 'ai' : false;
            const name = playerNameInput ? playerNameInput.value || `Player ${i + 1}` : `Player ${i + 1}`;
            
            players.push({ name, isAI });
        }
        
        this.uiManager.startGame(players);
    }

    /**
     * Handle player count change
     */
    handlePlayerCountChange(count) {
        const configDiv = document.getElementById('player-config');
        configDiv.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-type';
            playerDiv.innerHTML = `
                <label>
                    Player ${i + 1}:
                    <input type="text" id="player-${i}-name" placeholder="Player ${i + 1}" value="Player ${i + 1}">
                    <select id="player-${i}-type">
                        <option value="human">Human</option>
                        <option value="ai">AI</option>
                    </select>
                </label>
            `;
            configDiv.appendChild(playerDiv);
        }
    }

    /**
     * Handle action button click
     */
    handleAction(action) {
        const result = this.gameEngine.executeAction(action);
        
        if (result.success) {
            if (result.gameOver) {
                this.uiManager.showGameEnd(result.winner);
            } else {
                this.gameEngine.endTurn();
                this.uiManager.updateDisplay();
                
                // Check if next player is AI
                const state = this.gameEngine.getState();
                const currentPlayer = this.gameEngine.state.getCurrentPlayer();
                if (currentPlayer && currentPlayer.isAI) {
                    this.uiManager.handleAITurn();
                }
            }
        } else {
            this.uiManager.showError(result.error);
        }
    }

    /**
     * Handle help button
     */
    handleHelp() {
        // TODO: Show help/instructions modal
        alert('Help: This is a placeholder. Instructions will be added after rulebook analysis.');
    }

    /**
     * Handle save game
     */
    handleSave() {
        const saveData = this.gameEngine.saveGame();
        localStorage.setItem('circusMaximusSave', saveData);
        this.uiManager.showMessage('Game saved!', 'success');
    }

    /**
     * Handle load game
     */
    handleLoad() {
        const saveData = localStorage.getItem('circusMaximusSave');
        if (!saveData) {
            this.uiManager.showError('No saved game found');
            return;
        }
        
        const result = this.gameEngine.loadGame(saveData);
        if (result.success) {
            this.uiManager.updateDisplay();
            this.uiManager.showMessage('Game loaded!', 'success');
        } else {
            this.uiManager.showError('Failed to load game: ' + result.error);
        }
    }
}
