Vue.component('bread-crumb', {
    data: function() {
        return {
            home: '/',
        };
    },
    props: ['title'],
    template: `<ol class="breadcrumb p-0 m-0">
                <li><a :href="home" title="Home">Home</a></li>
                <li class="active">{{ title }}</li>
            </ol>`
});
new Vue({ el: '#breadcrumb' });