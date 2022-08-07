(function () {

    window.mixin = window.mixin || [];
    window.mixin.push({
        mounted: function () {
            this.$root.$on('create-matches', this.createMatches);
        },
        methods: {
            createMatches: function() {
                const self = this;

                self.buildTeams();
                self.createMatchUps();

                const playerList = self.players
                    .filter(player => player.available)
                    .map(player => player.id);

                let matchUps = _.shuffle(self.matchesPossible.map(match => {
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
            }
        }
    });

})();