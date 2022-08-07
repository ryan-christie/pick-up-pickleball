Vue.component('bs-toast', {
    data() {
        return {
            toast: '',
            color: '',
            header: '',
            delay: 2000,
            autohide: true,
            header: 'Info',
            color: '#0d6efd',
            action: null,
            actionLabel: 'Yes',
            noActionLabel: 'No',
            payload: null
        }
    },
    props: ['message'],
    template: /*html*/`
        <div ref="el" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
              <svg class="bd-placeholder-img rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" :fill="color"></rect></svg>
              <strong class="me-auto">{{header}}</strong>
              <button v-if="!message.action" type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              <div v-html="message.msg"></div>
              <div v-if="message.action" class="mt-2 pt-2 border-top">
                  <button type="button" class="btn btn-primary btn-sm" @click="doAction">{{actionLabel}}</button>
                  <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">{{noActionLabel}}</button>
              </div>
            </div>
        </div>
    `,
    mounted: function() {
        const self = this;

        const styles = {
            notice: {
                color: '#6c757d',
                header: 'Notice'
            },
            warning: {
                color: '#ffc107',
                header: 'Warning'
            },
            success: {
                color: '#198754',
                header: 'Success'
            },
            danger: {
                color: '#dc3545',
                header: 'Alert'
            }
        }

        if (self.message?.style) {
            const style = styles[self.message.style];
            self.color = style.color;
            self.header = self.message?.header ? self.message.header : style.header;
        }
        
        for (const key in self.message) {
            if (self._data.hasOwnProperty(key)) {
                self[key] = self.message[key];
            }
        }

        self.toast = new bootstrap.Toast(this.$refs.el, self._data );

        this.$refs.el.addEventListener('hidden.bs.toast', () => {
            self.$root.$emit('clear-message', self.message.id);
        })
        self.toast.show();
    },
    methods: {
        doAction: function() {
            const self = this;
            self.$root.$emit(self.message.action, self.message.payload);
            self.toast.hide();
        }
    }
});