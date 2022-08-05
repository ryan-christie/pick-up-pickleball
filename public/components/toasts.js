Vue.component('bs-toast', {
    data() {
        return {}
    },
    props: ['message'],
    template: /*html*/`
        <div ref="el" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
              <strong class="me-auto">Bootstrap</strong>
              <small>11 mins ago</small>
              <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              {{message.msg}}
            </div>
        </div>
    `,
    mounted: function() {
        const self = this;
        const toast = new bootstrap.Toast(this.$refs.el, {delay: self.message.delay});

        this.$refs.el.addEventListener('hidden.bs.toast', () => {
            self.$root.$emit('clear-message', self.message.id);
        })
        toast.show();
    }
});