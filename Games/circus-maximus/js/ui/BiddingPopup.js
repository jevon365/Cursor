/**
 * BiddingPopup - Modal popup for bidding on acts during Bid on Acts phase
 * Shows all available acts in a popup overlay
 */

export class BiddingPopup {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.selectedActId = null;
        this.bidAmount = 0;
        this.bidAmounts = {}; // Track bid amounts per act: { actId: amount }
        this.popupElement = null;
        this.isVisible = false;
        this.escapeHandler = null; // Store escape handler for cleanup
    }
    
    /**
     * Show the bidding popup
     */
    show() {
        if (this.isVisible) return;
        
        const state = this.gameEngine.getState();
        if (!state || state.currentPhase !== 'bidOnActs') {
            return;
        }
        
        // Sync selections from GameDisplay if available
        if (window.gameDisplay) {
            this.selectedActId = window.gameDisplay.selectedActId;
            this.bidAmount = window.gameDisplay.bidAmount;
            // Initialize bid amounts if needed
            if (!this.bidAmounts || Object.keys(this.bidAmounts).length === 0) {
                this.bidAmounts = {};
            }
        }
        
        this.isVisible = true;
        // Store previous focused element for restoration
        this.previousFocus = document.activeElement;
        this.createPopup();
        this.render();
        // Move focus to popup after render
        this.setFocusToPopup();
    }
    
    /**
     * Hide the bidding popup
     */
    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        
        // Remove escape key listener
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
        
        // Restore focus to previous element
        if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
            try {
                this.previousFocus.focus();
            } catch (e) {
                // If previous element is no longer available, focus body
                document.body.focus();
            }
        }
        this.previousFocus = null;
        
        if (this.popupElement) {
            this.popupElement.remove();
            this.popupElement = null;
        }
    }
    
    /**
     * Create the popup DOM element
     */
    createPopup() {
        // Remove existing popup if any
        const existing = document.getElementById('bidding-popup');
        if (existing) {
            existing.remove();
        }
        
        // Create popup container
        this.popupElement = document.createElement('div');
        this.popupElement.id = 'bidding-popup';
        this.popupElement.className = 'bidding-popup';
        
        // Create overlay backdrop
        const overlay = document.createElement('div');
        overlay.className = 'bidding-popup-overlay';
        overlay.addEventListener('click', () => {
            // Don't close on overlay click - require explicit close
        });
        
        // Create popup content
        const content = document.createElement('div');
        content.className = 'bidding-popup-content';
        
        // Create header with close button
        const header = document.createElement('div');
        header.className = 'bidding-popup-header';
        header.innerHTML = `
            <h2>Available Acts - Bid to Participate</h2>
            <button class="bidding-popup-close" aria-label="Close">×</button>
        `;
        
        // Create body for act cards
        const body = document.createElement('div');
        body.className = 'bidding-popup-body';
        body.id = 'bidding-popup-body';
        
        // Create footer for bid input (will be populated when act is selected)
        const footer = document.createElement('div');
        footer.className = 'bidding-popup-footer';
        footer.id = 'bidding-popup-footer';
        
        // Assemble popup
        content.appendChild(header);
        content.appendChild(body);
        content.appendChild(footer);
        this.popupElement.appendChild(overlay);
        this.popupElement.appendChild(content);
        
        // Add to document
        document.body.appendChild(this.popupElement);
        
        // Attach close button listener
        const closeBtn = header.querySelector('.bidding-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }
        
        // Close on Escape key
        this.escapeHandler = this.handleEscape.bind(this);
        document.addEventListener('keydown', this.escapeHandler);
    }
    
    /**
     * Handle Escape key to close popup
     */
    handleEscape(event) {
        if (event.key === 'Escape' && this.isVisible) {
            this.hide();
        }
    }
    
    /**
     * Render the popup content
     */
    render() {
        if (!this.popupElement || !this.isVisible) return;
        
        const state = this.gameEngine.getState();
        if (!state || state.currentPhase !== 'bidOnActs') {
            this.hide();
            return;
        }
        
        const availableActs = this.gameEngine.acts?.getAvailableActs() || { regular: [], execution: [] };
        const allActs = [...availableActs.regular, ...availableActs.execution];
        
        const body = this.popupElement.querySelector('#bidding-popup-body');
        const footer = this.popupElement.querySelector('#bidding-popup-footer');
        
        if (!body || !footer) return;
        
        // Render act cards
        body.innerHTML = `
            <div class="bidding-acts-grid">
                ${allActs.map(act => this.renderActCard(act, state)).join('')}
            </div>
        `;
        
        // Render footer with submit/pass buttons
        footer.innerHTML = this.renderFooter(state);
        
        // Attach event listeners
        this.attachListeners(state);
        
        // Set ARIA attributes for accessibility
        this.setupAccessibility();
    }
    
    /**
     * Setup accessibility attributes
     */
    setupAccessibility() {
        if (!this.popupElement) return;
        
        const content = this.popupElement.querySelector('.bidding-popup-content');
        if (content) {
            content.setAttribute('role', 'dialog');
            content.setAttribute('aria-labelledby', 'bidding-popup-title');
            content.setAttribute('aria-modal', 'true');
        }
        
        const header = this.popupElement.querySelector('.bidding-popup-header h2');
        if (header && !header.id) {
            header.id = 'bidding-popup-title';
        }
    }
    
    /**
     * Set focus to popup (first interactive element)
     */
    setFocusToPopup() {
        if (!this.popupElement) return;
        
        // Try to focus first act card, or first button, or close button
        setTimeout(() => {
            const firstCard = this.popupElement.querySelector('.bidding-act-card');
            const firstButton = this.popupElement.querySelector('.bidding-bid-btn, .bidding-submit-btn, .bidding-pass-btn');
            const closeButton = this.popupElement.querySelector('.bidding-popup-close');
            
            const focusTarget = firstCard || firstButton || closeButton;
            if (focusTarget) {
                focusTarget.focus();
                // Make cards focusable
                if (firstCard) {
                    firstCard.setAttribute('tabindex', '0');
                }
            }
        }, 100);
    }
    
    /**
     * Render an act card
     */
    renderActCard(act, state) {
        const bids = this.gameEngine.acts?.bids?.[act.id] || [];
        const totalBids = this.gameEngine.acts?.getTotalBids?.(act.id) || 0;
        const isSelected = this.selectedActId === act.id;
        const currentBidAmount = this.bidAmounts[act.id] || 0;
        const maxCoins = state.currentPlayer.resources.coins || 0;
        
        const actName = this.escapeHtml(act.name || act.id);
        const description = this.escapeHtml(act.description || '');
        
        return `
            <div class="bidding-act-card ${isSelected ? 'selected' : ''}" 
                 data-act-id="${act.id}"
                 role="button"
                 tabindex="0"
                 aria-label="Select ${actName} for bidding"
                 aria-selected="${isSelected}">
                <div class="bidding-act-card-title">${actName}</div>
                ${description ? `<div class="bidding-act-card-description">${description}</div>` : ''}
                <div class="bidding-act-card-details">
                    <div><strong>Cost:</strong> ${this.formatResourceCost(act.resourceCost)}</div>
                    <div><strong>Reward:</strong> ${act.coinReward || 0} coins</div>
                    <div><strong>Tracks:</strong> ${this.formatTrackRewards(act.tracks)}</div>
                    <div class="bidding-act-bids">
                        <strong>Total Bids:</strong> ${totalBids} coins
                        ${bids.length > 0 ? `
                            <div class="bidding-act-bids-list">
                                ${bids.map(bid => {
                                    const player = state.players.find(p => p.id === bid.playerId);
                                    return `<div>${this.escapeHtml(player?.name || 'Unknown')}: ${bid.coins} coins</div>`;
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="bidding-act-bid-controls">
                        <div class="bidding-act-bid-label">Your Bid:</div>
                        <div class="bidding-act-bid-amount-controls">
                            <button class="bidding-bid-btn bidding-bid-minus" 
                                    data-act-id="${act.id}" 
                                    ${currentBidAmount <= 0 ? 'disabled' : ''}
                                    aria-label="Decrease bid">−</button>
                            <span class="bidding-act-bid-amount" data-act-id="${act.id}">${currentBidAmount}</span>
                            <button class="bidding-bid-btn bidding-bid-plus" 
                                    data-act-id="${act.id}" 
                                    ${currentBidAmount >= maxCoins ? 'disabled' : ''}
                                    aria-label="Increase bid">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render footer with submit/pass buttons
     */
    renderFooter(state) {
        const maxCoins = state.currentPlayer.resources.coins || 0;
        const totalBidAmount = Object.values(this.bidAmounts || {}).reduce((sum, amt) => sum + amt, 0);
        
        // Find which act will be bid on: selected act first, then first act with a bid
        let actIdToBid = null;
        let bidAmountToSubmit = 0;
        let actNameToSubmit = '';
        
        if (this.selectedActId && this.bidAmounts[this.selectedActId] > 0) {
            actIdToBid = this.selectedActId;
            bidAmountToSubmit = this.bidAmounts[this.selectedActId];
        } else {
            const bidActs = Object.keys(this.bidAmounts).filter(actId => this.bidAmounts[actId] > 0);
            if (bidActs.length > 0) {
                actIdToBid = bidActs[0];
                bidAmountToSubmit = this.bidAmounts[actIdToBid];
            }
        }
        
        if (actIdToBid) {
            const availableActs = this.gameEngine.acts?.getAvailableActs() || { regular: [], execution: [] };
            const allActs = [...availableActs.regular, ...availableActs.execution];
            const act = allActs.find(a => a.id === actIdToBid);
            actNameToSubmit = act ? (act.name || act.id) : actIdToBid;
        }
        
        const hasBids = bidAmountToSubmit > 0;
        
        // Check if first player must bid
        const turnOrder = state.turnOrder || state.players.map((_, idx) => idx);
        const isFirstPlayer = state.currentPlayerIndex === turnOrder[0];
        const hasPlacedBid = state.currentPlayer.bids && state.currentPlayer.bids.length > 0;
        const canPass = !isFirstPlayer || hasPlacedBid;
        
        return `
            <div class="bidding-footer-content">
                <div class="bidding-footer-info">
                    <div class="bidding-coins-available">
                        You have <strong>${maxCoins}</strong> coins available
                    </div>
                    ${actNameToSubmit ? `
                        <div class="bidding-submit-info">
                            Will bid <strong>${bidAmountToSubmit}</strong> coins on <strong>${this.escapeHtml(actNameToSubmit)}</strong>
                        </div>
                    ` : totalBidAmount > 0 ? `
                        <div class="bidding-total-bids">
                            Total bids set: <strong>${totalBidAmount}</strong> coins
                        </div>
                    ` : ''}
                </div>
                <div class="bidding-footer-buttons">
                    <button class="bidding-submit-btn" 
                            id="bidding-submit-btn"
                            ${!hasBids ? 'disabled' : ''}
                            aria-label="Submit bid">
                        Submit Bid${bidAmountToSubmit > 0 ? ` (${bidAmountToSubmit} coins)` : ''}
                    </button>
                    <button class="bidding-pass-btn" 
                            id="bidding-pass-btn"
                            ${!canPass ? 'disabled' : ''}
                            aria-label="Pass">
                        Pass
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Attach event listeners
     */
    attachListeners(state) {
        const maxCoins = state.currentPlayer.resources.coins || 0;
        
        // Act card selection (clicking or keyboard activates it)
        const actCards = this.popupElement.querySelectorAll('.bidding-act-card');
        actCards.forEach(card => {
            const selectCard = (e) => {
                // Don't select if clicking on +/- buttons
                if (e.target.closest('.bidding-bid-btn')) {
                    return;
                }
                this.selectedActId = card.dataset.actId;
                // Notify GameDisplay of selection
                if (window.gameDisplay) {
                    window.gameDisplay.selectedActId = this.selectedActId;
                }
                // Update aria-selected attribute
                actCards.forEach(c => c.setAttribute('aria-selected', c === card ? 'true' : 'false'));
                this.render();
            };
            
            card.addEventListener('click', selectCard);
            // Keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectCard(e);
                }
            });
        });
        
        // +/- buttons for each card
        const plusButtons = this.popupElement.querySelectorAll('.bidding-bid-plus');
        plusButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const actId = btn.dataset.actId;
                const currentAmount = this.bidAmounts[actId] || 0;
                const newAmount = Math.min(currentAmount + 1, maxCoins);
                this.bidAmounts[actId] = newAmount;
                this.updateBidDisplay(actId, newAmount, maxCoins);
                this.updateFooter(state);
            });
        });
        
        const minusButtons = this.popupElement.querySelectorAll('.bidding-bid-minus');
        minusButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const actId = btn.dataset.actId;
                const currentAmount = this.bidAmounts[actId] || 0;
                const newAmount = Math.max(currentAmount - 1, 0);
                if (newAmount === 0) {
                    delete this.bidAmounts[actId];
                } else {
                    this.bidAmounts[actId] = newAmount;
                }
                this.updateBidDisplay(actId, newAmount, maxCoins);
                this.updateFooter(state);
            });
        });
        
        // Submit Bid button
        setTimeout(() => {
            const submitBtn = this.popupElement.querySelector('#bidding-submit-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    this.handleSubmitBid(state);
                });
            }
            
            // Pass button
            const passBtn = this.popupElement.querySelector('#bidding-pass-btn');
            if (passBtn) {
                passBtn.addEventListener('click', () => {
                    this.handlePass(state);
                });
            }
        }, 0);
    }
    
    /**
     * Update bid display for a specific act
     */
    updateBidDisplay(actId, amount, maxCoins) {
        const amountSpan = this.popupElement.querySelector(`.bidding-act-bid-amount[data-act-id="${actId}"]`);
        const plusBtn = this.popupElement.querySelector(`.bidding-bid-plus[data-act-id="${actId}"]`);
        const minusBtn = this.popupElement.querySelector(`.bidding-bid-minus[data-act-id="${actId}"]`);
        
        if (amountSpan) {
            amountSpan.textContent = amount;
        }
        if (plusBtn) {
            plusBtn.disabled = amount >= maxCoins;
        }
        if (minusBtn) {
            minusBtn.disabled = amount <= 0;
        }
    }
    
    /**
     * Update footer buttons state
     */
    updateFooter(state) {
        const footer = this.popupElement.querySelector('#bidding-popup-footer');
        if (footer) {
            footer.innerHTML = this.renderFooter(state);
            // Re-attach footer button listeners
            setTimeout(() => {
                const submitBtn = this.popupElement.querySelector('#bidding-submit-btn');
                const passBtn = this.popupElement.querySelector('#bidding-pass-btn');
                if (submitBtn) {
                    submitBtn.addEventListener('click', () => {
                        this.handleSubmitBid(state);
                    });
                }
                if (passBtn) {
                    passBtn.addEventListener('click', () => {
                        this.handlePass(state);
                    });
                }
            }, 0);
        }
    }
    
    /**
     * Handle submit bid - submit bid on selected act (or first act with bid)
     */
    handleSubmitBid(state) {
        const maxCoins = state.currentPlayer.resources.coins || 0;
        
        // Find which act to bid on: selected act first, then first act with a bid
        let actIdToBid = null;
        let bidAmount = 0;
        
        if (this.selectedActId && this.bidAmounts[this.selectedActId] > 0) {
            actIdToBid = this.selectedActId;
            bidAmount = this.bidAmounts[this.selectedActId];
        } else {
            // Find first act with a bid
            const bidActs = Object.keys(this.bidAmounts).filter(actId => this.bidAmounts[actId] > 0);
            if (bidActs.length > 0) {
                actIdToBid = bidActs[0];
                bidAmount = this.bidAmounts[actIdToBid];
            }
        }
        
        if (!actIdToBid || bidAmount === 0) {
            alert('Please place a bid on at least one act before submitting.');
            return;
        }
        
        if (bidAmount > maxCoins) {
            alert(`You don't have enough coins. Bid: ${bidAmount}, Available: ${maxCoins}`);
            return;
        }
        
        // Submit the bid
        const action = {
            type: 'bid',
            actId: actIdToBid,
            coins: bidAmount
        };
        
        // Execute through game controls
        if (window.gameControls) {
            const result = window.gameControls.handleAction(action);
            if (result && result.success !== false) {
                // Clear all bid amounts after successful submission (turn ends)
                this.bidAmounts = {};
                // Clear selection
                this.selectedActId = null;
                // Sync with GameDisplay
                if (window.gameDisplay) {
                    window.gameDisplay.selectedActId = null;
                    window.gameDisplay.bidAmount = 0;
                }
                // Update display (popup will close when turn ends)
                this.render();
            }
        }
    }
    
    /**
     * Handle pass action
     */
    handlePass(state) {
        // Check if first player must bid
        const turnOrder = state.turnOrder || state.players.map((_, idx) => idx);
        const isFirstPlayer = state.currentPlayerIndex === turnOrder[0];
        const hasPlacedBid = state.currentPlayer.bids && state.currentPlayer.bids.length > 0;
        
        if (isFirstPlayer && !hasPlacedBid) {
            alert('First player must place at least one bid before passing.');
            return;
        }
        
        const action = {
            type: 'pass'
        };
        
        // Execute through game controls
        if (window.gameControls) {
            const result = window.gameControls.handleAction(action);
            if (result && result.success !== false) {
                // Clear all bid amounts after passing (turn ends)
                this.bidAmounts = {};
                // Clear selection
                this.selectedActId = null;
                // Sync with GameDisplay
                if (window.gameDisplay) {
                    window.gameDisplay.selectedActId = null;
                    window.gameDisplay.bidAmount = 0;
                }
                // Update display (popup will close when turn ends)
                this.render();
            }
        }
    }
    
    /**
     * Update the popup (refresh content)
     */
    update() {
        if (this.isVisible) {
            // Sync selections from GameDisplay if available
            if (window.gameDisplay) {
                this.selectedActId = window.gameDisplay.selectedActId;
                this.bidAmount = window.gameDisplay.bidAmount;
            }
            // Preserve bid amounts when updating
            const currentBidAmounts = { ...this.bidAmounts };
            this.render();
            // Restore bid amounts after render
            this.bidAmounts = currentBidAmounts;
            // Update displays
            const state = this.gameEngine.getState();
            if (state) {
                const maxCoins = state.currentPlayer.resources.coins || 0;
                Object.keys(this.bidAmounts).forEach(actId => {
                    this.updateBidDisplay(actId, this.bidAmounts[actId], maxCoins);
                });
                this.updateFooter(state);
            }
        }
    }
    
    /**
     * Format resource cost
     */
    formatResourceCost(cost) {
        if (!cost) return 'None';
        const parts = [];
        if (cost.mummers) parts.push(`${cost.mummers} Mummers`);
        if (cost.animals) parts.push(`${cost.animals} Animals`);
        if (cost.slaves) parts.push(`${cost.slaves} Slaves`);
        if (cost.prisoners) parts.push(`${cost.prisoners} Prisoners`);
        return parts.join(', ') || 'None';
    }
    
    /**
     * Format track rewards
     */
    formatTrackRewards(tracks) {
        if (!tracks) return 'None';
        const parts = [];
        if (tracks.empire) parts.push(`Empire: ${tracks.empire > 0 ? '+' : ''}${tracks.empire}`);
        if (tracks.population) parts.push(`Population: ${tracks.population > 0 ? '+' : ''}${tracks.population}`);
        if (tracks.church) parts.push(`Church: ${tracks.church > 0 ? '+' : ''}${tracks.church}`);
        return parts.join(', ') || 'None';
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
