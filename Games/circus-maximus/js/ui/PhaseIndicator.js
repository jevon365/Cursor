/**
 * PhaseIndicator - Component for displaying current phase
 * Shows phase name, round number, turn info
 */

export class PhaseIndicator {
    constructor(container, gameEngine) {
        this.container = container;
        this.gameEngine = gameEngine;
        this.phaseColors = {
            'bidOnActs': '#DAA520',
            'placeWorkers': '#1E3A8A',
            'buyResources': '#228B22',
            'performActs': '#8B0000',
            'cleanup': '#6B4423'
        };
        this.phaseNames = {
            'bidOnActs': 'Bid on Acts',
            'placeWorkers': 'Place Workers',
            'buyResources': 'Buy Resources',
            'performActs': 'Perform Acts',
            'cleanup': 'Cleanup'
        };
        this.render();
    }
    
    render() {
        const state = this.gameEngine.getState();
        const phase = state.currentPhase;
        const phaseName = this.phaseNames[phase] || phase;
        const phaseColor = this.phaseColors[phase] || '#6B4423';
        
        // Get phase-specific info
        let phaseInfo = '';
        if (phase === 'bidOnActs') {
            phaseInfo = 'Leader on Empire track goes first';
        } else if (phase === 'placeWorkers') {
            phaseInfo = 'Leader on Population track goes first';
        } else if (phase === 'buyResources') {
            phaseInfo = 'Order based on market queue';
        } else if (phase === 'performActs') {
            phaseInfo = 'Order based on bid order';
        }
        
        this.container.innerHTML = `
            <div class="phase-indicator-content" style="border-color: ${phaseColor}">
                <div class="phase-name" style="color: ${phaseColor}">
                    ${phaseName}
                </div>
                <div class="phase-meta">
                    <span>Round ${state.round}</span>
                    <span>•</span>
                    <span>Turn ${state.turn}</span>
                </div>
                ${phaseInfo ? `<div class="phase-info">${phaseInfo}</div>` : ''}
            </div>
        `;
    }
    
    update(state) {
        this.render();
    }
}
