/**
 * PlayerPanel - Component for rendering a single player's resource panel
 * Displays player name, color indicator, and all 6 resources with icons
 */

export class PlayerPanel {
    constructor(container, player, playerIndex, gameEngine) {
        this.container = container;
        this.player = player;
        this.playerIndex = playerIndex;
        this.gameEngine = gameEngine;
        this.playerColors = ['#C41E3A', '#1E3A8A', '#228B22', '#6A0DAD'];
        this.totalPlayers = null; // Will be set on render
        this.render();
    }
    
    render(isCurrentParam = null) {
        // Use passed isCurrent parameter if available, otherwise calculate from state
        let isCurrent;
        if (isCurrentParam !== null) {
            isCurrent = isCurrentParam;
        } else {
            const state = this.gameEngine.getState();
            isCurrent = state.currentPlayer && state.currentPlayer.id === this.player.id;
        }
        
        // Get total player count for position calculation
        const state = this.gameEngine?.getState();
        const totalPlayers = state?.players?.length || this.totalPlayers || 2;
        this.totalPlayers = totalPlayers;
        
        // Determine panel position for alignment
        let positionClass = '';
        const isFirst = this.playerIndex === 0;
        const isLast = this.playerIndex === totalPlayers - 1;
        const isMiddle = totalPlayers === 3 && this.playerIndex === 1;
        
        if (isFirst) {
            positionClass = 'panel-left'; // Left side - align right
        } else if (isLast) {
            positionClass = 'panel-right'; // Right side - align left
        } else if (isMiddle) {
            positionClass = 'panel-center'; // Center - align center
        } else {
            // For 4 players: index 1 is left-center, index 2 is right-center
            // For left-center panels (index 1), align right
            // For right-center panels (index 2), align left
            if (this.playerIndex < totalPlayers / 2) {
                positionClass = 'panel-left-center'; // Left-center - align right
            } else {
                positionClass = 'panel-right-center'; // Right-center - align left
            }
        }
        
        const playerColor = this.playerColors[this.playerIndex] || '#666';
        
        // Escape HTML to prevent XSS
        const playerName = this.escapeHtml(this.player?.name || 'Unknown');
        
        // Safely access resources and workers with null checks
        const resources = this.player?.resources || {};
        const workers = this.player?.workers || {};
        const isAI = this.player?.isAI || false;
        
        this.container.innerHTML = `
            <div class="player-panel ${isCurrent ? 'current-player' : ''} ${positionClass}" 
                 style="border-color: ${playerColor}">
                <div class="player-name" style="color: ${playerColor}">
                    ${playerName}
                    ${isAI ? '<span class="ai-badge">AI</span>' : ''}
                </div>
                <div class="player-resources">
                    <div class="resource-item">
                        <span class="resource-icon coins">💰</span>
                        <span class="resource-value">${resources.coins || 0}</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon workers">👷</span>
                        <span class="resource-value">${workers.available || 0}/${workers.placed || 0}</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon mummers">🎭</span>
                        <span class="resource-value">${resources.mummers || 0}</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon animals">🐘</span>
                        <span class="resource-value">${resources.animals || 0}</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon slaves">⛓️</span>
                        <span class="resource-value">${resources.slaves || 0}</span>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon prisoners">🔒</span>
                        <span class="resource-value">${resources.prisoners || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    update(player, isCurrent) {
        this.player = player;
        // Pass isCurrent to render to avoid re-reading state (prevents stale data)
        this.render(isCurrent);
    }
}
