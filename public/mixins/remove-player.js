(function () {

    window.mixin = window.mixin || [];
    window.mixin.push({
        mounted: function () {
            this.$root.$on('remove-player', this.removePlayer);
        },
        methods: {
            removePlayer: function (id) {
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
            }
        }
    });

})();