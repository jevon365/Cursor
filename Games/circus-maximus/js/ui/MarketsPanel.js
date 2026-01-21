/**
 * MarketsPanel - Component for rendering all three markets as vertical bars
 * Displays market as vertical bars with queue markers (similar to victory tracks)
 */

export class MarketsPanel {
    constructor(container, gameEngine) {
        this.container = container;
        this.gameEngine = gameEngine;
        this.playerColors = ['#C41E3A', '#1E3A8A', '#228B22', '#6A0DAD'];
        this.render();
    }
    
    render() {
        const state = this.gameEngine?.getState();
        if (!state) {
            console.error('MarketsPanel.render(): No game state available');
            this.container.innerHTML = '<div style="padding: 16px; color: red; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Error: No game state</div>';
            return;
        }
        
        const markets = [
            { id: 'mummers', name: 'Mummers', icon: '🎭', restockRate: 3 },
            { id: 'animals', name: 'Animals', icon: '🐘', restockRate: 2 },
            { id: 'slaves', name: 'Slaves', icon: '⛓️', restockRate: 2 }
        ];
        
        try {
            const html = `
                <div class="markets-container">
                    ${markets.map(market => this.renderMarketBar(market, state)).join('')}
                </div>
            `;
            
            this.container.innerHTML = html;
            
            // Attach hover event listeners for restock tooltips
            this.attachTooltipListeners();
            
            // Attach hover event listeners for market bar tooltips
            this.attachMarketBarTooltips();
            
            // Attach purchase button listeners
            this.attachPurchaseListeners(state);
        } catch (error) {
            console.error('Error rendering markets panel:', error);
            this.container.innerHTML = `<div style="padding: 16px; color: red; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Error: ${error.message}</div>`;
        }
    }
    
    renderMarketBar(market, state) {
        // Get market state from game engine
        const simpleMarket = this.gameEngine.markets;
        const marketState = simpleMarket?.markets?.[market.id] || [];
        const availableCount = marketState.length;
        const maxCapacity = 15; // Maximum possible resources in a market
        
        // Get prices
        const prices = this.gameEngine.config?.markets?.[market.id]?.priceTiers || [];
        const currentPrice = availableCount > 0 && simpleMarket ? simpleMarket.getPrice(market.id) : 'N/A';
        
        // Ensure marketQueues is an object
        const marketQueues = state.marketQueues || {};
        const queue = Array.isArray(marketQueues[market.id]) ? marketQueues[market.id] : [];
        const currentMarket = state.currentMarket;
        const isCurrent = currentMarket === market.id;
        
        const escapedMarketName = this.escapeHtml(market.name);
        const escapedCurrentPrice = this.escapeHtml(String(currentPrice));
        
        // Calculate stock fill percentage (fill from bottom, like a thermometer)
        const fillPercentage = (availableCount / maxCapacity) * 100;
        
        // Check if current player can buy from this market
        // Player must be in the queue (turn order determines when it's their turn)
        const currentPlayer = state.currentPlayer;
        const playerInQueue = queue.includes(currentPlayer.id);
        const canBuy = isCurrent && 
                      queue.length > 0 && 
                      playerInQueue &&
                      availableCount > 0 &&
                      currentPlayer.resources.coins >= currentPrice;
        
        return `
            <div class="market-container ${isCurrent ? 'current-market' : ''}">
                <div class="market-header">
                    <div class="market-icon">${market.icon}</div>
                    <div class="market-price">${escapedCurrentPrice}<span class="market-price-label"> coins</span></div>
                </div>
                <div class="market-bar-wrapper">
                    <div class="market-stock-count">${availableCount}</div>
                    <div class="market-bar" 
                         data-market-id="${market.id}"
                         data-available-count="${availableCount}"
                         data-current-price="${currentPrice}"
                         data-market-name="${escapedMarketName}">
                        <!-- Stock fill indicator -->
                        <div class="market-fill" style="height: ${fillPercentage}%;"></div>
                    </div>
                </div>
                <div class="market-footer">
                    ${isCurrent ? `
                        <button class="market-purchase-btn ${canBuy ? '' : 'disabled'}" 
                                data-market="${market.id}"
                                ${canBuy ? '' : 'disabled'}
                                aria-label="Purchase ${escapedMarketName} for ${escapedCurrentPrice} coins"
                                ${canBuy ? '' : 'aria-disabled="true"'}>
                            Purchase (${escapedCurrentPrice} coins)
                        </button>
                    ` : ''}
                    <div class="restock-info" 
                         data-restock-rate="${market.restockRate}"
                         title="Restock Rate: ${market.restockRate} per player during cleanup"
                         role="button"
                         aria-label="Restock rate information"
                         tabindex="0">
                        ℹ️
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
    
    attachTooltipListeners() {
        const restockInfos = this.container.querySelectorAll('.restock-info');
        restockInfos.forEach(info => {
            const showTooltipHandler = (e) => {
                const restockRate = e.target.dataset.restockRate;
                this.showTooltip(e.target, `Restock Rate: ${restockRate} per player during cleanup`);
            };
            const hideTooltipHandler = () => {
                this.hideTooltip();
            };
            
            // Mouse events
            info.addEventListener('mouseenter', showTooltipHandler);
            info.addEventListener('mouseleave', hideTooltipHandler);
            
            // Keyboard events for accessibility
            info.addEventListener('focus', showTooltipHandler);
            info.addEventListener('blur', hideTooltipHandler);
            info.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showTooltipHandler(e);
                }
            });
        });
    }
    
    attachMarketBarTooltips() {
        const marketBars = this.container.querySelectorAll('.market-bar');
        marketBars.forEach(bar => {
            const mouseMoveHandler = (e) => {
                const availableCount = parseInt(e.target.dataset.availableCount) || 0;
                const currentPrice = e.target.dataset.currentPrice || 'N/A';
                const marketName = e.target.dataset.marketName || 'Market';
                
                const tooltipText = `
                    <div style="font-weight: 700; margin-bottom: 4px;">${marketName}</div>
                    <div>Available: <strong>${availableCount}</strong></div>
                    <div>Price: <strong>${currentPrice} coins</strong></div>
                `;
                this.showMarketBarTooltip(e, tooltipText);
            };
            
            bar.addEventListener('mouseenter', mouseMoveHandler);
            bar.addEventListener('mousemove', mouseMoveHandler);
            bar.addEventListener('mouseleave', () => {
                this.hideMarketBarTooltip();
            });
        });
    }
    
    showTooltip(element, text) {
        // Remove existing tooltip
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'market-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate position - default below element
        let left = rect.left;
        let top = rect.bottom + 5;
        
        // Adjust for mobile viewport constraints
        if (viewportWidth < 768) {
            // On mobile, center tooltip and ensure it's visible
            left = Math.max(10, Math.min(viewportWidth - tooltipRect.width - 10, rect.left + (rect.width / 2) - (tooltipRect.width / 2)));
            
            // If tooltip would go below viewport, position above
            if (top + tooltipRect.height > viewportHeight - 10) {
                top = rect.top - tooltipRect.height - 5;
            }
            
            // If still not enough room, position at bottom of viewport
            if (top < 10) {
                top = viewportHeight - tooltipRect.height - 10;
            }
        } else {
            // Desktop: adjust if tooltip goes off screen
            if (left + tooltipRect.width > viewportWidth - 10) {
                left = viewportWidth - tooltipRect.width - 10;
            }
            if (left < 10) {
                left = 10;
            }
            
            // If tooltip goes below viewport, position above
            if (top + tooltipRect.height > viewportHeight - 10) {
                top = rect.top - tooltipRect.height - 5;
            }
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        
        // Store reference for cleanup
        this.currentTooltip = tooltip;
    }
    
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }
    
    showMarketBarTooltip(event, html) {
        // Remove existing tooltip
        this.hideMarketBarTooltip();
        
        // Get mouse position from event
        const mouseX = event.clientX || event.pageX;
        const mouseY = event.clientY || event.pageY;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'market-bar-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.innerHTML = html;
        
        // Initially position off-screen so we can measure it accurately
        tooltip.style.left = '-9999px';
        tooltip.style.top = '-9999px';
        tooltip.style.opacity = '0';
        
        document.body.appendChild(tooltip);
        
        // Use requestAnimationFrame to ensure tooltip is rendered before calculating size
        requestAnimationFrame(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Offset from cursor (10px right, 10px up)
            const offsetX = 10;
            const offsetY = 10;
            
            // Calculate position relative to cursor
            let left = mouseX + offsetX;
            let top = mouseY - offsetY;
            
            // Default: position above and to the right of cursor
            tooltip.style.transform = 'translateY(-100%)';
            
            // Adjust if tooltip would go off screen horizontally
            if (left + tooltipRect.width > viewportWidth - 10) {
                // Not enough room on right, position to the left of cursor
                left = mouseX - tooltipRect.width - offsetX;
                if (left < 10) {
                    left = 10; // Keep at least 10px from left edge
                }
            }
            
            // Adjust if tooltip would go off screen vertically
            if (top - tooltipRect.height < 10) {
                // Not enough room above, position below cursor
                top = mouseY + offsetY;
                tooltip.style.transform = 'translateY(0)';
            } else {
                // Position above cursor
                tooltip.style.transform = 'translateY(-100%)';
            }
            
            // Final check: ensure tooltip doesn't go below viewport
            if (top + tooltipRect.height > viewportHeight - 10) {
                top = viewportHeight - tooltipRect.height - 10;
                tooltip.style.transform = 'translateY(0)';
            }
            
            // Final check: ensure tooltip doesn't go above viewport
            if (top < 10) {
                top = 10;
            }
            
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
            tooltip.style.opacity = '1';
        });
        
        // Store reference for cleanup
        this.currentMarketBarTooltip = tooltip;
    }
    
    hideMarketBarTooltip() {
        if (this.currentMarketBarTooltip) {
            this.currentMarketBarTooltip.remove();
            this.currentMarketBarTooltip = null;
        }
    }
    
    attachPurchaseListeners(state) {
        const purchaseButtons = this.container.querySelectorAll('.market-purchase-btn:not(.disabled)');
        purchaseButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const marketId = button.dataset.market;
                this.handlePurchase(marketId);
            });
        });
    }
    
    handlePurchase(marketId) {
        // Execute purchase action via game engine
        if (window.gameControls) {
            const action = {
                type: 'buyResource',
                resourceType: marketId
            };
            window.gameControls.handleAction(action);
        } else {
            console.error('MarketsPanel: gameControls not available for purchase action');
        }
    }
    
    update(state) {
        this.render();
    }
}
