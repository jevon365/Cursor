/**
 * ActionLog - Component for action log showing game history
 * Collapsible log with chronological list of actions
 */

export class ActionLog {
    constructor(container, gameEngine) {
        this.container = container;
        this.gameEngine = gameEngine;
        this.entries = [];
        this.maxEntries = 100;
        // Sync with initial HTML state if collapsed class is present
        this.isCollapsed = container.classList.contains('collapsed');
        this.playerColors = ['#C41E3A', '#1E3A8A', '#228B22', '#6A0DAD'];
        this.render();
    }
    
    addEntry(message, type = 'info', playerId = null) {
        const entry = {
            id: Date.now() + Math.random(),
            message,
            type,
            playerId,
            timestamp: new Date()
        };
        
        this.entries.push(entry);
        
        // Keep only last maxEntries
        if (this.entries.length > this.maxEntries) {
            this.entries.shift();
        }
        
        this.render();
    }
    
    render() {
        // Reverse entries so newest are at top
        const reversedEntries = [...this.entries].reverse();
        
        // Update container collapsed class to match state
        if (this.isCollapsed) {
            this.container.classList.add('collapsed');
        } else {
            this.container.classList.remove('collapsed');
        }
        
        // Render ALL entries (not just 5) so scrolling works
        // The CSS max-height and overflow-y: auto will handle scrolling
        // Set explicit max-height constraint to enable scrolling (flex child needs constrained height)
        const maxContentHeight = 5 * 60; // 300px - shows ~5 entries
        
        this.container.innerHTML = `
            <div class="action-log-header">
                <span>📜 Action Log</span>
                <span class="toggle-icon">${this.isCollapsed ? '▼' : '▲'}</span>
            </div>
            <div class="action-log-content ${this.isCollapsed ? 'collapsed' : ''}" style="max-height: ${maxContentHeight}px; min-height: 0; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; flex-shrink: 1;">
                ${reversedEntries.length === 0 ? 
                    '<div class="log-empty">No actions yet</div>' :
                    reversedEntries.map(entry => this.renderEntry(entry)).join('')
                }
            </div>
        `;
        
        // Attach toggle event listener
        const header = this.container.querySelector('.action-log-header');
        if (header) {
            header.addEventListener('click', () => {
                this.toggle();
            });
        }
    }
    
    renderEntry(entry) {
        // Ensure playerId is valid index
        const playerIndex = entry.playerId !== null && entry.playerId >= 0 && entry.playerId < this.playerColors.length
            ? entry.playerId 
            : null;
        const playerColor = playerIndex !== null 
            ? this.playerColors[playerIndex] || '#666' 
            : 'transparent';
        
        return `
            <div class="log-entry log-${entry.type}" 
                 style="border-left-color: ${playerColor}">
                <div class="log-message">${this.escapeHtml(entry.message)}</div>
                <div class="log-time">${this.formatTime(entry.timestamp)}</div>
            </div>
        `;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    }
    
    clear() {
        this.entries = [];
        this.render();
    }
    
    toggle() {
        this.isCollapsed = !this.isCollapsed;
        // Update container class immediately for smoother transition
        if (this.isCollapsed) {
            this.container.classList.add('collapsed');
        } else {
            this.container.classList.remove('collapsed');
        }
        this.render();
    }
}
