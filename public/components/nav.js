Vue.component('navigation', {
    data() {
        return {}
    },
    props: ['pages'],
    template: /*html*/`
        <div class="row mb-2">
            <ul class="nav nav-pills nav-fill">
                <li v-for="page in pages" class="nav-item">
                    <a class="nav-link" :class="{ active: page.current }" aria-current="page" :href="page.path" @click.prevent="navTo(page)">{{page.title}}</a>
                </li>
            </ul>
        </div>
    `,
    mounted: function() {
        const self = this;
        self.pages.forEach(page => {
            page.current = page.path == document.location.pathname; 
        });
        if ( !self.pages.find(page => page.current) ) {
            self.pages.find(page => page.path == '/').current = true;
            window.history.replaceState({}, '', '/');
        }
        window.addEventListener('popstate', (event) => {
            self.pages.forEach(page => {
                page.current = page.path == document.location.pathname; 
            });
        });
    },
    computed: {

    },
    methods: {
        navTo: function(navPage) {
            this.pages.forEach(page => {
               page.current = page.path == navPage.path; 
            });
            window.history.pushState({}, '', navPage.path);
        }
    },
});