/**
 * ActionPanel - Component for action buttons
 * Dynamic buttons based on available actions, handles action execution
 */

export class ActionPanel {
    constructor(container, gameEngine, uiManager) {
        this.container = container;
        this.gameEngine = gameEngine;
        this.uiManager = uiManager;
        this.render();
    }
    
    render() {
        const state = this.gameEngine.getState();
        const availableActions = this.gameEngine.getAvailableActions();
        const currentPlayer = state.currentPlayer;
        
        if (currentPlayer.isAI) {
            this.container.innerHTML = '<div class="ai-turn-message">AI is thinking...</div>';
            return;
        }
        
        this.container.innerHTML = `
            <div class="action-panel-content">
                ${availableActions.map(action => this.renderActionButton(action, state)).join('')}
            </div>
        `;
        
        this.attachActionListeners(state);
    }
    
    renderActionButton(action, state) {
        let buttonText = action.name || 'Action';
        let disabled = false;
        let canExecute = true;
        
        // Determine button text and state based on action type and phase
        if (action.type === 'bid') {
            const selectedActId = this.uiManager.display?.selectedActId;
            const bidAmount = this.uiManager.display?.bidAmount || 0;
            canExecute = selectedActId && bidAmount > 0 && bidAmount <= (state.currentPlayer.resources.coins || 0);
            buttonText = canExecute ? `Bid ${bidAmount} coins` : 'Select act and enter bid';
        } else if (action.type === 'placeWorker') {
            const selectedLocationId = this.uiManager.display?.selectedLocationId;
            const workerCost = (this.gameEngine.config?.limits?.workerDeployCost || 1) + 
                              (state.workerCostModifier || 0);
            canExecute = selectedLocationId && 
                        (state.currentPlayer.workers.available || 0) > 0 &&
                        (state.currentPlayer.resources.coins || 0) >= workerCost;
            const selectedSpace = state.board?.spaces?.find(s => s.id === selectedLocationId);
            const locationName = selectedSpace?.name || selectedLocationId || 'location';
            buttonText = canExecute ? `Place Worker at ${locationName} (${workerCost} coin${workerCost !== 1 ? 's' : ''})` : 'Select location';
        } else if (action.type === 'buyResource') {
            const selectedResourceType = this.uiManager.display?.selectedResourceType;
            const currentMarket = state.currentMarket;
            const marketQueue = state.marketQueues?.[currentMarket] || [];
            const playerInQueue = currentMarket && marketQueue.includes(state.currentPlayer.id);
            canExecute = selectedResourceType && 
                        selectedResourceType === currentMarket &&
                        playerInQueue;
            buttonText = canExecute ? `Buy ${selectedResourceType}` : 'Select resource from current market';
        }
        
        disabled = !canExecute;
        
        return `
            <button class="action-button ${disabled ? 'disabled' : ''}" 
                    data-action-type="${action.type}"
                    ${disabled ? 'disabled' : ''}>
                ${buttonText}
            </button>
        `;
    }
    
    attachActionListeners(state) {
        const buttons = this.container.querySelectorAll('.action-button:not(.disabled)');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const actionType = button.dataset.actionType;
                this.executeAction(actionType, state);
            });
        });
    }
    
    executeAction(actionType, state) {
        let action = { type: actionType };
        
        if (actionType === 'bid') {
            const selectedActId = this.uiManager.display?.selectedActId;
            const bidAmount = this.uiManager.display?.bidAmount;
            if (!selectedActId || !bidAmount) {
                this.uiManager.showError('Please select an act and enter a bid amount');
                return;
            }
            action.actId = selectedActId;
            action.coins = bidAmount;
        } else if (actionType === 'placeWorker') {
            const selectedLocationId = this.uiManager.display?.selectedLocationId;
            if (!selectedLocationId) {
                this.uiManager.showError('Please select a location');
                return;
            }
            action.locationId = selectedLocationId;
        } else if (actionType === 'buyResource') {
            const selectedResourceType = this.uiManager.display?.selectedResourceType;
            if (!selectedResourceType) {
                this.uiManager.showError('Please select a resource');
                return;
            }
            action.resourceType = selectedResourceType;
        }
        
        // Execute via UIManager
        if (this.uiManager.controls) {
            this.uiManager.controls.handleAction(action);
        }
    }
    
    update(state) {
        this.render();
    }
}
