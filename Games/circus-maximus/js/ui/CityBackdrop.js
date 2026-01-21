/**
 * CityBackdrop - Component for rendering city backdrop and location spots
 * Handles location clicks, hovers, and worker token placement
 */

import { LocationTooltip } from './LocationTooltip.js';

export class CityBackdrop {
    constructor(container, gameEngine) {
        this.container = container;
        this.gameEngine = gameEngine;
        this.selectedLocationId = null;
        this.locationSpots = {};
        this.workerTokens = {};
        this.onLocationSelect = null;
        this.render();
    }
    
        render() {
        const state = this.gameEngine?.getState();
        if (!state) {
            console.error('CityBackdrop.render(): No game state available');
            this.container.innerHTML = '<div style="padding: 16px; color: red; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Error: No game state</div>';
            return;
        }
        
        const board = state.board || {};
        const locations = Array.isArray(board.spaces) ? board.spaces : [];
        
        // Set backdrop image - use game_board_reference.jpeg from visual references
        // Use absolute path from project root to avoid relative path issues
        this.container.style.backgroundImage = "url('refrence material/visual refrences/game_board_reffrence.jpeg')";
        this.container.style.backgroundSize = "cover";
        this.container.style.backgroundPosition = "center";
        this.container.style.backgroundRepeat = "no-repeat";
        // Add fallback background color in case image doesn't load
        this.container.style.backgroundColor = "#8B7355";
        
        try {
            // Clear existing location spots
            this.container.innerHTML = '';
            this.locationSpots = {};
            
            // Create location spots - filter out disabled locations (Gamblers Den, Oracle in MVP)
            locations.forEach(location => {
                if (location && location.id) {
                    // Skip disabled locations (not visible in MVP)
                    if (location.disabled === true) {
                        return;
                    }
                    const spot = this.createLocationSpot(location, state);
                    this.container.appendChild(spot);
                    this.locationSpots[location.id] = spot;
                }
            });
            
            // Render worker tokens
            this.updateWorkerTokens(state);
        } catch (error) {
            console.error('Error rendering city backdrop:', error);
            this.container.innerHTML = `<div style="padding: 16px; color: red; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Error: ${error.message}</div>`;
        }
    }
    
    createLocationSpot(location, state) {
        const spot = document.createElement('div');
        spot.className = 'location-spot';
        spot.dataset.locationId = location.id;
        
        // Check if disabled - ensure disabledLocations is an array
        const disabledLocations = Array.isArray(state.disabledLocations) ? state.disabledLocations : [];
        const isDisabled = disabledLocations.includes(location.id);
        if (isDisabled) {
            spot.classList.add('disabled');
        }
        
        // Check if player has worker here
        const workerPlacements = state.board?.workerPlacements?.[location.id] || {};
        const hasWorker = Object.keys(workerPlacements).length > 0;
        if (hasWorker) {
            spot.classList.add('has-worker');
        }
        
        // Position (percentages based on game_board_reference.jpeg)
        const position = this.getLocationPosition(location.id);
        spot.style.left = `${position.x}%`;
        spot.style.top = `${position.y}%`;
        
        // Location name - escape HTML for safety
        const locationName = this.escapeHtml(location?.name || location?.id || 'Unknown');
        spot.innerHTML = `<div class="location-name">${locationName}</div>`;
        
        // Event listeners
        spot.addEventListener('click', () => this.handleLocationClick(location.id));
        spot.addEventListener('mouseenter', (e) => this.showLocationTooltip(e, location, state));
        spot.addEventListener('mouseleave', () => this.hideLocationTooltip());
        
        return spot;
    }
    
    getLocationPosition(locationId) {
        // Define positions for each location on the backdrop
        // These are percentages from top-left, based on game_board_reference.jpeg
        const positions = {
            // Coastal/Port Area (Right side of image)
            'port': { x: 75, y: 25 }, // Right coastal area, near lighthouse
            
            // Military/Upper Right
            'war': { x: 85, y: 30 }, // Upper right, military structures area
            
            // Natural Areas (Left)
            'forest': { x: 10, y: 50 }, // Far left, dense forest area
            
            // Grand Buildings (Upper Areas)
            'palace': { x: 23, y: 12 }, // Upper left, grand temple structure
            'pantheon': { x: 52, y: 25 }, // Behind amphitheater, upper center temple
            'oracle': { x: 32, y: 22 }, // Upper mid, temple structure
            
            // Public/Civic Areas
            'townSquare': { x: 25, y: 55 }, // Near market area, central lower
            'guildhall': { x: 40, y: 42 }, // Mid-center, public building
            
            // Residential Areas (Mid-City)
            'prison': { x: 85, y: 85 }, // Mid-left, residential area
            'gamblersDen': { x: 38, y: 85 }, // Mid-right, residential area
            
            // Market Area (Bottom-Left, near forest)
            'mummersMarket': { x: 12, y: 85 }, // Left side of market area
            'animalsMarket': { x: 18, y: 80 }, // Center of market area
            'slavesMarket': { x: 24, y: 75 }  // Right side of market area
        };
        return positions[locationId] || { x: 50, y: 50 };
    }
    
    updateWorkerTokens(state) {
        const board = state.board;
        const workerPlacements = board?.workerPlacements || {};
        const playerColors = ['#C41E3A', '#1E3A8A', '#228B22', '#6A0DAD'];
        
        // Remove existing tokens
        Object.values(this.workerTokens).forEach(token => {
            if (token && token.parentNode) {
                token.parentNode.removeChild(token);
            }
        });
        this.workerTokens = {};
        
        // Create tokens for each worker placement
        Object.entries(workerPlacements).forEach(([locationId, players]) => {
            Object.entries(players).forEach(([playerId, count]) => {
                const player = state.players.find(p => p.id === parseInt(playerId));
                const playerIndex = state.players.findIndex(p => p.id === parseInt(playerId));
                const color = playerColors[playerIndex] || '#666';
                
                for (let i = 0; i < count; i++) {
                    const token = this.createWorkerToken(locationId, color, i, count);
                    this.container.appendChild(token);
                    const tokenId = `${locationId}-${playerId}-${i}`;
                    this.workerTokens[tokenId] = token;
                }
            });
        });
    }
    
    createWorkerToken(locationId, color, index, totalCount) {
        const token = document.createElement('div');
        token.className = 'worker-token';
        token.style.background = color;
        token.classList.add('placing');
        
        // Position token on location spot using percentage positioning
        const spot = this.locationSpots[locationId];
        if (spot) {
            // Get position from spot (which uses percentage)
            const position = this.getLocationPosition(locationId);
            
            // Stagger tokens in a circle pattern (using percentage offsets)
            const angle = (index / totalCount) * Math.PI * 2;
            const radius = 2; // Percentage offset
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;
            
            // Position relative to location spot center
            token.style.left = `${position.x + offsetX}%`;
            token.style.top = `${position.y + offsetY}%`;
        } else {
            // Fallback positioning if spot not found
            const position = this.getLocationPosition(locationId);
            token.style.left = `${position.x}%`;
            token.style.top = `${position.y}%`;
        }
        
        return token;
    }
    
    handleLocationClick(locationId) {
        this.selectedLocationId = locationId;
        // Highlight selected location
        Object.values(this.locationSpots).forEach(spot => {
            spot.classList.remove('selected');
        });
        if (this.locationSpots[locationId]) {
            this.locationSpots[locationId].classList.add('selected');
        }
        
        // Trigger location selection event
        if (this.onLocationSelect) {
            this.onLocationSelect(locationId);
        }
    }
    
    showLocationTooltip(event, location, state) {
        new LocationTooltip(event, location, state, this.gameEngine);
    }
    
    hideLocationTooltip() {
        LocationTooltip.hide();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    update(state) {
        this.render();
    }
}
