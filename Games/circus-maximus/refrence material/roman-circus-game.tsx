import React, { useState, useEffect } from 'react';
import { Coins, Users, Crown, Church } from 'lucide-react';

const RomanCircusGame = () => {
  const actCardsData = {
    act1: [
      { id: 'musicians', name: 'Musicians', cost: '2 Mummers', victory: 'All: +1 Clergy, +2 coins', defeat: 'N/A', noEntry: '-1 Clergy' },
      { id: 'animalshow', name: 'Animal Show', cost: '1+ Animals', victory: 'Most: +1 Clergy, +1 Citizen, +4 coins', defeat: '+2 coins', noEntry: '-1 Clergy, -1 Citizen' },
      { id: 'manvsbeast', name: 'Man vs Beast', cost: '1 Slave + 1 Animal', victory: 'All: +2 Citizen, +3 coins', defeat: 'N/A', noEntry: '-2 Citizen' }
    ],
    act2: [
      { id: 'chariot', name: 'Chariot Race', cost: '1 Animal + 1 Mummer', victory: '1st: +2 Empire, +6c | 2nd: +1 Empire, +3c', defeat: 'Resources lost, +2c', noEntry: '-1 Empire' },
      { id: 'gladiator', name: 'Gladiator Duel', cost: '1 Slave', victory: 'Winner: +2 Citizen, +5 coins', defeat: 'Slave lost, +3c', noEntry: '-1 Citizen' },
      { id: 'battle', name: 'Grand Battle', cost: '2 Slaves', victory: 'Winner: +2 Empire, +7 coins', defeat: 'Slaves lost, +4c', noEntry: '-2 Empire' }
    ],
    act3: [
      { id: 'torture', name: 'Public Torture', cost: 'X Prisoners', victory: '+1 Citizen per prisoner', defeat: 'N/A', noEntry: 'Optional' },
      { id: 'crucifixion', name: 'Crucifixion', cost: 'X Prisoners', victory: '+1 Clergy per prisoner', defeat: 'N/A', noEntry: 'Optional' },
      { id: 'execution', name: 'Execution by Beast', cost: 'X Prisoners + 1 Animal', victory: '+1 Empire per prisoner', defeat: 'N/A', noEntry: 'Optional' }
    ]
  };

  const [gameState, setGameState] = useState({
    phase: -1,
    round: 1,
    currentPlayer: 1,
    numPlayers: 1,
    numAI: 1,
    selectedActs: { act1: null, act2: null, act3: null },
    performedActs: { act1: false, act2: false, act3: false },
    players: [],
    biddingState: { currentAct: 'act1', selectedCard: 0, act1Bids: {}, act2Bids: {}, act3Bids: {} },
    market: { slaves: [1,1,2,2,3,3,4,4,5,5], animals: [1,1,2,2,3,3,4,4,5,5], mummers: [1,1,2,2,3,3,4,4,5,5] },
    supply: { slaves: 10, animals: 10, mummers: 10, prisoners: 10 },
    marketPhase: { currentMarket: 'slaves', currentPlayerIndex: 0, queue: { slaves: [], animals: [], mummers: [] }, passedPlayers: [] },
    eventCard: null,
    winner: null,
    message: "Welcome! Configure game settings."
  });

  const eventCards = [
    { name: "CAESAR LEAVES FOR WAR", effect: "Empire track frozen" },
    { name: "ROME IS RAIDED", effect: "Remove 1 resource each market" },
    { name: "PIRATES GROW BRAVE", effect: "Pay 5 coins each" },
    { name: "NEW LANDS DISCOVERED", effect: "Add 3 animals" },
    { name: "THE PLAGUE STRIKES", effect: "Citizen track frozen" }
  ];

  const workerLocationInfo = {
    'Prison': { description: '+1 prisoner', canRepeat: true },
    'Port': { description: 'Flip: +2 mummers OR die', canRepeat: false },
    'War': { description: 'Flip: +2 slaves OR die', canRepeat: false },
    'Forest': { description: 'Flip: +2 animals OR die', canRepeat: false },
    'Town Square': { description: '+1 Citizen (temp)', canRepeat: false },
    'Palace': { description: '+1 Empire (temp)', canRepeat: false },
    'Pantheon': { description: '+1 Clergy (temp)', canRepeat: false },
    'Guildhall': { description: '5c + 1 slave → worker', canRepeat: false },
    'Oracle': { description: '1 animal → peek event', canRepeat: false },
    'Gamblers Den': { description: 'Bet on Act 2', canRepeat: false },
    'Slave Market': { description: 'Queue for slaves', canRepeat: false },
    'Animal Market': { description: 'Queue for animals', canRepeat: false },
    'Mummer Market': { description: 'Queue for mummers', canRepeat: false }
  };

  const getWorkerLocationStatus = (location, player) => {
    const alreadyPlaced = player.workerPlacements.includes(location);
    const canPlace = location === 'Prison' || !alreadyPlaced;
    return { alreadyPlaced, canPlace };
  };

  const getMarketPrice = (resource) => {
    const market = gameState.market[resource];
    if (market.length === 0) return 99;
    return market[0];
  };

  useEffect(() => {
    if (gameState.phase === 2.5) {
      const timer = setTimeout(() => resolveWorkers(), 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase]);

  useEffect(() => {
    if (gameState.phase === 2.5) {
      const timer = setTimeout(() => resolveWorkers(), 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase]);

  useEffect(() => {
    if (gameState.phase === 4) {
      const timer = setTimeout(() => performAllActs(), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase]);

  // AI Auto-play
  useEffect(() => {
    if (gameState.players.length === 0) return;
    const currentPlayer = gameState.players[gameState.currentPlayer - 1];
    if (!currentPlayer || !currentPlayer.isAI) return;

    const aiDelay = 800; // AI thinks for 800ms

    if (gameState.phase === 1 && !currentPlayer.passedBidding) {
      // AI Bidding logic
      const timer = setTimeout(() => {
        const shouldBid = Math.random() < 0.4 && currentPlayer.coins >= 1; // 40% chance to bid
        if (shouldBid) {
          placeBid();
        } else {
          passBid();
        }
      }, aiDelay);
      return () => clearTimeout(timer);
    } else if (gameState.phase === 2 && !currentPlayer.passedWorkers) {
      // AI Worker placement logic
      const timer = setTimeout(() => {
        const shouldPlace = Math.random() < 0.7 && currentPlayer.availableWorkers > 0 && currentPlayer.coins >= 1; // 70% chance to place
        if (shouldPlace) {
          const locations = ['Prison', 'Port', 'War', 'Forest', 'Town Square', 'Palace', 'Pantheon', 'Guildhall', 'Oracle', 'Gamblers Den', 'Slave Market', 'Animal Market', 'Mummer Market'];
          const validLocations = locations.filter(loc => {
            if (loc !== 'Prison' && currentPlayer.workerPlacements.includes(loc)) return false;
            if (loc === 'Guildhall' && (currentPlayer.resources.slaves < 1 || currentPlayer.coins < 6)) return false;
            if (loc === 'Oracle' && currentPlayer.resources.animals < 1) return false;
            return true;
          });
          if (validLocations.length > 0) {
            // Prefer markets slightly (50% chance to pick market if available)
            const markets = validLocations.filter(l => l.includes('Market'));
            const shouldPickMarket = markets.length > 0 && Math.random() < 0.5;
            const chosen = shouldPickMarket ? markets[Math.floor(Math.random() * markets.length)] : validLocations[Math.floor(Math.random() * validLocations.length)];
            placeWorker(chosen);
          } else {
            passWorker();
          }
        } else {
          passWorker();
        }
      }, aiDelay);
      return () => clearTimeout(timer);
    } else if (gameState.phase === 3) {
      // AI Market buying logic
      const timer = setTimeout(() => {
        const resource = gameState.marketPhase.currentMarket;
        const queue = gameState.marketPhase.queue[resource];
        if (queue.includes(currentPlayer.id)) {
          const market = gameState.market[resource];
          const canAfford = market.length > 0 && currentPlayer.coins >= market[0];
          const shouldBuy = canAfford && Math.random() < 0.6; // 60% chance to buy if can afford
          if (shouldBuy) {
            buyResource();
          } else {
            passMarket();
          }
        } else {
          passMarket();
        }
      }, aiDelay);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.currentPlayer, gameState.players]);

  const setPlayerCount = (humanCount, aiCount) => {
    const totalPlayers = humanCount + aiCount;
    if (totalPlayers < 2 || totalPlayers > 4) {
      setGameState(prev => ({ ...prev, message: "Total players must be 2-4!" }));
      return;
    }

    const colors = ['red', 'blue', 'yellow', 'green'];
    const workerCounts = { 2: 7, 3: 6, 4: 5 };
    const players = [];
    const bids = {};
    
    for (let i = 1; i <= totalPlayers; i++) {
      const isAI = i > humanCount;
      players.push({
        id: i,
        name: isAI ? `AI ${i - humanCount}` : `Player ${i}`,
        color: colors[i - 1],
        isAI: isAI,
        coins: 50,
        workers: workerCounts[totalPlayers],
        availableWorkers: workerCounts[totalPlayers],
        resources: { slaves: 0, animals: 0, mummers: 0, prisoners: 0 },
        tracks: { citizen: 2, empire: 2, clergy: 2 },
        wonActs: { act1: null, act2: null, act3: null },
        workerPlacements: [],
        passedBidding: false,
        passedWorkers: false
      });
      bids[i] = 0;
    }
    
    setGameState(prev => ({
      ...prev,
      numPlayers: humanCount,
      numAI: aiCount,
      players: players,
      biddingState: { currentAct: 'act1', selectedCard: 0, act1Bids: {...bids}, act2Bids: {...bids}, act3Bids: {...bids} },
      phase: 0,
      message: `${humanCount} human + ${aiCount} AI ready! Click Start Game.`
    }));
  };

  const startGame = () => {
    if (gameState.players.length === 0) {
      setGameState(prev => ({ ...prev, message: "Select number of players first!" }));
      return;
    }
    const event = eventCards[Math.floor(Math.random() * eventCards.length)];
    setGameState(prev => ({
      ...prev, phase: 1, eventCard: event, currentPlayer: 1,
      players: prev.players.map(p => ({ ...p, passedBidding: false, passedWorkers: false })),
      message: `Event: ${event.name}. Player 1: Select card or pass.`
    }));
  };

  const checkForWinner = (players) => {
    for (const player of players) {
      if (player.tracks.citizen >= 10 || player.tracks.empire >= 10 || player.tracks.clergy >= 10) {
        return player;
      }
    }
    return null;
  };

  const restartGame = () => {
    setGameState({
      phase: -1, round: 1, currentPlayer: 1, numPlayers: 1, numAI: 1,
      selectedActs: { act1: null, act2: null, act3: null },
      performedActs: { act1: false, act2: false, act3: false },
      players: [], biddingState: { currentAct: 'act1', selectedCard: 0, act1Bids: {}, act2Bids: {}, act3Bids: {} },
      market: { slaves: [1,1,2,2,3,3,4,4,5,5], animals: [1,1,2,2,3,3,4,4,5,5], mummers: [1,1,2,2,3,3,4,4,5,5] },
      supply: { slaves: 10, animals: 10, mummers: 10, prisoners: 10 },
      marketPhase: { currentMarket: 'slaves', currentPlayerIndex: 0, queue: { slaves: [], animals: [], mummers: [] }, passedPlayers: [] },
      eventCard: null, winner: null, message: "Welcome! Configure settings."
    });
  };

  const selectCard = (cardIndex) => {
    setGameState(prev => ({
      ...prev,
      biddingState: { ...prev.biddingState, selectedCard: cardIndex },
      message: `${actCardsData[prev.biddingState.currentAct][cardIndex].name} selected. Bid or pass.`
    }));
  };

  const placeBid = () => {
    const player = gameState.players[gameState.currentPlayer - 1];
    if (player.passedBidding || player.coins < 1) {
      setGameState(prev => ({ ...prev, message: "Cannot bid!" }));
      return;
    }

    const actKey = gameState.biddingState.currentAct;
    const cardIndex = gameState.biddingState.selectedCard;

    setGameState(prev => {
      const newPlayers = [...prev.players];
      newPlayers[prev.currentPlayer - 1].coins -= 1;
      const newBids = { ...prev.biddingState[`${actKey}Bids`] };
      newBids[prev.currentPlayer] = (newBids[prev.currentPlayer] || 0) + 1;
      let nextPlayer = prev.currentPlayer === 1 ? 2 : ((prev.currentPlayer % prev.numPlayers) + 1);
      while (newPlayers[nextPlayer - 1].passedBidding && !newPlayers.every(p => p.passedBidding)) {
        nextPlayer = nextPlayer === 1 ? 2 : ((nextPlayer % prev.numPlayers) + 1);
      }
      return {
        ...prev, players: newPlayers,
        biddingState: { ...prev.biddingState, [`${actKey}Bids`]: newBids },
        currentPlayer: nextPlayer,
        message: `Player ${prev.currentPlayer} bid. Player ${nextPlayer}'s turn.`
      };
    });
  };

  const passBid = () => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      newPlayers[prev.currentPlayer - 1].passedBidding = true;
      const allPassed = newPlayers.every(p => p.passedBidding);

      if (allPassed) {
        const actKey = prev.biddingState.currentAct;
        const cardIndex = prev.biddingState.selectedCard;
        const bids = prev.biddingState[`${actKey}Bids`];
        const maxBid = Math.max(...Object.values(bids));
        const winner = Object.keys(bids).find(id => bids[id] === maxBid) || null;
        const wonCard = actCardsData[actKey][cardIndex];
        const newSelectedActs = { ...prev.selectedActs };
        newSelectedActs[actKey] = wonCard;
        if (winner) newPlayers[parseInt(winner) - 1].wonActs[actKey] = wonCard;

        if (actKey === 'act1') {
          newPlayers.forEach(p => p.passedBidding = false);
          return {
            ...prev, players: newPlayers, selectedActs: newSelectedActs,
            biddingState: { ...prev.biddingState, currentAct: 'act2', selectedCard: 0 },
            currentPlayer: 1, message: `Act 1 done! ${winner ? `P${winner} wins!` : 'Tie!'} Bidding Act 2.`
          };
        } else if (actKey === 'act2') {
          newPlayers.forEach(p => p.passedBidding = false);
          return {
            ...prev, players: newPlayers, selectedActs: newSelectedActs,
            biddingState: { ...prev.biddingState, currentAct: 'act3', selectedCard: 0 },
            currentPlayer: 1, message: `Act 2 done! ${winner ? `P${winner} wins!` : 'Tie!'} Bidding Act 3.`
          };
        } else {
          newPlayers.forEach(p => p.passedBidding = false);
          return {
            ...prev, players: newPlayers, selectedActs: newSelectedActs,
            phase: 2, currentPlayer: 1,
            message: `Bidding done! ${winner ? `P${winner} wins!` : 'Tie!'} Deploy workers.`
          };
        }
      }

      let nextPlayer = (prev.currentPlayer % prev.numPlayers) + 1;
      while (newPlayers[nextPlayer - 1].passedBidding && !allPassed) {
        nextPlayer = (nextPlayer % prev.numPlayers) + 1;
      }
      return { ...prev, players: newPlayers, currentPlayer: nextPlayer, message: `P${prev.currentPlayer} passed. P${nextPlayer}'s turn.` };
    });
  };

  const placeWorker = (location) => {
    const player = gameState.players[gameState.currentPlayer - 1];
    if (player.passedWorkers) return;
    if (location !== 'Prison' && player.workerPlacements.includes(location)) {
      setGameState(prev => ({ ...prev, message: "Already placed here!" }));
      return;
    }
    const cost = player.tracks.citizen > 5 || player.tracks.empire > 5 || player.tracks.clergy > 5 ? 2 : 1;
    if (player.availableWorkers < 1 || player.coins < cost) {
      setGameState(prev => ({ ...prev, message: "Cannot place worker!" }));
      return;
    }
    if (location === 'Guildhall' && (player.resources.slaves < 1 || player.coins < cost + 5 || player.workers >= 11)) {
      setGameState(prev => ({ ...prev, message: "Cannot use Guildhall!" }));
      return;
    }
    if (location === 'Oracle' && player.resources.animals < 1) {
      setGameState(prev => ({ ...prev, message: "Need 1 animal for Oracle!" }));
      return;
    }

    setGameState(prev => {
      const newPlayers = [...prev.players];
      const p = newPlayers[prev.currentPlayer - 1];
      p.coins -= cost;
      p.availableWorkers -= 1;
      p.workerPlacements.push(location);
      let msg = `P${prev.currentPlayer} placed at ${location}. `;
      const newMarketPhase = { ...prev.marketPhase };
      if (location === 'Slave Market') {
        newMarketPhase.queue.slaves.push(prev.currentPlayer);
        msg += `Slave queue pos ${newMarketPhase.queue.slaves.length}. `;
      } else if (location === 'Animal Market') {
        newMarketPhase.queue.animals.push(prev.currentPlayer);
        msg += `Animal queue pos ${newMarketPhase.queue.animals.length}. `;
      } else if (location === 'Mummer Market') {
        newMarketPhase.queue.mummers.push(prev.currentPlayer);
        msg += `Mummer queue pos ${newMarketPhase.queue.mummers.length}. `;
      }
      let nextPlayer = (prev.currentPlayer % prev.numPlayers) + 1;
      while (newPlayers[nextPlayer - 1].passedWorkers && !newPlayers.every(p => p.passedWorkers)) {
        nextPlayer = (nextPlayer % prev.numPlayers) + 1;
      }
      return { ...prev, players: newPlayers, marketPhase: newMarketPhase, currentPlayer: nextPlayer, message: msg + `P${nextPlayer}'s turn.` };
    });
  };

  const passWorker = () => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      newPlayers[prev.currentPlayer - 1].passedWorkers = true;
      const allPassed = newPlayers.every(p => p.passedWorkers);
      if (allPassed) {
        return { ...prev, players: newPlayers, phase: 2.5, message: "All workers placed! Resolving..." };
      }
      let nextPlayer = (prev.currentPlayer % prev.numPlayers) + 1;
      while (newPlayers[nextPlayer - 1].passedWorkers && !allPassed) {
        nextPlayer = (nextPlayer % prev.numPlayers) + 1;
      }
      return { ...prev, players: newPlayers, currentPlayer: nextPlayer, message: `P${prev.currentPlayer} passed. P${nextPlayer}'s turn.` };
    });
  };

  const resolveWorkers = () => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const newSupply = { ...prev.supply };
      let logs = [];
      newPlayers.forEach(p => {
        p.workerPlacements.forEach(location => {
          if (location === 'Prison') {
            const gained = Math.min(1, newSupply.prisoners);
            if (gained > 0) {
              p.resources.prisoners += gained;
              newSupply.prisoners -= gained;
              logs.push(`${p.name} +${gained} prisoner`);
            }
            p.availableWorkers += 1;
          } else if (location === 'Port') {
            const flip = Math.random() > 0.5;
            if (flip) {
              const gained = Math.min(2, newSupply.mummers);
              p.resources.mummers += gained;
              newSupply.mummers -= gained;
              logs.push(`${p.name} Port success! +${gained} mummers`);
              p.availableWorkers += 1;
            } else {
              p.workers -= 1;
              logs.push(`${p.name} Port failed! Worker died`);
            }
          } else if (location === 'War') {
            const flip = Math.random() > 0.5;
            if (flip) {
              const gained = Math.min(2, newSupply.slaves);
              p.resources.slaves += gained;
              newSupply.slaves -= gained;
              logs.push(`${p.name} War victory! +${gained} slaves`);
              p.availableWorkers += 1;
            } else {
              p.workers -= 1;
              logs.push(`${p.name} died in battle!`);
            }
          } else if (location === 'Forest') {
            const flip = Math.random() > 0.5;
            if (flip) {
              const gained = Math.min(2, newSupply.animals);
              p.resources.animals += gained;
              newSupply.animals -= gained;
              logs.push(`${p.name} Forest success! +${gained} animals`);
              p.availableWorkers += 1;
            } else {
              p.workers -= 1;
              logs.push(`${p.name} lost in Forest!`);
            }
          } else if (location === 'Town Square') {
            p.tracks.citizen += 1;
            logs.push(`${p.name} +1 Citizen`);
            p.availableWorkers += 1;
          } else if (location === 'Palace') {
            p.tracks.empire += 1;
            logs.push(`${p.name} +1 Empire`);
            p.availableWorkers += 1;
          } else if (location === 'Pantheon') {
            p.tracks.clergy += 1;
            logs.push(`${p.name} +1 Clergy`);
            p.availableWorkers += 1;
          } else if (location === 'Guildhall') {
            p.resources.slaves -= 1;
            newSupply.slaves += 1;
            p.coins -= 5;
            p.workers += 1;
            p.availableWorkers += 2;
            logs.push(`${p.name} freed slave, gained worker!`);
          } else if (location === 'Oracle') {
            p.resources.animals -= 1;
            newSupply.animals += 1;
            logs.push(`${p.name} consulted Oracle`);
            p.availableWorkers += 1;
          } else if (location === 'Gamblers Den') {
            logs.push(`${p.name} ready to gamble!`);
            p.availableWorkers += 1;
          } else if (location.includes('Market')) {
            p.availableWorkers += 1;
          }
        });
      });
      const firstMarket = prev.marketPhase.queue.slaves.length > 0 ? 'slaves' : 
                          prev.marketPhase.queue.animals.length > 0 ? 'animals' :
                          prev.marketPhase.queue.mummers.length > 0 ? 'mummers' : null;
      if (!firstMarket) {
        return { ...prev, players: newPlayers, supply: newSupply, phase: 4, message: `Resolved! ${logs.join('; ')} No markets.` };
      }
      const firstPlayer = prev.marketPhase.queue[firstMarket][0];
      return {
        ...prev, players: newPlayers, supply: newSupply, phase: 3,
        marketPhase: { ...prev.marketPhase, currentMarket: firstMarket, currentPlayerIndex: 0, passedPlayers: [] },
        currentPlayer: firstPlayer, message: `Resolved! ${logs.join('; ')} ${firstMarket} market now.`
      };
    });
  };

  const buyResource = () => {
    const resource = gameState.marketPhase.currentMarket;
    const player = gameState.players[gameState.currentPlayer - 1];
    const market = gameState.market[resource];
    if (market.length === 0 || player.coins < market[0]) {
      setGameState(prev => ({ ...prev, message: "Cannot buy!" }));
      return;
    }
    setGameState(prev => {
      const newPlayers = [...prev.players];
      newPlayers[prev.currentPlayer - 1].coins -= market[0];
      newPlayers[prev.currentPlayer - 1].resources[resource] += 1;
      const newMarket = { ...prev.market };
      newMarket[resource] = [...newMarket[resource]];
      newMarket[resource].shift();
      return { ...prev, players: newPlayers, market: newMarket, message: `P${prev.currentPlayer} bought ${resource}.` };
    });
  };

  const passMarket = () => {
    setGameState(prev => {
      const currentMarket = prev.marketPhase.currentMarket;
      const queue = prev.marketPhase.queue[currentMarket];
      const newPassedPlayers = [...prev.marketPhase.passedPlayers, prev.currentPlayer];
      const allPassedThisMarket = queue.every(p => newPassedPlayers.includes(p));
      if (allPassedThisMarket) {
        const nextMarket = currentMarket === 'slaves' ? 'animals' : currentMarket === 'animals' ? 'mummers' : null;
        if (nextMarket && prev.marketPhase.queue[nextMarket].length > 0) {
          const firstPlayer = prev.marketPhase.queue[nextMarket][0];
          return {
            ...prev,
            marketPhase: { ...prev.marketPhase, currentMarket: nextMarket, currentPlayerIndex: 0, passedPlayers: [] },
            currentPlayer: firstPlayer, message: `${currentMarket} done! ${nextMarket} market.`
          };
        } else {
          return { ...prev, phase: 4, message: `Markets done! Show time!` };
        }
      }
      const currentIndex = queue.indexOf(prev.currentPlayer);
      let nextIndex = (currentIndex + 1) % queue.length;
      while (newPassedPlayers.includes(queue[nextIndex]) && !allPassedThisMarket) {
        nextIndex = (nextIndex + 1) % queue.length;
      }
      const nextPlayer = queue[nextIndex];
      return { ...prev, marketPhase: { ...prev.marketPhase, passedPlayers: newPassedPlayers }, currentPlayer: nextPlayer, message: `P${prev.currentPlayer} passed. P${nextPlayer}'s turn.` };
    });
  };

  const performAllActs = () => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      let allMessages = [];
      if (prev.selectedActs.act1) {
        const act = prev.selectedActs.act1;
        allMessages.push(`ACT 1: ${act.name}`);
        newPlayers.forEach(p => {
          let msg = `${p.name}: `;
          if (act.id === 'musicians') {
            if (p.resources.mummers >= 2) {
              p.tracks.clergy += 1;
              p.coins += 2;
              msg += "Done! +1 Clergy, +2c";
            } else {
              p.tracks.clergy -= 1;
              msg += "No entry. -1 Clergy";
            }
          } else if (act.id === 'animalshow') {
            if (p.resources.animals >= 1) {
              const most = Math.max(...newPlayers.map(pl => pl.resources.animals));
              if (p.resources.animals === most) {
                p.tracks.clergy += 1;
                p.tracks.citizen += 1;
                p.coins += 4;
                msg += "Most animals! +1 Clergy, +1 Citizen, +4c";
              } else {
                p.coins += 2;
                msg += "Participated. +2c";
              }
            } else {
              p.tracks.clergy -= 1;
              p.tracks.citizen -= 1;
              msg += "No entry. -1 Clergy, -1 Citizen";
            }
          } else if (act.id === 'manvsbeast') {
            if (p.resources.slaves >= 1 && p.resources.animals >= 1) {
              const flip = Math.random() > 0.5;
              if (flip) p.resources.animals -= 1; else p.resources.slaves -= 1;
              p.tracks.citizen += 2;
              p.coins += 3;
              msg += `${flip ? 'Animal' : 'Slave'} died! +2 Citizen, +3c`;
            } else {
              p.tracks.citizen -= 2;
              msg += "No entry. -2 Citizen";
            }
          }
          allMessages.push(msg);
        });
      }
      if (prev.selectedActs.act2) {
        const act = prev.selectedActs.act2;
        allMessages.push(`ACT 2: ${act.name}`);
        if (act.id === 'chariot') {
          const rolls = newPlayers.map(p => {
            if (p.resources.animals >= 1 && p.resources.mummers >= 1) {
              const roll = Math.floor(Math.random() * 6) + 1;
              allMessages.push(`${p.name}: Rolled ${roll}`);
              return { player: p, roll: roll, entered: true };
            } else {
              p.tracks.empire -= 1;
              allMessages.push(`${p.name}: No entry. -1 Empire`);
              return { player: p, roll: 0, entered: false };
            }
          });
          const participants = rolls.filter(r => r.entered);
          if (participants.length > 0) {
            participants.sort((a, b) => b.roll - a.roll);
            const winner = participants[0];
            winner.player.tracks.empire += 2;
            winner.player.coins += 6;
            allMessages.push(`${winner.player.name} 1st! +2 Empire, +6c`);
            if (participants.length > 1) {
              const second = participants[1];
              second.player.tracks.empire += 1;
              second.player.coins += 3;
              allMessages.push(`${second.player.name} 2nd! +1 Empire, +3c`);
              for (let i = 2; i < participants.length; i++) {
                const loser = participants[i];
                loser.player.resources.animals -= 1;
                loser.player.resources.mummers -= 1;
                loser.player.coins += 2;
                allMessages.push(`${loser.player.name} lost. Resources gone, +2c`);
              }
            }
          }
        } else if (act.id === 'gladiator') {
          const rolls = newPlayers.map(p => {
            if (p.resources.slaves >= 1) {
              const roll = Math.floor(Math.random() * 6) + 1;
              allMessages.push(`${p.name}: Rolled ${roll}`);
              return { player: p, roll: roll, entered: true };
            } else {
              p.tracks.citizen -= 1;
              allMessages.push(`${p.name}: No entry. -1 Citizen`);
              return { player: p, roll: 0, entered: false };
            }
          });
          const participants = rolls.filter(r => r.entered);
          if (participants.length > 0) {
            participants.sort((a, b) => b.roll - a.roll);
            const highestRoll = participants[0].roll;
            const winners = participants.filter(p => p.roll === highestRoll);
            winners.forEach(w => {
              w.player.tracks.citizen += 2;
              w.player.coins += 5;
              allMessages.push(`${w.player.name} wins! Slave kept, +2 Citizen, +5c`);
            });
            participants.forEach(p => {
              if (!winners.includes(p)) {
                p.player.resources.slaves -= 1;
                p.player.coins += 3;
                allMessages.push(`${p.player.name} lost. Slave died, +3c`);
              }
            });
          }
        } else if (act.id === 'battle') {
          const rolls = newPlayers.map(p => {
            if (p.resources.slaves >= 2) {
              const roll = Math.floor(Math.random() * 6) + 1;
              allMessages.push(`${p.name}: Rolled ${roll}`);
              return { player: p, roll: roll, entered: true };
            } else {
              p.tracks.empire -= 2;
              allMessages.push(`${p.name}: No entry. -2 Empire`);
              return { player: p, roll: 0, entered: false };
            }
          });
          const participants = rolls.filter(r => r.entered);
          if (participants.length > 0) {
            participants.sort((a, b) => b.roll - a.roll);
            const highestRoll = participants[0].roll;
            const winners = participants.filter(p => p.roll === highestRoll);
            winners.forEach(w => {
              w.player.tracks.empire += 2;
              w.player.coins += 7;
              allMessages.push(`${w.player.name} wins! Slaves kept, +2 Empire, +7c`);
            });
            participants.forEach(p => {
              if (!winners.includes(p)) {
                p.player.resources.slaves -= 2;
                p.player.coins += 4;
                allMessages.push(`${p.player.name} lost. Slaves died, +4c`);
              }
            });
          }
        }
      }
      if (prev.selectedActs.act3) {
        const act = prev.selectedActs.act3;
        allMessages.push(`ACT 3: ${act.name}`);
        newPlayers.forEach(p => {
          let msg = `${p.name}: `;
          if (act.id === 'torture') {
            const prisoners = p.resources.prisoners;
            if (prisoners > 0) {
              p.resources.prisoners = 0;
              p.tracks.citizen += prisoners;
              p.coins += prisoners * 2;
              msg += `Executed ${prisoners}. +${prisoners} Citizen`;
            } else {
              msg += "No prisoners";
            }
          } else if (act.id === 'crucifixion') {
            const prisoners = p.resources.prisoners;
            if (prisoners > 0) {
              p.resources.prisoners = 0;
              p.tracks.clergy += prisoners;
              p.coins += prisoners * 2;
              msg += `Crucified ${prisoners}. +${prisoners} Clergy`;
            } else {
              msg += "No prisoners";
            }
          } else if (act.id === 'execution') {
            const prisoners = p.resources.prisoners;
            if (prisoners > 0 && p.resources.animals >= 1) {
              p.resources.prisoners = 0;
              p.resources.animals -= 1;
              p.tracks.empire += prisoners;
              p.coins += prisoners * 3;
              msg += `Executed ${prisoners}. +${prisoners} Empire`;
            } else {
              msg += "Insufficient";
            }
          }
          allMessages.push(msg);
        });
      }
      return { ...prev, players: newPlayers, performedActs: { act1: true, act2: true, act3: true }, phase: 5, message: allMessages.join(' | ') };
    });
  };

  const endGame = () => {
    setGameState(prev => {
      const newPlayers = prev.players.map(p => {
        const totalResources = Object.values(p.resources).reduce((a, b) => a + b, 0);
        const feedCost = totalResources;
        const payment = p.tracks.citizen + p.tracks.empire + p.tracks.clergy;
        return {
          ...p, coins: p.coins - feedCost + payment, workerPlacements: [],
          passedBidding: false, passedWorkers: false, wonActs: { act1: null, act2: null, act3: null }
        };
      });
      const winner = checkForWinner(newPlayers);
      if (winner) {
        return { ...prev, players: newPlayers, winner: winner, phase: 6, message: `${winner.name} wins!` };
      }
      const restockMarket = (market) => {
        const newMarket = [...market];
        let restocked = 0;
        for (let price = 5; price >= 1 && restocked < 3; price--) {
          const currentAtPrice = newMarket.filter(p => p === price).length;
          const emptySlots = 2 - currentAtPrice;
          for (let i = 0; i < emptySlots && restocked < 3; i++) {
            const insertIndex = newMarket.findIndex(p => p > price);
            if (insertIndex === -1) newMarket.push(price); else newMarket.splice(insertIndex, 0, price);
            restocked++;
          }
        }
        return newMarket;
      };
      const newMarket = {
        slaves: restockMarket(prev.market.slaves),
        animals: restockMarket(prev.market.animals),
        mummers: restockMarket(prev.market.mummers)
      };
      return {
        ...prev, players: newPlayers, market: newMarket,
        selectedActs: { act1: null, act2: null, act3: null },
        performedActs: { act1: false, act2: false, act3: false },
        biddingState: {
          ...prev.biddingState, currentAct: 'act1', selectedCard: 0,
          act1Bids: Object.fromEntries(prev.players.map(p => [p.id, 0])),
          act2Bids: Object.fromEntries(prev.players.map(p => [p.id, 0])),
          act3Bids: Object.fromEntries(prev.players.map(p => [p.id, 0]))
        },
        round: prev.round + 1, phase: 0, message: `Round ${prev.round} done! Start Round ${prev.round + 1}.`
      };
    });
  };

  let player = null;
  if (gameState.players.length > 0 && gameState.currentPlayer >= 1) {
    player = gameState.players[gameState.currentPlayer - 1];
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-amber-900 via-orange-800 to-red-900 overflow-auto pb-8">
      {gameState.phase === -1 && (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="bg-amber-100 border-8 border-amber-900 rounded-lg p-12 max-w-3xl w-full">
            <h1 className="text-5xl font-bold text-center text-amber-900 mb-8">ROMAN CIRCUS</h1>
            <h2 className="text-2xl font-bold text-center text-amber-800 mb-8">Game Setup</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xl font-bold text-amber-900 mb-4 text-center">Human Players:</label>
                <div className="grid grid-cols-5 gap-3">
                  {[0,1,2,3,4].map(num => (
                    <button key={num} onClick={() => setPlayerCount(num, gameState.numAI)}
                      className={`py-4 px-6 rounded-lg text-2xl font-bold ${gameState.numPlayers === num ? 'bg-blue-600 text-white' : 'bg-amber-300 text-amber-900 hover:bg-amber-400'}`}>
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xl font-bold text-amber-900 mb-4 text-center">AI Players:</label>
                <div className="grid grid-cols-5 gap-3">
                  {[0,1,2,3,4].map(num => (
                    <button key={num} onClick={() => setPlayerCount(gameState.numPlayers, num)}
                      className={`py-4 px-6 rounded-lg text-2xl font-bold ${gameState.numAI === num ? 'bg-red-600 text-white' : 'bg-amber-300 text-amber-900 hover:bg-amber-400'}`}>
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-900">
                  Total: {gameState.numPlayers + gameState.numAI} players
                </p>
                <p className="text-sm text-gray-600 mt-2">(Must be 2-4 total)</p>
              </div>

              <div className="bg-amber-200 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3">Rules:</h3>
                <ul className="text-base space-y-2">
                  <li>• First to 10 on any track wins</li>
                  <li>• Bid → Workers → Markets → Show → Cleanup</li>
                  <li>• AI makes decisions automatically</li>
                </ul>
              </div>
              
              {gameState.players.length > 0 && (gameState.numPlayers + gameState.numAI >= 2) && (gameState.numPlayers + gameState.numAI <= 4) && (
                <div className="text-center bg-white p-6 rounded-lg">
                  <p className="text-xl mb-4">
                    {gameState.numPlayers} Human + {gameState.numAI} AI = {gameState.players.length} Total
                  </p>
                  <button onClick={startGame} className="bg-red-600 text-white px-16 py-5 rounded-lg text-3xl font-bold hover:bg-red-700">
                    START GAME
                  </button>
                </div>
              )}
              
              {(gameState.numPlayers + gameState.numAI < 2 || gameState.numPlayers + gameState.numAI > 4) && (
                <div className="text-center text-red-700 text-lg font-bold">
                  Total must be 2-4 players
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {gameState.phase === 6 && gameState.winner && (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="bg-amber-100 border-8 border-amber-900 rounded-lg p-12 max-w-2xl text-center">
            <h1 className="text-6xl font-bold text-amber-900 mb-8">🏆 VICTORY! 🏆</h1>
            <h2 className="text-4xl font-bold text-red-700 mb-6">{gameState.winner.name} Wins!</h2>
            <div className="bg-white p-6 rounded-lg mb-8">
              <h3 className="font-bold text-2xl mb-4">Final Stats:</h3>
              <div className="space-y-2 text-xl">
                <div>Citizen: {gameState.winner.tracks.citizen}</div>
                <div>Empire: {gameState.winner.tracks.empire}</div>
                <div>Clergy: {gameState.winner.tracks.clergy}</div>
                <div>Coins: {gameState.winner.coins}</div>
              </div>
            </div>
            <button onClick={restartGame} className="mt-8 bg-red-600 text-white px-12 py-4 rounded-lg text-2xl font-bold hover:bg-red-700">
              NEW GAME
            </button>
          </div>
        </div>
      )}

      {gameState.phase >= 0 && gameState.phase < 6 && player && (
        <div>
          <div className="bg-amber-200 border-b-4 border-amber-900 p-3">
            <div className="text-center font-bold text-xl mb-2">Selected Acts</div>
            <div className="flex justify-around gap-2">
              {['act1', 'act2', 'act3'].map(actKey => (
                <div key={actKey} className="flex-1 bg-white border-2 border-amber-900 rounded p-2 text-sm">
                  <div className="font-bold text-center mb-1">{actKey.toUpperCase()}</div>
                  {gameState.selectedActs[actKey] ? (
                    <div>
                      <div className="font-bold text-center">{gameState.selectedActs[actKey].name}</div>
                      <div className="text-xs">Cost: {gameState.selectedActs[actKey].cost}</div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center">Not selected</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black bg-opacity-50 p-4 grid gap-2 text-white" style={{gridTemplateColumns: `repeat(${gameState.players.length}, 1fr)`}}>
            {gameState.players.map(p => (
              <div key={p.id} className={`${p.id === gameState.currentPlayer ? 'ring-4 ring-yellow-400 rounded p-2' : ''}`}>
                <div className="font-bold mb-2">
                  {p.name} {p.isAI && <span className="text-xs bg-purple-600 px-2 py-1 rounded">AI</span>}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{width: `${p.tracks.citizen * 10}%`}}></div>
                    </div>
                    <span>{p.tracks.citizen}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown size={16} />
                    <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{width: `${p.tracks.empire * 10}%`}}></div>
                    </div>
                    <span>{p.tracks.empire}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Church size={16} />
                    <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
                      <div className="bg-yellow-500 h-full" style={{width: `${p.tracks.clergy * 10}%`}}></div>
                    </div>
                    <span>{p.tracks.clergy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins size={16} /> {p.coins}c | {p.availableWorkers}w
                  </div>
                  <div className="text-xs">S:{p.resources.slaves} A:{p.resources.animals} M:{p.resources.mummers} P:{p.resources.prisoners}</div>
                  {p.passedBidding && gameState.phase === 1 && <div className="text-yellow-400 text-xs">✓ Passed Bid</div>}
                  {p.passedWorkers && gameState.phase === 2 && <div className="text-yellow-400 text-xs">✓ Passed Workers</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-100 border-4 border-amber-900 m-4 p-4 rounded-lg">
            <p className="text-lg font-bold text-amber-900">{gameState.message}</p>
            {gameState.eventCard && <p className="text-sm text-red-800 mt-2">Event: {gameState.eventCard.name}</p>}
          </div>

          <div className="text-center text-white text-2xl font-bold mb-4">
            Round {gameState.round} | 
            {gameState.phase === 0 && " Ready"}
            {gameState.phase === 1 && ` Bidding (${gameState.biddingState.currentAct.toUpperCase()})`}
            {gameState.phase === 2 && " Workers"}
            {gameState.phase === 2.5 && " Resolving..."}
            {gameState.phase === 3 && ` ${gameState.marketPhase.currentMarket.toUpperCase()} Market`}
            {gameState.phase === 4 && " The Show"}
            {gameState.phase === 5 && " Cleanup"}
          </div>

          <div className="px-4">
            {gameState.phase === 0 && (
              <div className="flex justify-center">
                <button onClick={startGame} className="bg-red-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-red-700">
                  Start Round {gameState.round}
                </button>
              </div>
            )}

            {gameState.phase === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {actCardsData[gameState.biddingState.currentAct].map((act, idx) => {
                    const totalBids = Object.values(gameState.biddingState[`${gameState.biddingState.currentAct}Bids`]).reduce((a,b) => a+b, 0);
                    const bidsOnThisCard = gameState.biddingState.selectedCard === idx ? totalBids : 0;
                    return (
                      <div key={act.id} onClick={() => selectCard(idx)}
                        className={`cursor-pointer bg-amber-100 border-4 rounded-lg p-4 relative ${gameState.biddingState.selectedCard === idx ? 'border-green-600' : 'border-amber-900'}`}>
                        {bidsOnThisCard > 0 && (
                          <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                            {bidsOnThisCard}
                          </div>
                        )}
                        <h3 className="font-bold text-xl mb-2 text-center">{act.name}</h3>
                        <div className="text-sm space-y-2">
                          <div><span className="font-bold">Cost:</span> {act.cost}</div>
                          <div><span className="font-bold text-green-700">Victory:</span> {act.victory}</div>
                          {act.defeat !== 'N/A' && <div><span className="font-bold text-orange-700">Defeat:</span> {act.defeat}</div>}
                          <div><span className="font-bold text-red-700">No Entry:</span> {act.noEntry}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center text-white text-lg">
                  Current Bids: {Object.entries(gameState.biddingState[`${gameState.biddingState.currentAct}Bids`]).map(([id, bid]) => {
                    const p = gameState.players.find(pl => pl.id === parseInt(id));
                    return `${p?.name}: ${bid}`;
                  }).join(' | ')}
                </div>
                {!player.passedBidding && !player.isAI && (
                  <div className="flex justify-center gap-4">
                    <button onClick={placeBid} className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700">Bid 1 Coin</button>
                    <button onClick={passBid} className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700">Pass</button>
                  </div>
                )}
                {player.isAI && <div className="text-center text-white text-lg">AI is thinking...</div>}
              </div>
            )}

            {gameState.phase === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {['Prison', 'Port', 'War', 'Forest', 'Town Square', 'Palace', 'Pantheon', 'Guildhall', 'Oracle', 'Gamblers Den', 'Slave Market', 'Animal Market', 'Mummer Market'].map(loc => {
                    const { alreadyPlaced, canPlace } = getWorkerLocationStatus(loc, player);
                    const info = workerLocationInfo[loc];
                    return (
                      <div key={loc} className="flex flex-col">
                        <button onClick={() => placeWorker(loc)} disabled={player.passedWorkers || !canPlace}
                          className={`w-full px-3 py-2 rounded text-sm font-bold relative ${player.passedWorkers || !canPlace ? 'bg-gray-500 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'} text-white`}>
                          {loc}
                          {alreadyPlaced && loc !== 'Prison' && <span className="absolute top-1 right-1 text-xs bg-red-600 rounded-full w-5 h-5 flex items-center justify-center">✓</span>}
                        </button>
                        <div className="text-white text-xs mt-1 px-1 text-center min-h-[32px]">{info.description}</div>
                      </div>
                    );
                  })}
                </div>
                {!player.passedWorkers && (
                  <div className="flex justify-center">
                    <button onClick={passWorker} className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700">Pass</button>
                  </div>
                )}
              </div>
            )}

            {gameState.phase === 2.5 && <div className="text-white text-center text-xl">Resolving...</div>}

            {gameState.phase === 3 && (
              <div className="space-y-4">
                <div className="text-white text-center text-xl mb-4">{gameState.marketPhase.currentMarket.toUpperCase()} Market</div>
                <div className="bg-amber-100 border-4 border-amber-900 rounded-lg p-6 mx-auto max-w-3xl">
                  <h3 className="font-bold text-2xl mb-4 text-center">Stock</h3>
                  <div className="flex gap-2 justify-center items-end">
                    {gameState.market[gameState.marketPhase.currentMarket].map((price, idx) => (
                      <div key={idx} className="bg-amber-900 text-white p-3 rounded flex flex-col items-center min-w-[60px]">
                        <div className="text-2xl font-bold">{price}</div>
                        <div className="text-xs">coins</div>
                      </div>
                    ))}
                    {gameState.market[gameState.marketPhase.currentMarket].length === 0 && <div className="text-red-700 text-xl font-bold">SOLD OUT</div>}
                  </div>
                </div>
                <div className="text-white text-center">Queue: {gameState.marketPhase.queue[gameState.marketPhase.currentMarket].map(id => `P${id}`).join(' → ')}</div>
                <div className="flex gap-4 justify-center">
                  <button onClick={buyResource} disabled={gameState.market[gameState.marketPhase.currentMarket].length === 0}
                    className={`px-8 py-4 rounded-lg text-xl font-bold ${gameState.market[gameState.marketPhase.currentMarket].length === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
                    Buy ({getMarketPrice(gameState.marketPhase.currentMarket)}c)
                  </button>
                  <button onClick={passMarket} className="bg-red-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-red-700">Pass / Done</button>
                </div>
              </div>
            )}

            {gameState.phase === 4 && (
              <div className="space-y-6">
                <div className="text-white text-center text-2xl mb-4">Acts Resolving...</div>
                {['act1', 'act2', 'act3'].map(actKey => (
                  <div key={actKey} className="bg-amber-100 border-4 border-amber-900 rounded-lg p-6">
                    <h3 className="font-bold text-2xl mb-4 text-center">{actKey.toUpperCase()}: {gameState.selectedActs[actKey]?.name || 'None'}</h3>
                    {gameState.selectedActs[actKey] && (
                      <div className="text-sm">
                        <div><span className="font-bold">Cost:</span> {gameState.selectedActs[actKey].cost}</div>
                        <div><span className="font-bold text-green-700">Victory:</span> {gameState.selectedActs[actKey].victory}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {gameState.phase === 5 && (
              <div className="flex justify-center">
                <button onClick={endGame} className="bg-red-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-red-700">Cleanup / Next Round</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RomanCircusGame;