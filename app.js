var app = new Vue({
    el: '#app',
    data: {
      hello: 'Hello Vue!',
      players: [],
      disallowList: [],
      disallowTeam: [],
      newPlayer: '',
      teams: [],
      matchesPossible: [],
      matches: [],
      popMsg: []
    },
    mounted: function() {
        const localData = localStorage.getItem('pickleData');
        if (localData) {
            const data = JSON.parse(localData);
            this.players = data.players;
            this.disallowList = data.disallowList;
        }
    },
    computed: {
        timesGrouped: function() {
            const self = this;
            if (!this.teams.length) return [];

            let count = {};

            self.teams.forEach(team => {
                team.forEach(player => {
                    if (player.hasOwnProperty('name')) {
                        if (count[player.name]) {
                            count[player.name] += 1;
                        }
                        else {
                            count[player.name] = 1;
                        }
                    }
                })
            });

            return _.sortBy(_.map(count, (num, player) => {
                return { player, num };
            }), ['num', 'player']).reverse();
        }
    },
    methods: {
        addPlayer: function(e) {
            e.preventDefault();

            const self = this;

            const id = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
            self.players.push({id, name:self.newPlayer, available: true});
            self.newPlayer = '';

            self.saveToLocal();
        },
        toggleAvailable: function(id) {
            const self = this;
            const index = self.players.findIndex(player => player.id === id);
            self.players[index].available = !self.players[index].available;
            self.saveToLocal();
        },
        removePlayer: function(id) {
            const self = this;
            const findPlayerIndex = this.players.findIndex(player => player.id === id);
            if (findPlayerIndex > -1) {
                self.players.splice(findPlayerIndex, 1);
                self.saveToLocal();
            }

            let updateDisallowList = [];
            self.disallowList.forEach((team, index) => {
                if (team[0].id !== id && team[0].id) {
                    updateDisallowList.push(team);
                }
            });
            if (updateDisallowList.length !== self.disallowList.length) {
                self.disallowList = updateDisallowList;
                self.saveToLocal();
            }
        },
        addToDisallow: function(id) {
            const self = this;

            if (self.disallowTeam.length > 1 || self.disallowTeam.findIndex(player => player.id === id) > -1) {
                self.sendPopMsg((self.players.find((player) => player.id === id)).name + ' already added');
                return;
            }

            const findPlayer = this.players.find(player => player.id === id);
            if (findPlayer) {
                self.disallowTeam.push(findPlayer);
            }
        },
        removeFromDisallow: function(id) {
            const self = this;
            const findPlayerIndex = this.disallowTeam.findIndex(player => player.id === id);
            if (findPlayerIndex > -1) {
                self.disallowTeam.splice(findPlayerIndex, 1);
            }
        },
        clearDisallowTeam: function() {
            this.disallowTeam = [];
        },
        addToDisallowList: function() {
            const self = this;

            let id1 = self.disallowTeam[0].id;
            let id2 = self.disallowTeam[1].id;

            const findTeamIndex = self.disallowList.findIndex(team => (team[0].id === id1 || team[1].id === id1) && (team[0].id === id2 || team[1].id === id2) );

            if (findTeamIndex > -1) {
                self.sendPopMsg('Team is already part of the exclusion list');
                return;
            }

            self.disallowList.push(self.disallowTeam);
            self.saveToLocal();
            self.disallowTeam = [];
        },
        removeFromDisallowList: function(team) {
            const self = this;

            let id1 = team[0].id;
            let id2 = team[1].id;
            
            const findTeamIndex = self.disallowList.findIndex(team => (team[0].id === id1 || team[1].id === id1) && (team[0].id === id2 || team[1].id === id2) );
            if (findTeamIndex > -1) {
                self.disallowList.splice(findTeamIndex, 1);
                self.saveToLocal();
            }
        },
        createMatches: function() {
            const self = this;
            let pool = self.players.filter(player => player.available);
            let teams = [];

            for (let i = 0; i < pool.length; i++) {
                const player = pool[i];
                for (let j = i+1; j < pool.length; j++) {
                    const partner = pool[j];

                    const findTeamIndex = self.disallowList.findIndex(team => (team[0].id === player.id || team[1].id === player.id) && (team[0].id === partner.id || team[1].id === partner.id) );

                    if (findTeamIndex < 0) {
                        teams.push([player, partner, [player.id, partner.id].sort().join(':')]);
                    }
                }
            }

            
            self.teams = _.shuffle(teams);
            teams = self.teams.map(team => [ {id: team[0].id, name: team[0].name}, {id: team[1].id, name: team[1].name} ]);
            const playerList = _.shuffle(pool.map(player => player.id));
            // let workingPlayerList = [...playerList];

            let matchUps = [];

            for (let i = 0; i < teams.length; i++) {
                const team = teams[i];
                for (let j = i+1; j < teams.length; j++) {
                    const opponent = teams[j];

                    if ( ( opponent[0].id !== team[0].id && opponent[1].id !== team[0].id ) && ( opponent[0].id !== team[1].id && opponent[1].id !== team[1].id ) ) {
                        matchUps.push({ team1: team, team2: opponent });
                    }
                }
            }

            
            self.matchesPossible = matchUps;

            matchUps = _.shuffle(matchUps.map(match => {
                match.weight = 0;
                return match;
            }));
            // matchUps = matchUps.map(match => {
            //     match.weight = 0;
            //     return match;
            // });

            
            let spreadMatches = [];
            let cycles = 200;
            let cycle = 0;
            do {

                const newMatch = matchUps.pop();
                spreadMatches.push(newMatch);

                let newMatchTeamOneIDs = newMatch.team1.map(player => player.id);
                let newMatchTeamTwoIDs = newMatch.team2.map(player => player.id);

                let newMatchPlayers = [ ...newMatchTeamOneIDs, ...newMatchTeamTwoIDs ];

                let noPlayPlayers = _.difference( playerList, newMatchPlayers );

                matchUps.forEach(match => {
                    let matchTeamOneIDs = match.team1.map(player => player.id);
                    let matchTeamTwoIDs = match.team2.map(player => player.id);

                    let matchPlayers = [ ...matchTeamOneIDs, ...matchTeamTwoIDs];

                    let inter = _.intersection(newMatchPlayers, matchPlayers);
                    match.weight += inter.length * -1;

                    // Add weight for players who didn't play this round
                    match.weight += (_.intersection(noPlayPlayers, matchPlayers).length ^ 2) - 1;

                    let repeatTeamWeight = 
                        _.intersection(newMatchTeamOneIDs, matchTeamOneIDs).length +
                        _.intersection(newMatchTeamOneIDs, matchTeamTwoIDs).length +
                        _.intersection(newMatchTeamTwoIDs, matchTeamOneIDs).length +
                        _.intersection(newMatchTeamTwoIDs, matchTeamTwoIDs).length;
                    
                    match.weight += repeatTeamWeight * -2;
                });
                matchUps = _.sortBy(matchUps, 'weight');

                if (!matchUps.length) break;

                // if (workingPlayerList.length < 4) workingPlayerList = [...workingPlayerList, ...playerList];

                // const findMatchIndex = matchUps.findIndex( match => (
                //     workingPlayerList.indexOf(match.team1[0].id) > -1 && 
                //     workingPlayerList.indexOf(match.team1[1].id) > -1 && 
                //     workingPlayerList.indexOf(match.team2[0].id) > -1 && 
                //     workingPlayerList.indexOf(match.team2[1].id) > -1 
                // ));

                // const newMatch = matchUps[findMatchIndex];

                // if (!newMatch) break;

                // spreadMatches.push(newMatch);


                // matchUps.splice(findMatchIndex, 1);
                // // matchUps = matchUps.filter(match => 
                // //     (match.team1[0].id !== newMatch.team1[0].id && match.team1[1].id !== newMatch.team1[1].id) &&
                // //     (match.team1[1].id !== newMatch.team1[0].id && match.team1[0].id !== newMatch.team1[1].id)
                // // ).filter(match => 
                // //     (match.team2[0].id !== newMatch.team2[0].id && match.team2[1].id !== newMatch.team2[1].id) &&
                // //     (match.team2[1].id !== newMatch.team2[0].id && match.team2[0].id !== newMatch.team2[1].id)
                // // );
                // workingPlayerList = _.pullAll(workingPlayerList, [ ...newMatch.team1.map(player => player.id), ...newMatch.team2.map(player => player.id) ]);

                cycle += 1;
            } while (cycle < cycles)

            // self.matchesPossible = matchUps;

            self.matches = spreadMatches;
        },
        sendPopMsg: function(msg, timeout = 2000) {
            const self = this;
            self.popMsg.push(msg);
            setTimeout(() => {
                self.popMsg.pop();
            }, timeout)
        },
        clearStorage: function() {
            localStorage.removeItem('pickleData');
            this.players = [];
        },
        saveToLocal: function() {
            localStorage.setItem('pickleData', JSON.stringify({players: this.players, disallowList: this.disallowList}));
        }
    }
  })