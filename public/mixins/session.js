(function () {

    window.mixin = window.mixin || [];
    window.mixin.push({
        mounted: function () {
            this.$root.$on('update-session', this.updateSession);
            this.$root.$on('end-session', this.endSession);
        },
        methods: {
            updateSession: function (attrs) {
                this.session = _.assign(this.session, attrs);
            },
            endSession: function () {
            }
        }
    });

})();