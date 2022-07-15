var app = new Vue({
    el: '#app',
    data: {
      hello: 'Hello Vue!',
      players: [],
      disallowList: [],
      disallowTeam: [],
      newPlayer: '',
      popMsg: []
    },
    mounted: function() {
        const localData = localStorage.getItem('pickleData');
        if (localData) {
            const data = JSON.parse(localData);
            this.players = data.players;
            this.disallowList = data.disallowList;
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
        removePlayer: function(id) {
            // console.log(player);
            const self = this;
            const findPlayerIndex = this.players.findIndex(player => player.id === id);
            if (findPlayerIndex > -1) {
                self.players.splice(findPlayerIndex, 1);
                self.saveToLocal();
            }

            let updateDisallowList = [];
            self.disallowList.forEach((team, index) => {
                if (team[0].id !== id && team[0].id) {
                    updateDisallowList.push(team);
                }
            });
            if (updateDisallowList.length !== self.disallowList.length) {
                self.disallowList = updateDisallowList;
                self.saveToLocal();
            }
        },
        addToDisallow: function(id) {
            const self = this;

            if (self.disallowTeam.length > 1 || self.disallowTeam.findIndex(player => player.id === id) > -1) {
                self.sendPopMsg((self.players.find((player) => player.id === id)).name + ' already added');
                return;
            }

            const findPlayer = this.players.find(player => player.id === id);
            if (findPlayer) {
                self.disallowTeam.push(findPlayer);
            }
        },
        removeFromDisallow: function(id) {
            const self = this;
            // console.log(id);
            const findPlayerIndex = this.disallowTeam.findIndex(player => player.id === id);
            // console.log(self.disallowTeam[findPlayerIndex]);
            if (findPlayerIndex > -1) {
                self.disallowTeam.splice(findPlayerIndex, 1);
            }
        },
        clearDisallowTeam: function() {
            this.disallowTeam = [];
        },
        addToDisallowList: function() {
            const self = this;

            let id1 = self.disallowTeam[0].id;
            let id2 = self.disallowTeam[1].id;

            const findTeamIndex = self.disallowList.findIndex(team => (team[0].id === id1 || team[1].id === id1) && (team[0].id === id2 || team[1].id === id2) );

            if (findTeamIndex > -1) {
                self.sendPopMsg('Team is already part of the exclusion list');
                return;
            }

            self.disallowList.push(self.disallowTeam);
            self.saveToLocal();
            self.disallowTeam = [];
        },
        removeFromDisallowList: function(team) {
            const self = this;

            let id1 = team[0].id;
            let id2 = team[1].id;
            
            const findTeamIndex = self.disallowList.findIndex(team => (team[0].id === id1 || team[1].id === id1) && (team[0].id === id2 || team[1].id === id2) );
            if (findTeamIndex > -1) {
                self.disallowList.splice(findTeamIndex, 1);
                self.saveToLocal();
            }
        },
        sendPopMsg: function(msg, timeout = 2000) {
            const self = this;
            self.popMsg.push(msg);
            setTimeout(() => {
                self.popMsg.pop();
            }, timeout)
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