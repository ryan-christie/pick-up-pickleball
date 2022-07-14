var app = new Vue({
    el: '#app',
    data: {
      hello: 'Hello Vue!',
      players: [],
      disallowTeams: [],
      newPlayer: ''
    },
    mounted: function() {
        const localData = localStorage.getItem('pickleData');
        if (localData) {
            const data = JSON.parse(localData);
            this.players = data.players;
        }
    },
    methods: {
        addPlayer: function(e) {
            e.preventDefault();

            const self = this;

            const id = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
            self.players.push({id, name:self.newPlayer});
            self.newPlayer = '';

            self.saveToLocal();
        },
        removePlayer: function(playerData) {
            // console.log(player);
            const self = this;
            const findPlayerIndex = this.players.findIndex(player => player.id === playerData.id);
            if (findPlayerIndex > -1) {
                self.players.splice(findPlayerIndex, 1);
            }
        },
        clearStorage: function() {
            localStorage.removeItem('pickleData');
            this.players = [];
        },
        saveToLocal: function() {
            localStorage.setItem('pickleData', JSON.stringify({players: self.players}));
        }
    }
  })