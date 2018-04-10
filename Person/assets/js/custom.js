// Custom Scripts for Primal Template //

jQuery(function($) {
    "use strict";


/* --------- Wow Init ------ */

  new WOW().init();


  /* ------ Countdown ----- */

  $('#countdown').countdown({
  			date: '11/01/2016 17:00:00',
  			offset: +2,
  			day: 'Day',
  			days: 'Days'
  		}, function () {
  			alert('Done!');
  		});


/*----- Preloader ----- */

    $(window).load(function() {
  		setTimeout(function() {
        $('#loading').fadeOut('slow', function() {
        });
      }, 150);
    });


/* ------ Lightcase ----- */

jQuery(document).ready(function($) {
		$('a[data-rel^=lightcase]').lightcase();
	});


    /*----------------------------
    ------- Isotope Init -------
    -----------------------------*/

    $( window ).load(function() {

    var $container = $('.portfolio-container');
    $container.isotope({
    	filter: '*',
    });

    $('.portfolio-filter a').on('click', function () {
    	$('.portfolio-filter .active').removeClass('active');
    	$(this).addClass('active');

    	var selector = $(this).attr('data-filter');
    	$container.isotope({
    			filter: selector,
    			animationOptions: {
    					duration: 500,
    					animationEngine: "jquery"
    			}
    	});
    	return false;
    });

    });

});
