$(document).ready(function(){

  // Get the header height
  var headerHeight = $('nav').outerHeight();

  $('.slide-section').click(function(e){
    var link = $(this).attr('href');
    console.log()

    $('html, body').animate({
      scrollTop: $(link).offset().top - headerHeight
    }, 1000)
    e.preventDefault();
  });
});