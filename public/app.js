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

        this.$root.$on('save-to-local', this.saveToLocal);
        this.$root.$on('create-matches', this.createMatches);
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
        }
    },
    methods: {
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
                            id: util.createUUID,
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
        // startMatch: function(match) {
        //     match.inProgress = true;
        //     match.startTS = Date.now();
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