Vue.component('my-comp', {
    data() {
        return {
            msg: 'Hello World'
        }
    },
    template: `
        <p>{{msg}}</p>
    `
});

Vue.component('score-input', {
    data() {
        return {
            scoreDiff: 0,
            extraPoints: 0
        }
    },
    props: ['match'],
    template: /*html*/`
        <div>
            <input type="range" class="form-range mb-3" min="-10" max="10" v-model="scoreDiff" @input="matchFinalScore(match)">
            <div class="justify-content-center d-flex gap-2">
                <button type="button" class="btn btn-primary" @click="addPoints">+</button>
                <button type="button" class="btn btn-warning" @click="clear">Clear</button>
                <button type="button" class="btn btn-danger" @click="match.inProgress=false; match.skip=true">Quit</button>
                <button type="button" class="btn btn-success" @click="saveScores">Save Scores</button>
            </div>
        </div>
    `,
    methods: {
        matchFinalScore: function() {
            const self = this;
            const match = self.match;
            const scoreDiff = parseInt(self.scoreDiff, 10);

            if (self.extraPoints > 0 && scoreDiff !== 0) {
                const base = self.extraPoints + 1;
                const winningScore = Math.abs(scoreDiff) + base;
                const losingScore = winningScore - 2;

                if (scoreDiff < 0) {
                    match.winningTeam = match.team1.id;
                    match.score1 = winningScore;
                    match.score2 = losingScore;
                    return;
                }

                match.winningTeam = match.team2.id;
                match.score1 = losingScore;
                match.score2 = winningScore;
                return;
            }

            if (scoreDiff < 0) {
                match.winningTeam = match.team1.id;
                match.score1 = 11
                match.score2 = 10 - (scoreDiff * -1) ;
                return;
            }
            
            if (scoreDiff > 0) {
                match.winningTeam = match.team2.id;
                match.score1 = 10 - scoreDiff;
                match.score2 = 11;
                return;
            }

            match.winningTeam = null;
            match.score1 = 0;
            match.score2 = 0;
        },
        clear: function() {
            const self = this;
            self.extraPoints = 0;
            self.scoreDiff = 0;
            self.matchFinalScore();
        },
        addPoints: function() {
            const self = this;
            self.extraPoints += 10;
            self.matchFinalScore();
        },
        saveScores: function() {
            /*
            Get history
            Tally: Team started, served order of everyone, team win, team loss
            Match: match id, start, end, score, winning team id, losing team id
            */
            const self = this;
            const match = self.match;

            const pickleHistoryStorage = localStorage.getItem('pickleHistoryStorage') || '{ "teams": {}, "players": {}, "matches": [] }';
            const pickleHistoryData = JSON.parse(pickleHistoryStorage);

            self.updateTeamStats(pickleHistoryData, match.team1);
            self.updateTeamStats(pickleHistoryData, match.team2);

            self.updatePlayerStats(pickleHistoryData);

            pickleHistoryData.matches.push({
                id: match.id,
                idTeam1: match.team1.id,
                idTeam2: match.team2.id,
                winningTeam: match.winningTeam,
                startTS: match.startTS,
                endTS: match.endTS,
                score1: match.score1,
                score2: match.score2,
            });

            localStorage.setItem('pickleHistoryStorage', JSON.stringify(pickleHistoryData));

            match.inProgress = false;
          
        },
        updatePlayerStats: function(data) {
            const match = this.match;
            const players = [ match.team1.p1, match.team1.p2, match.team2.p1, match.team2.p2 ];
            const winningPlayerIDs = match.winningTeam.split(':');

            const servedMap = [ 'first', 'fourth', 'second', 'third' ];

            players.forEach((player, index) => {
                if(!data.players.hasOwnProperty(player.id)) {
                    data.players[player.id] = {
                        win: 0,
                        loss: 0,
                        served: {
                            first: 0,
                            second: 0,
                            third: 0,
                            fourth: 0
                        }
                    };
                }
                let playerStats = data.players[player.id];

                playerStats.win += winningPlayerIDs.indexOf(player.id) > -1 ? 1 : 0;
                playerStats.loss += winningPlayerIDs.indexOf(player.id) < 0 ? 1 : 0;
                playerStats.served[servedMap[index]] += 1;
            })
        },
        updateTeamStats: function(data, team) {
            const match = this.match;
            const statsTeam = {
                firstServe: match.team1.id == team.id ? 1 : 0,
                win: team.id == match.winningTeam ? 1 : 0,
                loss: team.id !== match.winningTeam ? 1 : 0
            };

            if (data.teams.hasOwnProperty(team.id)) {
                let hisTeam = data.teams[team.id];

                for (const key in statsTeam) {
                    hisTeam[key] += statsTeam[key];
                }
            }
            else {
                data.teams[team.id] = statsTeam;
            }
        }
    }
});

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
      popMsg: [],
      scoreDiff: 0
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
                [team.p1, team.p2].forEach(player => {
                    if (count[player.name]) {
                        count[player.name] += 1;
                    }
                    else {
                        count[player.name] = 1;
                    }
                })
            });

            return _.sortBy(_.map(count, (num, player) => {
                return { player, num };
            }), ['num', 'player']).reverse();
        },
        nextMatches: function() {
            const self = this;
            const availMatch = self.matches.filter(match => {
                return match.endTS === null && match.skip === false && match.inProgress === false;
            });

            const numShow = Math.floor(self.players.filter(player => player.available).length / 4) + 1;
            return availMatch.splice(0, numShow);
        }
    },
    methods: {
        createUUID: function() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
        },
        addPlayer: function(e) {
            e.preventDefault();

            const self = this;

            const id = self.createUUID();
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
                        // teams.push([player, partner, [player.id, partner.id].sort().join(':')]);
                        teams.push({ 
                            id: [player.id, partner.id].sort().join(':'),
                            p1: player,
                            p2: partner
                        });
                    }
                }
            }

            self.teams = _.shuffle(teams);
            teams = [...teams];
            const playerList = _.shuffle(pool.map(player => player.id));

            let matchUps = [];

            for (let i = 0; i < teams.length; i++) {
                const team = teams[i];
                const teamID = team.id.split(':');
                for (let j = i+1; j < teams.length; j++) {
                    const opponent = teams[j];

                    if (_.intersection(teamID, opponent.id.split(':')).length === 0) {
                        matchUps.push({
                            id: self.createUUID(),
                            team1: team, 
                            team2: opponent,
                            skip: false,
                            inProgress: false,
                            startTS: null,
                            endTS: null,
                            score1: 0,
                            score2: 0,
                            winningTeam: null
                        });
                    }
                }
            }
            
            self.matchesPossible = matchUps;

            matchUps = _.shuffle(matchUps.map(match => {
                match.weight = 0;
                return match;
            }));
            
            let spreadMatches = [];
            let cycles = 200;
            let cycle = 0;
            do {

                const newMatch = matchUps.pop();
                
                let newMatchTeamOneIDs = [newMatch.team1.p1.id, newMatch.team1.p2.id];
                let newMatchTeamTwoIDs = [newMatch.team2.p1.id, newMatch.team2.p2.id];

                let newMatchPlayers = [ ...newMatchTeamOneIDs, ...newMatchTeamTwoIDs ];

                let noPlayPlayers = _.difference( playerList, newMatchPlayers );

                newMatch.dnp = self.players.filter(player => noPlayPlayers.indexOf(player.id) > -1).map(player => player.name).join(', ');
                newMatch.dnpIDs = noPlayPlayers;

                spreadMatches.push(newMatch);

                matchUps.forEach(match => {
                    let matchTeamOneIDs = [match.team1.p1.id, match.team1.p2.id];
                    let matchTeamTwoIDs = [match.team2.p1.id, match.team2.p2.id];

                    let matchPlayers = [ ...matchTeamOneIDs, ...matchTeamTwoIDs];

                    let w1 = Math.pow(1.5, _.intersection(newMatchPlayers, matchPlayers).length ) * -1;
                    match.weight += w1;

                    const notInLastMatch = _.intersection(noPlayPlayers, matchPlayers);
                    let w2 = Math.pow(2, notInLastMatch.length);
                    match.weight += w2;

                    let w3 = 0;
                    if (newMatch.team1.id == match.team1.id ||
                        newMatch.team1.id == match.team2.id ||
                        newMatch.team2.id == match.team1.id ||
                        newMatch.team2.id == match.team1.id) 
                    {
                        w3 = -6;
                    } 

                    match.weight += w3;
                });
                matchUps = _.sortBy(matchUps, 'weight');

                if (!matchUps.length) break;

                cycle += 1;
            } while (cycle < cycles)

            self.spreadMore(spreadMatches);
        },
        spreadMore: function(matches) {
            const self = this;
            matches = matches?.type == 'click' ? [...self.matches] : matches;
            const now = Date.now();
            let iterations = 0;
            let foundSwap;
            do {
                foundSwap = false;
                const len = matches.length
                for (let index = 0; index < len; index++) {
                    const match = matches[index];
                    if (index > 0 && index < (len - 1) && 
                        _.intersection(match.dnpIDs, matches[index+1].dnpIDs).length > 0 && 
                        _.intersection(matches[index-1].dnpIDs, matches[index+1].dnpIDs).length === 0)
                    {
                        matches[index] = matches[index-1];
                        matches[index-1] = match;
                        foundSwap = true;
                    }
                }
                iterations += 1;
            } while (Date.now() - now < 50 && foundSwap)

            self.matches = matches;
        },
        startMatch: function(match) {
            match.inProgress = true;
            match.startTS = Date.now();
        },
        matchOver: function(match) {
            match.endTS = Date.now();
        },
        matchWon: function(match, teamID) {
            match.winningTeam = teamID;
            this.matchFinalScore(match);
        },
        // matchFinalScore: function (match) {
        //     // val = parseInt(val, 10);
        //     const self = this;
        //     const scoreDiff = parseInt(self.scoreDiff, 10);

        //     // if (scoreDiff === 0) return;

        //     if (scoreDiff < 0) {
        //         match.winningTeam == match.team1.id;
        //         match.score2 = 11
        //         match.score1 = 10 - (scoreDiff * -1) ;
        //         return;
        //     }
            
        //     if (scoreDiff > 0) {
        //         match.winningTeam == match.team2.id;
        //         match.score2 = 10 - scoreDiff;
        //         match.score1 = 11;
        //         return;
        //     }

        //     match.winningTeam == null;
        //     match.score1 = 0;
        //     match.score2 = 0;
        // },
        sendPopMsg: function(msg, msgDuration = 2000) {
            const self = this;
            self.popMsg.push(msg);
            setTimeout(() => {
                self.popMsg.pop();
            }, msgDuration)
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