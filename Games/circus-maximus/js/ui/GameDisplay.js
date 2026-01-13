/**
 * GameDisplay - Renders the game state to the UI
 * 
 * Minimal MVP display - functional but not polished
 */

export class GameDisplay {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gamePlayContainer = document.getElementById('game-play');
    }

    /**
     * Update the game display with current state
     */
    update() {
        if (!this.gamePlayContainer) {
            return;
        }

        const state = this.gameEngine.getState();
        
        // Clear previous content
        this.gamePlayContainer.innerHTML = '';

        // Game info bar
        const gameInfo = document.createElement('div');
        gameInfo.className = 'game-info';
        gameInfo.innerHTML = `
            <div>
                <span class="current-phase">Phase: ${state.currentPhase || 'N/A'}</span>
            </div>
            <div>
                <span class="current-player">Current Player: ${state.currentPlayer.name}</span>
            </div>
            <div>
                Round: ${state.round} | Turn: ${state.turn}
            </div>
        `;
        this.gamePlayContainer.appendChild(gameInfo);

        // Player info cards
        const playersContainer = document.createElement('div');
        playersContainer.className = 'player-info';
        
        state.players.forEach((player, index) => {
            const isCurrent = player.name === state.currentPlayer.name;
            const playerCard = document.createElement('div');
            playerCard.className = `player-card ${isCurrent ? 'active' : ''}`;
            
            let resourcesHtml = '';
            Object.entries(player.resources).forEach(([key, value]) => {
                resourcesHtml += `<div class="resource"><span>${key}:</span> <span>${value}</span></div>`;
            });
            
            playerCard.innerHTML = `
                <h3>${player.name} ${isCurrent ? '(Current)' : ''}</h3>
                ${resourcesHtml}
                <div class="resource"><span>Workers:</span> <span>${player.workers.available} available, ${player.workers.placed} placed</span></div>
                <div class="resource"><span>Victory Points:</span> <span>${player.victoryPoints}</span></div>
            `;
            playersContainer.appendChild(playerCard);
        });
        
        this.gamePlayContainer.appendChild(playersContainer);

        // Game board area
        const boardArea = document.createElement('div');
        boardArea.className = 'game-board';
        boardArea.innerHTML = '<p>Game board will be displayed here once spaces are defined.</p>';
        this.gamePlayContainer.appendChild(boardArea);

        // Actions panel
        const actionsPanel = document.createElement('div');
        actionsPanel.className = 'actions-panel';
        
        const availableActions = this.gameEngine.getAvailableActions();
        if (availableActions.length === 0) {
            const passBtn = document.createElement('button');
            passBtn.className = 'action-btn';
            passBtn.textContent = 'Pass';
            passBtn.onclick = () => {
                this.gameEngine.endTurn();
                this.update();
            };
            actionsPanel.appendChild(passBtn);
        } else {
            availableActions.forEach(action => {
                const actionBtn = document.createElement('button');
                actionBtn.className = 'action-btn';
                actionBtn.textContent = action.name || 'Action';
                actionBtn.onclick = () => {
                    // Action handling will be done by GameControls
                    if (window.gameControls) {
                        window.gameControls.handleAction(action);
                    }
                };
                actionsPanel.appendChild(actionBtn);
            });
        }
        
        this.gamePlayContainer.appendChild(actionsPanel);
    }

    /**
     * Show game end screen
     */
    showGameEnd(winner) {
        const gameEndContainer = document.getElementById('game-end');
        if (!gameEndContainer) {
            return;
        }

        const state = this.gameEngine.getState();
        
        gameEndContainer.innerHTML = `
            <div class="winner-announcement">
                ${winner ? `${winner.name} Wins!` : 'Game Over'}
            </div>
            <div class="final-scores">
                <h3>Final Scores</h3>
                ${state.players.map(p => `
                    <div class="score-item">
                        <span>${p.name}</span>
                        <span>${p.victoryPoints} VP</span>
                    </div>
                `).join('')}
            </div>
            <button onclick="location.reload()">New Game</button>
        `;
        
        // Switch to game end screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        gameEndContainer.classList.add('active');
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const gamePlay = document.getElementById('game-play');
        if (gamePlay) {
            gamePlay.insertBefore(errorDiv, gamePlay.firstChild);
            
            // Remove after 5 seconds
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }

    /**
     * Show success message
     */
    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        const gamePlay = document.getElementById('game-play');
        if (gamePlay) {
            gamePlay.insertBefore(messageDiv, gamePlay.firstChild);
            
            // Remove after 3 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }
}
