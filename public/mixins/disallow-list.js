(function () {

    window.mixin = window.mixin || [];
    window.mixin.push({
        mounted: function () {
            this.$root.$on('add-disallow-list', this.addToDisallowList);
            this.$root.$on('remove-disallow-list', this.removeFromDisallowList);
        },
        methods: {
            addToDisallowList: function(disallowTeam) {
                const self = this;
    
                let id1 = disallowTeam[0].id;
                let id2 = disallowTeam[1].id;
    
                const findTeamIndex = self.disallowList.findIndex(team => (team[0].id === id1 || team[1].id === id1) && (team[0].id === id2 || team[1].id === id2) );
    
                if (findTeamIndex > -1) {
                    self.sendMessage('Team is already part of the exclusion list', { style: 'warning'});
                    return;
                }
    
                self.disallowList.push(disallowTeam);
                self.saveToLocal();
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
            }
        }
    });

})();