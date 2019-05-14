var history = new Vue({
    el: '#history',
    data: {
      tfoURL: 'http://www.transferology.com/',
      tfolURL: 'http://www.transferologylab.com/',
    },
    methods: {
      humanizeURL: function (url) {
        return url
          .replace(/^https?:\/\//, '')
          .replace(/\/$/, '');
      },
      getWiki: function(url) {
          return 'https://en.wikipedia.org/wiki/' + url;
      }
    }
});