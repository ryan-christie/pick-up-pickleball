Vue.component('next-match', {
    data() {
        return {}
    },
    props: ['match', 'currentlyPlaying'],
    template: /*html*/`
        <div class="col-12 col-md-6 mb-3">
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
                    <button type="button" class="btn btn-success" @click="$emit('start')" :disabled="!allPlayersAvailable">Play</button>
                    <button type="button" class="btn btn-warning" @click="match.skip='true'">Skip</button>
                </div>
            </div>
        </div>
    `,
    mounted: function() {

    },
    computed: {
        allPlayersAvailable: function() {
            if (this.currentlyPlaying.length === 0) return true;

            const nextPlaying = [this.match.team1.p1.id, this.match.team1.p2.id, this.match.team2.p1.id, this.match.team2.p2.id]
            return _.intersection(this.currentlyPlaying, nextPlaying).length === 0;
        }
    },
    methods: {

    },
});