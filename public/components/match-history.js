Vue.component('match-history', {
    data() {
        return {}
    },
    props: ['matches'],
    template: /*html*/`
    <div class="row">
        <div class="mb-3 col col-md-4" v-for="match in matches" v-bind:key="match.id">
            <div class="next-match next-match--in-progress row p-2 mx-1 mb-3">
                <div class="align-items-center justify-content-around d-flex gap-2 mb-1">
                    <div class="next-match__team next-match__team--1 text-center p-1 col-4" :class="[match.team1.id == match.winningTeam ? 'bg-success text-white' : '']">
                        <div v-html="teamPlayerNames(match.team1, '<br>')"></div>
                        <div v-if="match.endTS" >{{match.score1}}</div>
                    </div>
                    <div class="text-center">vs.</div>
                    <div class="next-match__team next-match__team--2 text-center p-1 col-4" :class="[match.team2.id == match.winningTeam ? 'bg-success text-white' : '']">
                        <div v-html="teamPlayerNames(match.team2, '<br>')"></div>
                        <div v-if="match.endTS" >{{match.score2}}</div>
                    </div>
                </div>
                <div class="text-center">Started at {{match.startTS | formatDate}} and played for {{ durationRel(match.startTS, match.endTS) }}</div>
            </div>
        </div>
        <div v-show="matches.length < 1">
            <p>No matches were completed during this session.</p>
        </div>
    </div>
    `,
    filters: {
        formatDate: function(dateStr) {
            return moment(dateStr).format('M/DD/YY h:mm a');
            // return moment(dateStr).calendar();
        }
    },
    methods: {
        teamPlayerNames: function(team, sep = ' & ') {
            return `${team.p1.name}${sep}${team.p2.name}`;
        },
        durationRel: function(start, end) {
            start = moment(start);
            end = moment(end);
            return moment.duration(end.diff(start)).humanize();
        }
    }
  })