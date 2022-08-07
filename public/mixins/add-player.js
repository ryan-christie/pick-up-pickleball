(function () {

    window.mixin = window.mixin || [];
    window.mixin.push({
        mounted: function () {
            this.$root.$on('add-player', this.addPlayer);
        },
        methods: {
            addPlayer: function (name) {
                const self = this;

                const id = util.createUUID;
                self.players.push({id, name, available: true});

                self.saveToLocal();
            }
        }
    });

})();