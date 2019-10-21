
var map = L.map('map').setView([29.8884, -97.9384], 14);
mapLink =
    '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
    }).addTo(map);


function campus(point){
  var location =turf.point(point);
  var buffered = turf.buffer(location, 2, {units: 'miles'});
  L.geoJson(buffered, {color: "red"}).addTo(map);
  //buffered.addTo(map);
}
