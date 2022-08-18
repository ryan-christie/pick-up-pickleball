Vue.component('manage-session', {
    data() {
        return {}
    },
    props: ['matches', 'players', 'session', 'numTeams'],
    computed: {
        nextMatches: function() {
            const self = this;
            const availMatch = self.matches.filter(match => {
                return match.endTS === null && match.skip === false && match.inProgress === false;
            });

            const numShow = Math.floor(self.players.filter(player => player.available).length / 4) + 1;
            return availMatch.splice(0, numShow);
        },
        isInSession: function() {
            return this.session.id !== '' && this.session.endTS === '';
        },
        isEndSession: function() {
            return this.session.endTS !== '';
        },
        matchInProgress: function() {
            return this.matches.find(match => match.inProgress);
        },
        numMatchesFinished: function() {
            return this.matches.filter(match => match.endTS).length;
        },
        numTeamsPlayed: function() {
            const matchesPlayed = this.matches.filter(match => match.endTS);
            return _.uniq([...matchesPlayed.map(match => match.team1.id), ...matchesPlayed.map(match => match.team2.id)]).length;
        }
    },
    template: /*html*/`
        <div class="row">
            <h2>Let's Play</h2>
            <div class="col-md-6">

                <div v-show="!isInSession">
                    <h3>Player Pool</h3>
                    <div class="form-check form-switch" v-for="player in players" v-bind:key="player.id">
                        <input class="form-check-input" type="checkbox" role="switch" :id="player.id" v-model="player.available">
                        <label class="form-check-label" :for="player.id">{{player.name}}</label>
                    </div>
                </div>


                <p><button type="button" class="btn btn-primary" @click="startSession" v-show="!isInSession">Start Playing</button><button type="button" class="btn btn-danger" @click="endSession" v-show="isInSession">Stop Playing</button></p>
                <div class="row" v-show="isInSession">
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
            <div class="col-md-6">
                <div v-if="isInSession">
                    <h2 class="mb-3">Current Matches</h2>
                    <div class="mb-3" v-for="match in matches" v-if="match.inProgress" v-bind:key="match.id">
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
                                <button type="button" class="btn btn-danger" @click="match.inProgress=false; match.skip=true">Quit</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-show="!matchInProgress">
                    <p>{{ numTeamsPlayed }} : {{ numTeams }} teams have played {{ numMatchesFinished }} : {{ matches.length }} possible matches.</p>
                    <p>Let's GOOOOOoooaaahhh!!</p>
                </div>
            </div>
            <div class="col-12" v-if="isEndSession">
                <h2>Recap</h2>
            </div>
        </div>
    `,
    methods: {
        startSession: function() {
            this.$root.$emit('create-matches');
            this.$root.$emit('update-session', {
                id: util.createUUID,
                startTS: Date.now(),
                endTS: ''
            });
        },
        endSession: function() {
            this.$root.$emit('send-message', `Are you sure you want to want to end this play session?`, {
                action: 'update-session',
                style: 'danger',
                actionLabel: `Yes`,
                autohide: false,
                payload: { endTS: Date.now() }
            });
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