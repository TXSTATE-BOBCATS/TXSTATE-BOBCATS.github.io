// Load arcgis.js moduels
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/TileLayer",
      "esri/layers/MapImageLayer",
      "esri/layers/FeatureLayer",
      "esri/widgets/BasemapToggle",
      "esri/widgets/Fullscreen",
      "esri/widgets/Search",
      "esri/widgets/TimeSlider",
      "esri/widgets/Legend",
      "esri/widgets/LayerList",
      "esri/layers/GraphicsLayer",
      "esri/tasks/QueryTask",
      "esri/tasks/support/Query",
      "esri/layers/support/Field",
      "esri/intl",
      "esri/popup/support/FieldInfoFormat",
      "dojo/_base/array",
      "dojo/dom",
      "dojo/on",
      "dojo/domReady!"
    ],
function(Map, MapView, TileLayer, MapImageLayer, FeatureLayer, BasemapToggle, Fullscreen, Search, TimeSlider, Legend, LayerList, GraphicsLayer, QueryTask, Query, Field, intl, FieldInfoFormat, arrayUtils, dom, on){
  // Create feature layers displaying data of ITC fire and air monitoring
  var MonitoringLayer = new FeatureLayer({
    url: "https://services5.arcgis.com/w5EzInDqtu24PScU/arcgis/rest/services/ITC_Air_Monitoring_Map(BZ)/FeatureServer/0",
    outFields: ["DateTime","Type","VOC","Benzene","Xylene","Toluene", "Naptha", "H2S", "CO", "PM", "Agency", "Detected"],
    popupTemplate: popupTemplate,
  });
  var ITCTanksLayer = new FeatureLayer({
    url: "https://services5.arcgis.com/w5EzInDqtu24PScU/arcgis/rest/services/ITC_Fire_Map/FeatureServer/0",
    outFields: ["Name","SymbolID","PopupInfo","TankConten"],
    popupTemplate: iTCTanksTemplate,
  });
  var ITCFireBoundaryLayer = new FeatureLayer({
    url: "https://services5.arcgis.com/w5EzInDqtu24PScU/arcgis/rest/services/ITC_Fire_Map/FeatureServer/1",
    outFields: ["Name","Shape_Area"],
    popupTemplate: iTCBoundaryTemplate,
  });

  var ITCBoundaryLayer = new FeatureLayer({
    url: "https://services5.arcgis.com/w5EzInDqtu24PScU/arcgis/rest/services/ITC_Fire_Map/FeatureServer/2",
    outFields: ["Name","Shape_Area"],
    popupTemplate: iTCBoundaryTemplate,
  });

  // Create popup templates for ITC fire related features
  var iTCTanksTemplate = {
    title: "{Name}",
    content: "<b>Tank content:</b> {TankConten}<br>" +
             "<b>Description:</b> {PopupInfo}<br>",
    fieldInfos: [
      {
        fieldName: "Name", // Set field name to display in popups
        label: "Name",     // Set field alias
      },{
        fieldName: "TankConten", // Set field name to display in popups
        label: "TankConten",     // Set field alias
      },{
        fieldName: "PopupInfo", // Set field name to display in popups
        label: "PopupInfo",     // Set field alias
      },
    ]
  };
  var iTCBoundaryTemplate = {
    title: "{Name}",
    content: "<b>Area:</b> {Shape_Area}<br>",
    fieldInfos: [
      {
        fieldName: "Name", // Set field name to display in popups
        label: "Name",     // Set field alias
      },{
        fieldName: "Shape_Area", // Set field name to display in popups
        label: "Shape_Area",     // Set field alias
      },
    ]
  };

  // Create a tile layer by referencing its URL
  var WorldMapaLayer = new TileLayer({
    url: "https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer"
  });
  /*
  // Create HeatMap, set heatmap renderer
  var heatRenderer = {
    type: "heatmap",
    colorStops: [
      { color: "rgba(63, 40, 102, 0)", ratio: 0 },
      { color: "#472b77", ratio: 0.083 },
      { color: "#4e2d87", ratio: 0.166 },
      { color: "#563098", ratio: 0.249 },
      { color: "#5d32a8", ratio: 0.332 },
      { color: "#6735be", ratio: 0.415 },
      { color: "#7139d4", ratio: 0.498 },
      { color: "#7b3ce9", ratio: 0.581 },
      { color: "#853fff", ratio: 0.664 },
      { color: "#a46fbf", ratio: 0.747 },
      { color: "#c29f80", ratio: 0.83 },
      { color: "#e0cf40", ratio: 0.913 },
      { color: "#ffff00", ratio: 1 }
    ],
    maxPixelIntensity: 25,
    minPixelIntensity: 0
  };

  var HeatMapLayer = new GraphicsLayer({
    url: "https://services5.arcgis.com/w5EzInDqtu24PScU/arcgis/rest/services/ITC_Air_Monitoring_Map(BZ)/FeatureServer/0",
    popupTemplate: popupTemplate,
    renderer: heatRenderer
  });
  */
  // Create a map then set its basemap and tilelayers.
  var map = new Map({
    basemap: "topo-vector",
    layers: [WorldMapaLayer, ITCBoundaryLayer, ITCFireBoundaryLayer,ITCTanksLayer, MonitoringLayer]
  });

  // Set a mapview
  var view = new MapView({
    container: "viewDiv",           // Put the mapview in a division (element id="viewDiv")
    map: map,                       // Asign the predefined map to the mapview
    zoom: 12,                       // Set zoom level
    center: [-95.096093, 29.734190]    // Set mapview center point
  });

  /*// Add heat map legent to view
  view.ui.add(
    new Legend({
      view: view
    }),
    "bottom-left"
    );
  */
  // Set on-hover feature pop-up info window
  view.on("click", function(event){
    view.popup.open({
      // Set the popup
      location: event.mapPoint,
      fetchFeatures: true,
      popupTemplate: popupTemplate
    });
  });

  // Set full screen button
  fullscreen = new Fullscreen({
    view: view
  });
  view.ui.add(fullscreen, {
    position: "top-left",
  });

  // Set location/place/address search widget.
  var searchWidget = new Search({
    view: view
    });
    // Adds the search widget below other elements in the top left corner of the view
    view.ui.add(searchWidget, {
      position: "top-right",
      index: 2
    });

    // Set a layer list and switching controller
    var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: function (event){
        const item = event.item;
        if (item.layer.type != "group") {
          // don't show legent twice
          item.panel = {
            content: "legend",
            open: false
          };
        }
      }
    });
    // Adds widget below other elements in the top left corner of the view
    view.ui.add(layerList, "top-right");

    // Set a basemap toggle
  var basemapToggle = new BasemapToggle({
    view: view                     // Set the view from which the widget will operate
    });
    // Add widget to the top right corner of the view
    view.ui.add(basemapToggle, {
      position: "bottom-left",
      nextBasemap: "hybrid"
    });

  // Execute the following callback function when the instance of the class loads. Callback function:
  view.when(function() {
    view.ui.add("optionsDiv", "bottom-right"); // Add the new division for query to the bottom-right corner of the mapview,
    on(dom.byId("doBtn"), "click", doQuery);   // Set to script to run callbak function "doQuery" on click of the query bottom.
  });
  /*
  // Set buffer tool
  on(dom.byId("buffer"), 'click', function(evt){
    var params = new BufferParameters();
    params.distances = [10];
    params.bufferSpatialReference = map.spatialReference;
    params.outSpatialReference = map.spatialReference;
    params.unit = GeometryService.UNIT_STATUTE_MILE
    console.log(graphic);
    params.geometries = [graphic.geometry];
    console.log(params);
    gs.buffer(params, showBuffer);
  })

  function showBuffer(bufferedGeometries) {
    console.log(bufferedGeometries);
    var symbol = new SimpleFillSymbol("none", new SimpleLineSymbol("dashdot", new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));

    array.forEach(bufferedGeometries, function (geometry) {
        graphic = new Graphic(geometry, symbol);
        map.graphics.add(graphic);
    });
  }
*/
/*
  // Set hover-on pop-up displaying feature FieldInfoFormatview.on("click", function(event){
  view.on("hover", function(event){
    view.popup.location = event.mapPoint;
    // Displays the popup
    view.popup.visible = true;
  });

  // Set Time TimeSlider
  var timeSlider = new TimeSlider({
    container: "timeSliderDiv",
    view: view,
    mode: "time-window",
    fullTimeExtent: {
      start: new Date(2019, 0, 1),
      end: new Date(2019, 0, 1)
    },
    values:[
      new Date(2019,0,1),
      new Date(2019,1,1)
    ]
  });
  view.ui.add(timeSlider, "manually");
  */
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
  var airUrl = "https://services5.arcgis.com/w5EzInDqtu24PScU/ArcGIS/rest/services/ITC_Air_Monitoring_Map/FeatureServer/0";
  // Set popup template for dsplaying query results
  var popupTemplate = {
    title: "{DateTime}",
    content: "<b>Monitoring Date & Time:</b>{DateTime}<br>" +
             "<b>Type:</b> {Type}<br>" +
             "<b>VOC (ppm):</b> {VOC}<br>" +
             "<b>Benzene (ppm):</b> {Benzene}<br>" +
             "<b>Xylene (ppm):</b> {Xylene}<br>" +
             "<b>Toluene (ppm):</b> {Toluene}<br>" +
             "<b>Naptha (ppm):</b> {Naptha}<br>" +
             "<b>H2S (ppm):</b> {H2S}<br>" +
             "<b>CO (ppm):</b> {CO}<br>" +
             "<b>PM (ug/m3):</b> {PM}<br>" +
             "<b>Agency:</b> {Agency}",
    fieldInfos: [{
      fieldName: "DateTime",
      format: {
        dateFormat: "short-date-le-short-time"
        }
      },{
        fieldName: "Type", // Set field name to display in popups
        label: "Type",     // Set field alias
      },{
        fieldName: "VOC", // Set field name to display in popups
        label: "VOC",     // Set field alias
        // Set formatting options for numerical fields
        format: {
          places: 2,             // Specify the number of supported decimal places that should appear in popups
          digitSeperator: true   // Set digit seperator to appear in popups
        }
      },{
          fieldName: "H2S", // Set field name to display in popups
          label: "H2S",     // Set field alias
          // Set formatting options for numerical fields
          format: {
            places: 2,             // Specify the number of supported decimal places that should appear in popups
            digitSeperator: true   // Set digit seperator to appear in popups
          }
      },{
          fieldName: "CO", // Set field name to display in popups
          label: "CO",     // Set field alias
          // Set formatting options for numerical fields
          format: {
            places: 0,             // Specify the number of supported decimal places that should appear in popups
            digitSeperator: true   // Set digit seperator to appear in popups
          }
      },{
          fieldName: "PM", // Set field name to display in popups
          label: "PM",     // Set field alias
          // Set formatting options for numerical fields
          format: {
            places: 0,             // Specify the number of supported decimal places that should appear in popups
            digitSeperator: true   // Set digit seperator to appear in popups
          }
      },{
          fieldName: "Benzene", // Set field name to display in popups
          label: "Benzene",     // Set field alias
          // Set formatting options for numerical fields
          format: {
            places: 0,             // Specify the number of supported decimal places that should appear in popups
            digitSeperator: true   // Set digit seperator to appear in popups
          }
      },{
          fieldName: "Xylene", // Set field name to display in popups
          label: "Xylene",     // Set field alias
          // Set formatting options for numerical fields
          format: {
            places: 0,             // Specify the number of supported decimal places that should appear in popups
            digitSeperator: true   // Set digit seperator to appear in popups
          }
      },{
          fieldName: "Toluene", // Set field name to display in popups
          label: "Toluene",     // Set field alias
          // Set formatting options for numerical fields
          format: {
            places: 0,             // Specify the number of supported decimal places that should appear in popups
            digitSeperator: true   // Set digit seperator to appear in popups
          }
      },{
          fieldName: "Naptha", // Set field name to display in popups
          label: "Naptha",     // Set field alias
          // Set formatting options for numerical fields
          format: {
            places: 0,             // Specify the number of supported decimal places that should appear in popups
            digitSeperator: true   // Set digit seperator to appear in popups
          }
      },{
          fieldName: "Agency", // Set field name to display in popups
          label: "Agency",     // Set field alias
      },{
          fieldName: "Detected", // Set field name to display in popups
          label: "Detected",     // Set field alias
      }
    ],
  };
  // Set variables for new GraphicsLayer
  var resultsLayer = new GraphicsLayer();
  // Set variables for new QueryTask
  var qTask = new QueryTask({
    url: airUrl
  });
  // Set variables for new Query options (parameters for executing queries)
  var params = new Query({
    returnGeometry: true,
    outFields:["*"]
  });
});
