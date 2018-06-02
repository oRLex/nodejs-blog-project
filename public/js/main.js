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

// Map

function initMap(){
  let options = {
    zoom: 16,
    center: {lat: 50.466277, lng: 30.638187}
  }

  let map = new google.maps.Map(document.getElementById('map'), options)

  // Marker
  let marker = new google.maps.Marker({
    position: {lat: 50.466277, lng: 30.638187},
    map: map
  })

  let infoWindow = new google.maps.InfoWindow({
    content: `
      <h3>Ми тут</h3>
      <a href="https://goo.gl/maps/BfmjmZnxdp42">Україна, 02156, м. Київ, вул. Кіото, 19, Корпус Б</a>
    `
  });

  marker.addListener('click', function(){
    infoWindow.open(map, marker)
  })

}