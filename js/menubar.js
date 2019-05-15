Vue.component('menu-bar', {
    data: function() {
        return {
            home: '/',
            neighborsGif: '/img/neighbors.gif',
            history: '/history.html',
            bb: '/brickbreaker.html',
            tennis: '/tennis.html',
            snake: '/snake.html',
        };
    },
    template: `<header class="navbar-expand-lg w-100 fixed-top">
    <div class="d-inline-flex w-100" role="navigation">
      <a class="d-inline pl-2" :href="home"><img v-bind:src="neighborsGif" alt="logo" class="pt-2" style="height:44px;"></a>
      <nav class="navbar navbar-expand-lg w-100 py-0" role="navigation" title="Main Row of Main Navigation">
        <ul class="nav navbar-nav d-inline">
          <li class="d-inline">
            <a :href="history" class="p-0" title="History">History</a>
          </li>
          <li class="dropdown d-inline">
            <a href="#" class="dropdown-toggle p-0" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Games<span class="caret"></span></a>
            <ul class="dropdown-menu mt-3" style="float:left;position:absolute;">
              <li><a :href="bb" title="Brick Breaker">Brick Breaker</a></li>
              <li role="separator" class="dropdown-divider"></li>
              <li><a :href="tennis" title="Tennis">Tennis</a></li>
              <li role="separator" class="dropdown-divider"></li>
              <li><a :href="snake" title="Snake">Snake</a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </header>`
});
new Vue({ el: '#menubar' });