Vue.component('manage-players', {
    data() {
        return {
            newPlayer: '',
            disallowTeam: []
        }
    },
    props: ['players', 'disallowList'],
    template: /*html*/`
        <div>
            <form @submit="addPlayer">
                <input v-model="newPlayer" type="text" player="Player Name">
            </form>
            <div class="row mb-3">
                <div class="col">
                    <div class="d-flex mb-1 align-items-center" v-for="player in players">
                        <h2 :title="player.id">{{player.name}}</h2>
                        <div class="btn-group ms-auto" role="group" aria-label="Basic outlined example">
                            <button type="button" class="btn" :class="{ 'btn-success': player.available, 'btn-warning': !player.available }" @click="toggleAvailable(player.id)">Available</button>
                            <button type="button" class="btn btn-primary" @click="addToDisallow(player.id)">--></button>
                            <button type="button" class="btn btn-danger" @click="removePlayerConfirm(player.id)">Remove</button>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <h2>Exclusion Teams</h2>
                    <ul>
                        <li v-for="member in disallowTeam" @click="removeFromDisallow(member.id)">{{member.name}}</li>
                    </ul>
                    <div class="btn-group" role="group" aria-label="Basic outlined example">
                        <button type="button" class="btn btn-danger" v-if="disallowTeam.length > 0" @click="clearDisallowTeam">Clear</button>
                        <button type="button" class="btn btn-success" v-if="disallowTeam.length > 1" @click="addToDisallowList">Add</button>
                    </div>
                    <h2>Exclusion List</h2>
                    <ul>
                        <li v-for="team in disallowList" @click="removeFromDisallowList(team)">{{team[0].name}} & {{team[1].name}}</li>
                    </ul>
                </div>
            </div>
        </div>
    `,
    methods: {
        addPlayer: function(e) {
            e.preventDefault();

            const self = this;
            self.$root.$emit('add-player', self.newPlayer);
            self.newPlayer = '';
        },
        toggleAvailable: function(id) {
            const self = this;
            const index = self.players.findIndex(player => player.id === id);
            self.players[index].available = !self.players[index].available;
            self.$root.$emit('save-to-local');
        },
        removePlayerConfirm: function(id) {
            const self = this;
            self.disallowTeam = [];
            
            const playerName = this.players.find(player => player.id === id).name;

            self.$root.$emit('send-message', `Are you sure you want to remove <strong>${playerName}</strong>?`, {
                action: 'remove-player',
                style: 'danger',
                actionLabel: `Yes, remove ${playerName}`,
                autohide: false,
                payload: id
            });
        },
        addToDisallow: function(id) {
            const self = this;

            if (self.disallowTeam.length > 1 || self.disallowTeam.findIndex(player => player.id === id) > -1) {
                self.$root.$emit('send-message', (self.players.find((player) => player.id === id)).name + ' already added');
                return;
            }

            const findPlayer = this.players.find(player => player.id === id);
            if (findPlayer) {
                self.disallowTeam.push(findPlayer);
            }
        },
        removeFromDisallow: function(id) {
            const self = this;
            const findPlayerIndex = this.disallowTeam.findIndex(player => player.id === id);
            if (findPlayerIndex > -1) {
                self.disallowTeam.splice(findPlayerIndex, 1);
            }
        },
        clearDisallowTeam: function() {
            this.disallowTeam = [];
        },
        addToDisallowList: function() {
            const self = this;

            self.$root.$emit('add-disallow-list', self.disallowTeam);
            self.disallowTeam = [];
        },
        removeFromDisallowList: function(team) {
            const self = this;

            self.$root.$emit('send-message', `Are you sure you want to remove the team of <strong>${team[0].name}</strong> and <strong>${team[1].name}</strong>?`, {
                action: 'remove-disallow-list',
                style: 'danger',
                actionLabel: `Yes`,
                autohide: false,
                payload: team
            });
        }
    }
});