import { Component, OnInit } from '@angular/core';

import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor() { }
  async initializeMap() {
    try {


      const [Map, MapView, GroupLayer, MapImageLayer, LayerList, Slider, SceneView,
        Home,Locate, BasemapGallery,CoordinateConversion,Expand] = await loadModules([

          "esri/Map",
          "esri/views/MapView",
          "esri/layers/GroupLayer",
          "esri/layers/MapImageLayer",
          "esri/widgets/LayerList",
          "esri/widgets/Slider","esri/views/SceneView", "esri/widgets/Home", "esri/widgets/Locate",
          "esri/widgets/BasemapGallery",
          "esri/widgets/CoordinateConversion",
          "esri/widgets/Expand",
          "esri/widgets/BasemapGallery"

      ]);
      const apiKey = "AAPKbbbbe4d9675f40cead3f30cf916a1067sDFTApekQDbMPJdmX1FycG0mHsTqi7zbOrSXTQWDEAlCDkxbeA4h6RbrPxYyOm09";


      // Create layer showing sample census data of the United States.
        // Set visibility to false so it's not visible on startup.
        // Create layer showing sample data of the United States.
        const USALayer = new MapImageLayer({
          url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer",
          title: "US Sample Data"
        });

        const censusLayer = new MapImageLayer({
          url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer",
          title: "US Sample Census",
          visible: false
        });

        // Create GroupLayer with the two MapImageLayers created above
        // as children layers.

        const demographicGroupLayer = new GroupLayer({
          title: "US Demographics",
          visible: true,
          visibilityMode: "exclusive",
          layers: [USALayer, censusLayer],
          opacity: 0.75
        });

        // Create a map and add the group layer to it

        const map = new Map({
          basemap: "gray-vector",
          layers: [demographicGroupLayer],
          // basemap: "streets-vector",
          ground: "world-elevation"
        });

        // Add the map to a MapView

        const view = new SceneView({
          center: [-98.5795, 39.8282],
          zoom: 3,
          container: "viewDiv",
          map: map
        });

        // Creates actions in the LayerList.

        async function defineActions(event: { item: any; }) {
          // The event object contains an item property.
          // is is a ListItem referencing the associated layer
          // and other properties. You can control the visibility of the
          // item, its title, and actions using this object.

          const item = event.item;

          await item.layer.when();

          if (item.title === "US Demographics") {
            // An array of objects defining actions to place in the LayerList.
            // By making this array two-dimensional, you can separate similar
            // actions into separate groups with a breaking line.

            item.actionsSections = [
              [
                {
                  title: "Go to full extent",
                  className: "esri-icon-zoom-out-fixed",
                  id: "full-extent"
                },
                {
                  title: "Layer information",
                  className: "esri-icon-description",
                  id: "information"
                }
              ],
              [
                {
                  title: "Increase opacity",
                  className: "esri-icon-up",
                  id: "increase-opacity"
                },
                {
                  title: "Decrease opacity",
                  className: "esri-icon-down",
                  id: "decrease-opacity"
                }
              ]
            ];
          }

          // Adds a slider for updating a group layer's opacity
          if (item.children.length > 1 && item.parent) {
            const slider = new Slider({
              min: 0,
              max: 1,
              precision: 2,
              values: [1],
              visibleElements: {
                labels: true,
                rangeLabels: true
              }
            });

            item.panel = {
              content: slider,
              className: "esri-icon-sliders-horizontal",
              title: "Change layer opacity"
            };

            slider.on("thumb-drag", (event: { value: any; }) => {
              const { value } = event;
              item.layer.opacity = value;
            });
          }
        }

        view.when(() => {
          // Create the LayerList widget with the associated actions
          // and add it to the top-right corner of the view.

          const layerList = new LayerList({
            view: view,
            // executes for each ListItem in the LayerList
            listItemCreatedFunction: defineActions
          });

          // Event listener that fires each time an action is triggered

          layerList.on("trigger-action", (event:any) => {
            // The layer visible in the view at the time of the trigger.
            const visibleLayer = USALayer.visible ? USALayer : censusLayer;

            // Capture the action id.
            const id = event.action.id;

            if (id === "full-extent") {
              // if the full-extent action is triggered then navigate
              // to the full extent of the visible layer
              view.goTo(visibleLayer.fullExtent).catch((error: { name: string; }) => {
                if (error.name != "AbortError") {
                  console.error(error);
                }
              });
            } else if (id === "information") {
              // if the information action is triggered, then
              // open the item details page of the service layer
              window.open(visibleLayer.url);
            } else if (id === "increase-opacity") {
              // if the increase-opacity action is triggered, then
              // increase the opacity of the GroupLayer by 0.25

              if (demographicGroupLayer.opacity < 1) {
                demographicGroupLayer.opacity += 0.25;
              }
            } else if (id === "decrease-opacity") {
              // if the decrease-opacity action is triggered, then
              // decrease the opacity of the GroupLayer by 0.25

              if (demographicGroupLayer.opacity > 0) {
                demographicGroupLayer.opacity -= 0.25;
              }
            }
          });

          // Add widget to the top right corner of the view
          view.ui.add(layerList, "top-right");
        });
        const map1 = new Map({
          basemap: "streets-vector",
          ground: "world-elevation"
        });



        const homeBtn = new Home({
          view: view
        });

        // Add the home button to the top left corner of the view
        view.ui.add(homeBtn, "top-left");
        const locateBtn = new Locate({
          view: view
        });

        // Add the locate widget to the top left corner of the view
        view.ui.add(locateBtn, {
          position: "top-left"
        });
        const basemapGallery = new BasemapGallery({
          view: view,
          container: document.createElement("div")
        });

        // Create an Expand instance and set the content
        // property to the DOM node of the basemap gallery widget
        // Use an Esri icon font to represent the content inside
        // of the Expand widget




        const ccWidget = new CoordinateConversion({
          view: view
        });

        view.ui.add(ccWidget, "bottom-left");
        const bgExpand = new Expand({
          view: view,
          content: basemapGallery
        });

        // close the expand whenever a basemap is selected
        basemapGallery.watch("activeBasemap", () => {
          const mobileSize =
            view.heightBreakpoint === "xsmall" ||
            view.widthBreakpoint === "xsmall";

          if (mobileSize) {
            bgExpand.collapse();
          }
        });

        // Add the expand instance to the ui

        view.ui.add(bgExpand, "top-right");
    } catch (error) {
      alert('We have an error: ' + error);
    }
    // Add the widget to the top-right corner of the view

  }

  ngOnInit(): void {
    this.initializeMap();
  }

}
