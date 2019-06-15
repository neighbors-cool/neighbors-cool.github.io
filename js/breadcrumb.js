Vue.component('bread-crumb', {
    data: function() {
        return {
            home: '/',
        };
    },
    props: ['title'],
    template: `<ol class="breadcrumb d-inline-flex p-0 m-0">
                <li><a :href="home" title="Home">Home</a></li>
                <li class="active"><h1 class="h5 d-inline">{{ title }}</h1></li>
            </ol>`
});
new Vue({ el: '#breadcrumb' });