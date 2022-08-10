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
                <div class="row">
                    <div class="mb-3 col col-md-4" v-for="match in matches" v-bind:key="match.id">
                        <div class="next-match next-match--in-progress row p-2 mx-1 mb-3">
                            <div class="align-items-center justify-content-around d-flex gap-2 mb-1">
                                <div class="next-match__team next-match__team--1 text-center p-1 col-4" :class="[match.idTeam1 == match.winningTeam ? 'bg-success text-white' : '']">
                                    <div v-html="teamPlayerNames(match.idTeam1, '<br>')"></div>
                                    <div v-if="match.endTS" >{{match.score1}}</div>
                                </div>
                                <div class="text-center">vs.</div>
                                <div class="next-match__team next-match__team--2 text-center p-1 col-4" :class="[match.idTeam2 == match.winningTeam ? 'bg-success text-white' : '']">
                                    <div v-html="teamPlayerNames(match.idTeam2, '<br>')"></div>
                                    <div v-if="match.endTS" >{{match.score2}}</div>
                                </div>
                            </div>
                            <div class="text-center">Started at {{match.startTS | formatDate}} and played for {{ durationRel(match.startTS, match.endTS) }}</div>
                        </div>
                    </div>
                </div>
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
    filters: {
        formatDate: function(dateStr) {
            return moment(dateStr).format('M/DD/YY h:mm a');
            // return moment(dateStr).calendar();
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
        durationRel: function(start, end) {
            start = moment(start);
            end = moment(end);
            return moment.duration(end.diff(start)).humanize();
        }
    }
  })