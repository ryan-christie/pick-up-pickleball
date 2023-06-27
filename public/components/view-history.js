Vue.component('view-history', {
    data() {
        return {
            matches: [],
            players: {},
            teams: {}
        }
    },
    props: ['playerInfo'],
    template: /*html*/`
        <div class="row">
            <h2>History</h2>

            <div class="col-12">
                <h3>Players</h3>

                <table class="table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Wins</th>
                            <th>Losses</th>
                            <th>Win %</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="stats in individualRecord">
                            <td>{{ playerName(stats.id) }}</td>
                            <td>{{ stats.win }}</td>
                            <td>{{ stats.loss }}</td>
                            <td>{{ stats.percent }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="col-12">
                <h3>Teams</h3>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Wins</th>
                            <th>Losses</th>
                            <th>Win %</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="stats in teamRecord">
                            <td>{{ teamPlayerNames(stats.id) }}</td>
                            <td>{{ stats.win }}</td>
                            <td>{{ stats.loss }}</td>
                            <td>{{ stats.percent }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="col-12">
                <h3>Matches</h3>
                <match-history
                    :matches="matchesFormatted"
                /></match-history>
            </div>

        </div>
    `,
    mounted: function() {
        const self = this;
        const data = util.getData('pickleHistoryStorage');
        for (const key in data) {
            if (self._data.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }

    },
    computed: {
        matchesFormatted: function() {
            const self = this;

            return this.matches.map(match => {
                match.team1 = self.formatTeamData(match.idTeam1);
                match.team2 = self.formatTeamData(match.idTeam2);

                return match;
            }).reverse()
        },
        individualRecord: function() {
            const self = this;

            let temp = [];
            for (const key in self.players) {
                if (self.players.hasOwnProperty(key)) {
                    temp.push({
                        id: key,
                        win: self.players[key].win,
                        loss: self.players[key].loss,
                        percent: self.winPercent(self.players[key].win, self.players[key].loss)
                    })
                }
            }

            return temp.sort((a, b) => {
                if (b.percent == a.percent) {
                    if (b.win == a.win) {
                        return self.playerName(b.id) < self.playerName(a.id) ? 1 : -1;
                    }
                    return b.win - a.win;
                }
                return b.percent - a.percent;
            })
        },
        teamRecord: function() {
            const self = this;
    
            let temp = [];
            for (const key in self.teams) {
                if (self.teams.hasOwnProperty(key)) {
                    temp.push({
                        id: key,
                        win: self.teams[key].win,
                        loss: self.teams[key].loss,
                        percent: self.winPercent(self.teams[key].win, self.teams[key].loss)
                    })
                }
            }
    
            return temp.sort((a, b) => {
                if (b.percent == a.percent) {
                    if (b.win == a.win) {
                        return self.teamPlayerNames(b.id) < self.teamPlayerNames(a.id) ? 1 : -1;
                    }
                    return b.win - a.win;
                }
                return b.percent - a.percent;
            })
        }
    },
    methods: {
        playerName: function(id) {
            return this.playerInfo.find(player => player.id === id).name;
        },
        teamPlayerNames: function(teamID, sep = ' & ') {
            const self = this;

            return teamID
                .split(':')
                .map(id => {
                    return self.playerName(id);
                })
                .join(sep);
        },
        winPercent: function(win, loss) {
            if (win === 0) return '.000';

            const winPer = Math.round((win / (win + loss)) * 1000);
            
            return winPer < 1000 ? `.${winPer}` : '1.000';
        },
        formatTeamData: function(teamID) {
            const teamMemberIDs = teamID.split(':');
            return {
                id: teamID,
                p1: {
                    name: this.playerName(teamMemberIDs[0])
                },
                p2: {
                    name: this.playerName(teamMemberIDs[1])
                }
            }
        }
    }
  })