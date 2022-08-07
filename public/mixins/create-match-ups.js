(function() {

    window.mixin = window.mixin || [];
    window.mixin.push({
        methods: {
            createMatchUps: function () {
                const self = this;
                const teams = _.shuffle([...self.teams]);
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
            }
        }
    });

})();