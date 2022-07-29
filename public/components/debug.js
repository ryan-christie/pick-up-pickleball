Vue.component('debug', {
    data() {
        return {}
    },
    props: ['matches', 'teams', 'matchesPossible'],
    computed: {
        timesGrouped: function() {
            const self = this;
            if (!self.teams.length) return [];

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
    template: /*html*/`
        <div class="row">
            <details>
                <summary>Debug</summary>
                <div class="row mt-3">
                    <div class="col-md-3">
                        <p class="strong">Num Teams: {{ teams.length }}</p>
                        <ul>
                            <li v-for="team in teams" :title="team[2]">{{team.p1.name}} & {{team.p2.name}}</li>
                        </ul>
        
                        <p>Number of times grouped:</p>
                        <ul>
                            <li v-for="player in timesGrouped">{{player.player}}: {{player.num}}</li>
                        </ul>
                    </div>
                    <div class="col-md-4">
                        <p class="strong">Possible Matches: {{ matchesPossible.length }}</p>
                        <ul>
                            <li v-for="match in matchesPossible">{{match.team1.p1.name}} & {{match.team1.p2.name}} VS {{match.team2.p1.name}} & {{match.team2.p2.name}}</li>
                        </ul>
                    </div>
                    <div class="col">
                        <p class="strong">Spread Matches: {{ matches.length }}</p>
                        <ul>
                            <li v-for="match in matches">{{match.team1.p1.name}} & {{match.team1.p2.name}} VS {{match.team2.p1.name}} & {{match.team2.p2.name}} ({{ match.weight }}) | {{ match.dnp }}</li>
                        </ul>
                    </div>
                </div>
            </details>
        </div>
    `,
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

    }
});