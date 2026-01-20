/**
 * VictoryTracks - Component for rendering all three victory tracks
 * Displays three vertical thermometer-style bars with player markers positioned on each track
 */

export class VictoryTracks {
    constructor(container, gameEngine) {
        if (!container) {
            throw new Error('Container is required');
        }
        
        if (!gameEngine) {
            throw new Error('GameEngine is required');
        }
        
        this.container = container;
        this.gameEngine = gameEngine;
        this.playerColors = ['#C41E3A', '#1E3A8A', '#228B22', '#6A0DAD'];
        this.trackColors = {
            empire: '#8B0000',
            population: '#1E3A8A',
            church: '#DAA520'
        };
        
        // Don't render immediately - wait for update() to be called with state
        // Initial render will show loading state
        this.container.innerHTML = '<div style="padding: 16px; color: #666; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Loading victory tracks...</div>';
    }
    
    render(state = null) {
        if (!this.container) {
            console.warn('VictoryTracks.render(): Container not found');
            return;
        }
        
        // Use provided state or get from game engine
        const gameState = state || this.gameEngine.getState();
        if (!gameState) {
            console.warn('VictoryTracks.render(): No game state available');
            this.container.innerHTML = '<div style="padding: 16px; color: red; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Error: No game state</div>';
            return;
        }
        
        if (!gameState.players || !Array.isArray(gameState.players) || gameState.players.length === 0) {
            console.warn('VictoryTracks.render(): No players in state');
            this.container.innerHTML = '<div style="padding: 16px; color: #666; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">No players</div>';
            return;
        }
        
        const tracks = ['empire', 'population', 'church'];
        const trackNames = {
            empire: 'Empire',
            population: 'Population',
            church: 'Church'
        };
        
        try {
            const tracksHtml = tracks.map(trackId => {
                try {
                    return this.renderTrack(trackId, trackNames[trackId], gameState);
                } catch (trackError) {
                    console.error(`Error rendering track ${trackId}:`, trackError);
                    return `<div style="padding: 8px; color: red; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Error rendering ${trackId}</div>`;
                }
            }).join('');
            
            const html = `
                <div class="victory-tracks-container">
                    ${tracksHtml}
                </div>
            `;
            
            this.container.innerHTML = html;
            
            // Attach tooltip listeners after rendering
            this.attachTrackTooltips(gameState);
        } catch (error) {
            console.error('Error rendering victory tracks:', error);
            if (this.container) {
                this.container.innerHTML = `<div style="padding: 16px; color: red; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Error: ${error.message}</div>`;
            }
        }
    }
    
    renderTrack(trackId, trackName, state) {
        const trackColor = this.trackColors[trackId];
        const min = -10;
        const max = 15;
        const range = max - min;
        
        // Map track IDs to icon filenames
        const trackIcons = {
            'empire': 'Empire_icon.png',
            'population': 'population_icon.png',
            'church': 'clergy_icon.png' // Note: clergy_icon.png is for Church track
        };
        // Use absolute path from project root to avoid relative path issues
        const iconPath = `refrence material/visual refrences/${trackIcons[trackId]}`;
        
        // Check if track is blocked - ensure blockedTracks is an array
        const blockedTracks = Array.isArray(state.blockedTracks) ? state.blockedTracks : [];
        const isBlocked = blockedTracks.includes(trackId);
        
        // Ensure players array exists
        const players = Array.isArray(state.players) ? state.players : [];
        
        // Escape HTML for safety
        const escapedTrackName = this.escapeHtml(trackName);
        
        // Calculate positions for all players
        // Group markers by similar positions (within 2% of each other) for stacking
        const markerGroups = {};
        const playerMarkers = players.map((player, index) => {
            const value = player.victoryTracks?.[trackId] ?? 0;
            const percentage = ((value - min) / range) * 100;
            const clampedPercentage = Math.max(0, Math.min(100, percentage));
            const playerColor = this.playerColors[index] || '#666';
            const playerName = this.escapeHtml(player.name || `Player ${index + 1}`);
            
            // Group markers at similar positions (round to nearest 2% for grouping)
            const groupKey = Math.round(clampedPercentage / 2) * 2;
            if (!markerGroups[groupKey]) {
                markerGroups[groupKey] = [];
            }
            
            return {
                percentage: clampedPercentage,
                color: playerColor,
                name: playerName,
                value: value,
                id: player.id || index,
                index: index,
                groupKey: groupKey
            };
        });
        
        // Add markers to groups after creating them
        playerMarkers.forEach(marker => {
            markerGroups[marker.groupKey].push(marker.index);
        });
        
        // Calculate horizontal offset for overlapping markers
        playerMarkers.forEach(marker => {
            const group = markerGroups[marker.groupKey];
            const positionInGroup = group.indexOf(marker.index);
            const totalInGroup = group.length;
            
            // Offset markers horizontally when they overlap (spread them out slightly)
            if (totalInGroup > 1) {
                // Spread markers across a larger horizontal range (about 14px total)
                const spread = 14;
                const offset = (positionInGroup - (totalInGroup - 1) / 2) * (spread / (totalInGroup - 1 || 1));
                marker.horizontalOffset = offset;
            } else {
                marker.horizontalOffset = 0;
            }
        });
        
        return `
            <div class="track-container">
                <div class="track-header">
                    <img src="${iconPath}" alt="${escapedTrackName}" class="track-icon" onerror="this.style.display='none'; this.onerror=null;" />
                </div>
                <div class="track-bar-wrapper">
                    <div class="track-scale-max">${max}</div>
                    <div class="track-bar" 
                         data-track-id="${trackId}"
                         data-track-name="${escapedTrackName}">
                        ${playerMarkers.map((marker, idx) => {
                            // Calculate bottom position - 0% means bottom of bar (min value), 100% means top (max value)
                            // Clamp to ensure marker stays within bounds
                            const bottomPercent = Math.max(0, Math.min(100, marker.percentage));
                            const horizontalOffset = marker.horizontalOffset || 0;
                            return `
                            <div class="track-marker" 
                                 style="bottom: ${bottomPercent}%; 
                                        left: calc(50% + ${horizontalOffset}px);
                                        background-color: ${marker.color} !important;"
                                 data-player-id="${marker.id}"
                                 data-track="${trackId}"
                                 data-player-name="${marker.name}"
                                 data-player-value="${marker.value}"
                                 title="${marker.name}: ${marker.value}">
                            </div>
                        `;
                        }).join('')}
                    </div>
                    <div class="track-scale-min">${min}</div>
                </div>
                <div class="track-footer">
                </div>
            </div>
        `;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
            : '139, 0, 0';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    attachTrackTooltips(state) {
        const trackBars = this.container.querySelectorAll('.track-bar');
        trackBars.forEach(bar => {
            const trackId = bar.dataset.trackId;
            const trackName = bar.dataset.trackName || trackId;
            
            // Get all players and their positions on this track
            const players = Array.isArray(state.players) ? state.players : [];
            const playerPositions = players.map((player, index) => {
                const value = player.victoryTracks?.[trackId] ?? 0;
                const playerColor = this.playerColors[index] || '#666';
                const playerName = this.escapeHtml(player.name || `Player ${index + 1}`);
                return {
                    name: playerName,
                    value: value,
                    color: playerColor
                };
            });
            
            // Sort by value (highest first)
            playerPositions.sort((a, b) => b.value - a.value);
            
            const mouseMoveHandler = (e) => {
                const tooltipHtml = `
                    <div style="font-weight: 700; margin-bottom: 8px; font-size: 1.1em;">${trackName}</div>
                    ${playerPositions.map(pos => `
                        <div style="margin-bottom: 4px;">
                            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${pos.color}; margin-right: 6px; vertical-align: middle;"></span>
                            <strong>${pos.name}</strong>: ${pos.value}
                        </div>
                    `).join('')}
                `;
                this.showTrackTooltip(e, tooltipHtml);
            };
            
            bar.addEventListener('mouseenter', mouseMoveHandler);
            bar.addEventListener('mousemove', mouseMoveHandler);
            
            bar.addEventListener('mouseleave', () => {
                this.hideTrackTooltip();
            });
        });
    }
    
    showTrackTooltip(event, html) {
        // Remove existing tooltip
        this.hideTrackTooltip();
        
        // Get mouse position from event
        const mouseX = event.clientX || event.pageX;
        const mouseY = event.clientY || event.pageY;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'track-bar-tooltip';
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
        this.currentTrackTooltip = tooltip;
    }
    
    hideTrackTooltip() {
        if (this.currentTrackTooltip) {
            this.currentTrackTooltip.remove();
            this.currentTrackTooltip = null;
        }
    }
    
    update(state) {
        // Pass the state to render so it uses the provided state
        this.render(state);
    }
}
