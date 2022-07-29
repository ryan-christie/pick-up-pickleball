Vue.component('messages', {
    data() {
        return {}
    },
    props: ['popMsg'],
    template: /*html*/`
        <div class="pop-msg">
            <h3>Messages</h3>
            <p v-for="msg in popMsg">{{ msg }}</p>
        </div>
    `
});