var app = new Vue({
    el: '#app',
    data: {
      hello: 'Hello Vue!',
      players: [],
      disallowList: [],
      disallowTeam: [],
      newPlayer: '',
      teams: [],
      matchesPossible: [],
      matches: [],
      toasts: [],
      scoreDiff: 0
    },
    mixins: window.mixin || [],
    mounted: function() {
        const localData = localStorage.getItem('pickleData');
        if (localData) {
            const data = JSON.parse(localData);
            this.players = data.players;
            this.disallowList = data.disallowList;
        }

        this.$root.$on('save-to-local', this.saveToLocal);
        this.$root.$on('send-message', this.sendMessage);
        this.$root.$on('clear-message', this.clearMessageQueue);
    },
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
        sendMessage: function(msg, options = {}) {
            const self = this;
            self.toasts.push({ msg, id: Date.now(), ...options });
        },
        clearMessageQueue: function(id) {
            this.toasts = this.toasts.filter(toast => toast.id !== id);
        },
        clearStorage: function() {
            localStorage.removeItem('pickleData');
            this.players = [];
        },
        saveToLocal: function() {
            localStorage.setItem('pickleData', JSON.stringify({players: this.players, disallowList: this.disallowList}));
        }
    }
  })