var map = L.map('map').setView([29.8884, -97.9384], 14);
mapLink =
    '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
    }).addTo(map);


// return a absolute center point of features
function center(features){
  var points = turf.multiPoint(features);
  var featureColl = turf.featureCollection([
    points
  ]);

  var polygon1 = turf.polygon([features],{name:'polygon1'});
  L.geoJson(polygon1, {color: "gray", fillColor: "yellow"}).addTo(map);
  var centerPt = turf.center(featureColl);
  var result = L.geoJson(centerPt, {color: "red"}).addTo(map);
  var centerLatLon = turf.getCoords(centerPt)
  result.bindPopup("Absolute center point (lon,lat): <br>" + centerLatLon).addTo(map);
  //document.getElementById('testtext').innerHTML = turf.getCoords(centerPt);
  map.flyTo([29.8888036, -97.9423239],18);

  //Author Info
  document.getElementById("authors").innerHTML = "<a href='https://irinaramirez9.github.io/' target='_blank'>Irina Ramirez</a><br><a href='https://TingHsuanYang24.github.io/' target='_blank'>TingHsuan Yang</a>";
}
