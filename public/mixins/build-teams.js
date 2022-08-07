(function () {

    window.mixin = window.mixin || [];
    window.mixin.push({
        methods: {
            buildTeams: function () {
                const self = this;
                let pool = self.players.filter(player => player.available);
                let teams = [];

                for (let i = 0; i < pool.length; i++) {
                    const player = pool[i];
                    for (let j = i+1; j < pool.length; j++) {
                        const partner = pool[j];

                        const findTeamIndex = self.disallowList.findIndex(team => (team[0].id === player.id || team[1].id === player.id) && (team[0].id === partner.id || team[1].id === partner.id) );

                        if (findTeamIndex < 0) {
                            teams.push({ 
                                id: [player.id, partner.id].sort().join(':'),
                                p1: player,
                                p2: partner
                            });
                        }
                    }
                }

                self.teams = teams;
            }
        }
    });

})();