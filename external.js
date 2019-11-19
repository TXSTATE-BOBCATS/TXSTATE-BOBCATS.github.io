

// Load arcgis.js moduels
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/TileLayer",
      "esri/layers/MapImageLayer",
      "esri/widgets/BasemapGallery",
      "esri/layers/GraphicsLayer",
      "esri/tasks/QueryTask",
      "esri/tasks/support/Query",
      "dojo/_base/array",
      "dojo/dom",
      "dojo/on",
      "dojo/domReady!"
    ],
function(Map, MapView, TileLayer, MapImageLayer, BasemapGallery, GraphicsLayer, QueryTask, Query, arrayUtils, dom, on){
  // Creat a renderer (markers) for a dynamic map image layer to use later
  var LocationsRenderer = {
    type: "simple", //autocasts as new SimpleRenderer()
    //Set symbol options
    symbol: {
      type: "simple-marker", //autocasts as new SimpleMarkerSymbol()
      size: 3,
      color: "green",
      style: "circle",
      outline: {
        width: 1,
        color: "black"
      }
    },
    //Set labels
    label: "Location Name"
  };
  // Create a dynamic map image layer by referencing its URL and set layer options
  var LocationsLayer = new MapImageLayer({
    url: "https://http://www.arcgis.com/home/item.html?id=73389566a1414c69bd139dc90faa892f",
    sublayers: [
      {
        id: 0,
        renderer: LocationsRenderer,
        opacity: 0.9
      }
    ]
  });
  // Create a tile layer by referencing its URL
  var TransportationLayer = new TileLayer({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer"
  });
  // Create a map then set its basemap and tilelayers.
  var map = new Map({
    basemap: "dark-gray",
    layers: [TransportationLayer, LocationsLayer]
  });
  // Set a mapview
  var view = new MapView({
    container: "viewDiv",           // Put the mapview in a division (element id="viewDiv")
    map: map,                       // Asign the predefined map to the mapview
    zoom: 10,                       // Set zoom level
    center: [-118.2095, 34.0866]    // Set mapview center point
  });
  // Set a basemap gallery
  var basemapGallery = new BasemapGallery({
    view: view                     // Set the view from which the widget will operate
  });
  // Add widget to the top right corner of the view
  view.ui.add(basemapGallery, {
    position: "top-right"
  });
  // Execute the following callback function when the instance of the class loads. Callback function:
  view.when(function() {
    view.ui.add("optionsDiv", "bottom-right"); // Add the new division for query to the bottom-right corner of the mapview,
    on(dom.byId("doBtn"), "click", doQuery);   // Set to script to run callbak function "doQuery" on click of the query bottom.
  });
  // Set variables for attribute query selectors
  var attributeName = dom.byId("attSelect");
  var expressionSign = dom.byId("signSelect");
  var value = dom.byId("valSelect");
  // Define callbak function for on-click event of query bottom
  function doQuery(){
    resultsLayer.removeAll();   // Clear results form previous query session
    params.where = attributeName.value + expressionSign.value + value.value;  // Set where claws for query with selected values
    qTask.execute(params)       // Execute a new query task with predifined new query options "params"
      .then(getResults)         // Execute callback function "getResults" when promise resolves
      .catch(promiseRejected);  // Execute callback function "promiseRejected" when the promise is rejected
  }
  // Define callbak function for resolved promise in another callbak function
  function getResults(response) {
    // Set variables for managing multiple query results into an dojo array,
    // then iterates all the elements in the array,
    // passing them to the callback function and then returning a new array with any of the modified results.
    var popResults = arrayUtils.map(response.features, function(feature) {
        feature.popupTemplate = popupTemplate; // Set popup template to use for query results
        return feature;                        // Return arrayed query results
      });
      resultsLayer.addMany(popResults); // Add multiple query results (popResults) to a predefined graphics layer
      // Set view to the query results then execute callback function when promise resolves
      view.goTo(popResults).then(function() {
        view.popup.open({               // Open popup window with the following options
          features: popResults,         // Set features to show
          featureMenuOpen: true,        // Display multiple features in a popup in a list rather than displaying the first selected feature
          updateLocationEnabled: true   // Updates the location of popup based on
        });
      });
      // Set the HTML markup contained within the element with an id "printResults" and change the content to the number of query results found.
      dom.byId("printResults").innerHTML = popResults.length + " results found!";
  }
  // Define callbak function for rejected promise in another callbak function
  function promiseRejected(error){
    console.error("Promise rejected: ", error.message);  //Pint error message
  }
  // Set variables  feature layer to query
  var popUrl = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/CaliforniaCities/FeatureServer/0";
  // Set popup template for dsplaying query results
  var popupTemplate = {
    title: "{City}",
    fieldInfos: [{
      fieldName: "Population", // Set field name to display in popups
      label: "Population",     // Set field alias
      // Set formatting options for numerical fields
      format: {
        places: 0,             // Specify the number of supported decimal places that should appear in popups
        digitSeperator: true   // Set digit seperator to appear in popups
      }
    }, {
      fieldName: "Household", // Set field name to display in popups
      label: "Household",     // Set field alias
      // Set formatting options for numerical fields
      format: {
        places: 0,             // Specify the number of supported decimal places that should appear in popups
        digitSeperator: true   // Set digit seperator to appear in popups
      }
    }],
    // Set template for defining and formatting the popup's content
    content: "<b>Population:</b> {Population} " + "<br><b>Households:</b> {Household}" + "<br><b>Latitude:</b> {Latitude}" + "<br><b>Longitude:</b> {Longitude}"
  };
  // Set variables for new GraphicsLayer
  var resultsLayer = new GraphicsLayer();
  // Set variables for new QueryTask
  var qTask = new QueryTask({
    url: popUrl
  });
  // Set variables for new Query options (parameters for executing queries)
  var params = new Query({
    returnGeometry: true,
    outFields:["*"]
  });
});
