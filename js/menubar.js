Vue.component('menu-bar', {
    data: function() {
        return {
            home: '/',
            neighborsGif: '/img/neighbors.gif',
            history: '/history.html',
            bb: '/brickbreaker.html',
            tennis: '/tennis.html',
            snake: '/snake.html',
            projects: '/projects.html',
        };
    },
    template: `<header class="navbar-expand-lg w-100 fixed-top">
    <div class="d-inline-flex w-100" role="navigation">
      <a class="d-inline pl-2" :href="home"><img v-bind:src="neighborsGif" alt="logo" class="pt-2" style="height:44px;"></a>
      <nav class="navbar navbar-expand-lg w-100" role="navigation" title="Main Row of Main Navigation">

          <a href="#" class="dropdown-toggle btn d-sm-none p-1 ml-auto" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Menu<span class="caret"></span></a>
          <ul class="dropdown-menu dropdown-menu-right mt-3 d-sm-none p-1">
            <li><a :href="history" class="p-0" title="History">History</a></li>
            <li role="separator" class="dropdown-divider"></li>
            <li><a :href="bb" title="Brick Breaker">Brick Breaker</a></li>
            <li role="separator" class="dropdown-divider"></li>
            <li><a :href="tennis" title="Tennis">Tennis</a></li>
            <li role="separator" class="dropdown-divider"></li>
            <li><a :href="snake" title="Snake">Snake</a></li>
            <li role="separator" class="dropdown-divider"></li>
            <li><a :href="projects" title="Projects">Projects</a></li>
          </ul>
      
        <ul class="nav navbar-nav d-none d-sm-inline">
          <li class=" d-none d-sm-inline">
            <a :href="history" class="p-0" title="History">History</a>
          </li>
          <li class="dropdown d-none d-sm-inline">
            <a href="#" class="dropdown-toggle p-0" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Games<span class="caret"></span></a>
            <ul class="dropdown-menu mt-3" style="position:absolute;">
              <li><a :href="bb" title="Brick Breaker">Brick Breaker</a></li>
              <li role="separator" class="dropdown-divider"></li>
              <li><a :href="tennis" title="Tennis">Tennis</a></li>
              <li role="separator" class="dropdown-divider"></li>
              <li><a :href="snake" title="Snake">Snake</a></li>
            </ul>
          </li>
          <li class="dropdown d-none d-sm-inline">
            <a href="#" class="dropdown-toggle p-0" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Projects<span class="caret"></span></a>
            <ul class="dropdown-menu mt-3" style="position:absolute;">
              <li><a :href="projects" title="Projects">Projects</a></li>
            </ul>
          </li>
        </ul>

      </nav>
    </div>
    <hr class="m-0" />
  </header>`
});
new Vue({ el: '#menubar' });