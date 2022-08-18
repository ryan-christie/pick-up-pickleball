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

            <div class="col">
                <h3>Players</h3>
                <p v-for="(stats, id) in players">{{ playerName(id) }} | {{ stats.win }} - {{ stats.loss }} ({{ winPercent(stats.win, stats.loss) }})</p>
            </div>

            <div class="col">
                <h3>Teams</h3>
                <p v-for="(stats, teamID) in teams">{{ teamPlayerNames(teamID) }} | {{ stats.win }} - {{ stats.loss }} ({{ winPercent(stats.win, stats.loss) }})</p>
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