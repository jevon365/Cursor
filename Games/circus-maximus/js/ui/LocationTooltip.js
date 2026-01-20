/**
 * LocationTooltip - Component for location hover tooltips
 * Shows location details, costs, current state
 */

export class LocationTooltip {
    constructor(event, location, state, gameEngine) {
        this.event = event;
        this.location = location;
        this.state = state;
        this.gameEngine = gameEngine;
        this.tooltip = null;
        this.show();
    }
    
    show() {
        // Remove existing tooltip
        const existing = document.querySelector('.location-tooltip');
        if (existing) existing.remove();
        
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'location-tooltip';
        
        // Build tooltip content
        const content = this.buildContent();
        this.tooltip.innerHTML = content;
        
        document.body.appendChild(this.tooltip);
        
        // Position tooltip
        this.positionTooltip();
    }
    
    buildContent() {
        const workerPlacements = this.state.board?.workerPlacements?.[this.location.id] || {};
        const allWorkers = Object.entries(workerPlacements).map(([playerId, count]) => {
            const player = this.state.players.find(p => p.id === parseInt(playerId));
            return { name: this.escapeHtml(player?.name || 'Unknown'), count };
        });
        
        // Escape location data
        const locationName = this.escapeHtml(this.location.name || 'Unknown Location');
        const locationDescription = this.escapeHtml(this.location.description || 'No description');
        
        let html = `
            <div class="tooltip-title">${locationName}</div>
            <div class="tooltip-description">${locationDescription}</div>
        `;
        
        // Cost information
        const workerCost = (this.gameEngine.config?.limits?.workerDeployCost || 1) + 
                          (this.state.workerCostModifier || 0);
        html += `
            <div class="tooltip-cost">
                <strong>Cost:</strong> ${workerCost} coin${workerCost !== 1 ? 's' : ''}
            </div>
        `;
        
        // Location-specific requirements
        if (this.location.id === 'oracle') {
            html += `
                <div class="tooltip-cost">
                    <strong>Requires:</strong> 1 Animal
                </div>
            `;
        }
        
        if (this.location.id === 'guildhall') {
            html += `
                <div class="tooltip-cost">
                    <strong>Requires:</strong> 1 Slave + 5 Coins = 1 Worker
                </div>
            `;
        }
        
        // Workers at this location
        if (allWorkers.length > 0) {
            html += `
                <div class="tooltip-workers">
                    <strong>Workers:</strong><br>
                    ${allWorkers.map(w => `${w.name}: ${w.count}`).join('<br>')}
                </div>
            `;
        }
        
        // Max workers info
        if (this.location.maxWorkersPerPlayer !== null) {
            html += `
                <div class="tooltip-info">
                    Max workers per player: ${this.location.maxWorkersPerPlayer}
                </div>
            `;
        }
        
        if (this.location.maxWorkersTotal !== null) {
            html += `
                <div class="tooltip-info">
                    Max workers total: ${this.location.maxWorkersTotal}
                </div>
            `;
        }
        
        return html;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    positionTooltip() {
        const rect = this.event.target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = rect.right + 10;
        let top = rect.top;
        
        // Adjust if tooltip would go off screen
        if (left + tooltipRect.width > viewportWidth) {
            left = rect.left - tooltipRect.width - 10;
        }
        
        if (top + tooltipRect.height > viewportHeight) {
            top = viewportHeight - tooltipRect.height - 10;
        }
        
        // Ensure tooltip stays on screen
        left = Math.max(10, Math.min(left, viewportWidth - tooltipRect.width - 10));
        top = Math.max(10, Math.min(top, viewportHeight - tooltipRect.height - 10));
        
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }
    
    static hide() {
        const tooltip = document.querySelector('.location-tooltip');
        if (tooltip) tooltip.remove();
    }
}
