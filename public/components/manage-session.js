Vue.component('manage-session', {
    data() {
        return {}
    },
    props: ['matches', 'players'],
    computed: {
        nextMatches: function() {
            const self = this;
            const availMatch = self.matches.filter(match => {
                return match.endTS === null && match.skip === false && match.inProgress === false;
            });

            const numShow = Math.floor(self.players.filter(player => player.available).length / 4) + 1;
            return availMatch.splice(0, numShow);
        }
    },
    template: /*html*/`
        <div class="row">
            <div class="col">
                <p><button type="button" class="btn btn-primary" @click="createMatches">Start Session</button></p>
                <div class="row">
                    <div class="col-12 col-md-6 mb-3" v-for="match in nextMatches" v-bind:key="match.id">
                        <div class="next-match row p-2 mx-1">
                            <div class="align-items-center justify-content-around d-flex mb-3 gap-2">
                                <div class="next-match__team next-match__team--1">
                                    {{match.team1.p1.name}} <br>
                                    {{match.team1.p2.name}}
                                </div>
                                <div class="text-center">vs.</div>
                                <div class="next-match__team next-match__team--2">
                                    {{match.team2.p1.name}} <br>
                                    {{match.team2.p2.name}}
                                </div>
                            </div>
                            <div class="justify-content-center d-flex gap-2">
                                <button type="button" class="btn btn-success" @click="startMatch(match)">Play</button>
                                <button type="button" class="btn btn-warning" @click="match.skip='true'">Skip</button>
                            </div>
                        </div>
                    </div>
                </div> 
            </div>
            <div class="col">
                <h2 class="mb-3">Current Matches</h2>
                <div class="mb-3" v-for="match in matches" v-if="match.inProgress " v-bind:key="match.id">
                    <div class="next-match next-match--in-progress row p-2 mx-1">
                        <div class="align-items-center justify-content-around d-flex mb-3 gap-2">
                            <div class="next-match__team next-match__team--1">
                                {{match.team1.p1.name}} <br>
                                {{match.team1.p2.name}}
                                <div v-if="match.endTS" >{{match.score1}}</div>
                            </div>
                            <div class="text-center">vs.</div>
                            <div class="next-match__team next-match__team--2">
                                {{match.team2.p1.name}} <br>
                                {{match.team2.p2.name}}
                                <div v-if="match.endTS" >{{match.score2}}</div>
                            </div>
                        </div>
                        <div v-if="match.endTS" >
                            <score-input :match="match" :key="'si-' + match.id"></score-input>
                        </div>
                        <div class="justify-content-center d-flex gap-2" v-if="!match.endTS">
                            <button type="button" class="btn btn-primary" @click="matchOver(match)">Finish</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        createMatches: function() {
            this.$root.$emit('create-matches');
        },
        startMatch: function(match) {
            match.inProgress = true;
            match.startTS = Date.now();
        },
        matchOver: function(match) {
            match.endTS = Date.now();
        }
    }
});