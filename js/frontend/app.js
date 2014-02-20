var App = {
  Controller: {},
  View: {},
  Model: {},
  Page: {}
};

App.throttle = function(handler, time) {
  var throttle;
  time = time || 300;
  return function() {
    var args = arguments,
     context = this;
    clearTimeout(throttle);
    throttle = setTimeout(function() {
      handler.apply(context, args);
    }, time);
  };
};

App.loader = function (hasToShow, copy) {
    var $el = $('.popcorn-load');

    if (hasToShow === true && !$el.hasClass('hidden') ||
        hasToShow === false && $el.hasClass('hidden')) {
        return false;
    }

    if (hasToShow === true) {
        $el.find('.text').html(copy ? copy : Language.loading);
    }

    $el[hasToShow === false ? 'addClass' : 'removeClass']('hidden');
    
    if( ! hasToShow ) { 
      $el.removeClass('withProgressBar');
      $el.find('.progress').css('width', 0.0+'%');
    }
};

// Show by default
App.loader(true, Language.loading);

// Handler for Video opening
window.spawnCallback = function (url, subs) {
    var subtracks = '';
    for( lang in subs ) {
      subtracks += '<track kind="subtitles" src="app://host/' + subs[lang] + '" srclang="es" label="' + Languages[lang] + '" charset="utf-8" />';
    }

    var player =
      '<video autoplay id="video_player" width="100%" height="100%" class="video-js vjs-default-skin" controls>' +
        '<source src="' + url + '" type="video/mp4" />' +
        subtracks +
      '</video>' +
      '<a href="javascript:;" id="video_player_close" class="btn-close"><img src="/images/close.svg" width="50" /></a>';

    if (!document.createElement('video').canPlayType('video/mp4')) {
      return alert('Weird, but it seems the application is broken and you can\'t play this video.');
    }

    // Move this to a separate view.
    $('#video-container').html(player).show();

    // Init video.
    var video = videojs('video_player');

    // Enter full-screen
    $('.vjs-fullscreen-control').on('click', function () {
      win.toggleKioskMode();
    });

    // Close player
    $('#video_player_close').on('click', function () {
      win.leaveKioskMode();
      $('#video-container').hide();
      video.dispose();
      $(document).trigger('videoExit');
    });

    video.player().on('pause', function () {  });
    video.player().on('play', function () { 
      // Trigger a resize so the subtitles are adjusted
      $(window).trigger('resize'); 
    });

    App.loader(false);
};


// Change the subtitle size on resize so it fits the screen proportionally
jQuery(function ($) {
  $(window).resize(function(){

    // Calculate a decent font size
    // Baseline: WindowHeight:600px -> FontSize:20px
    var font_size = Math.ceil($(window).height() * 0.0333333);
    var min_font_size = 18;
    font_size = font_size < min_font_size ? min_font_size : font_size

    $('#video-container').css('font-size', font_size+'px');

    // And adjust the subtitle position so they always match the bottom of the video 
    var $video = $('#video-container video');
    var $subs = $('#video-container .vjs-text-track-display');
    if( $video.length && $subs.length ) {
      if( $video[0].videoWidth > 0 && $video[0].videoHeight > 0 ) {
        var ratio = $video[0].videoWidth / $video[0].videoHeight;
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();

        var realVideoHeight = windowWidth / ratio;
        realVideoHeight = realVideoHeight > windowHeight ? windowHeight : realVideoHeight;

        var bottomOffset = (windowHeight - realVideoHeight) / 2;

        $subs.css('bottom', bottomOffset+'px');
      }
    }

  }).trigger('resize');
});


// On Document Ready
jQuery(function ($) {
  $('.btn-os.min').on('click', function () {
    win.minimize();
  });

  $('.btn-os.close').on('click', function () {
    win.close();
  });

  $('#catalog-select ul li a').on('click', function (evt) {
    $('#catalog-select ul li.active').removeClass('active');
    $(this).parent('li').addClass('active');

    var genre = $(this).data('genre');

    if (genre == 'all') {
      App.Router.navigate('index.html', { trigger: true });
    } else {
      App.Router.navigate('filter/' + genre, { trigger: true });
    }
  });

  $('.search input').on('keypress', function (evt) {
    var term = $.trim($(this).val());

    // ENTER KEY
    if (evt.keyCode === 13) {
       if (term) {
          App.Router.navigate('search/' + term, { trigger: true });
        } else {
          App.Router.navigate('index.html', { trigger: true });
        }
        $('#catalog-select ul li.active').removeClass('active');
      }
  });
});