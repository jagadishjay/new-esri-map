import { Component, OnInit } from '@angular/core';
import { loadModules } from 'esri-loader';
import esri = __esri;
import { HttpClient } from "@angular/common/http";
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }
  layersData: Array<Object> = [];
  layersData1: Array<Object> = [];
  errorMessage: any;
  async initializeMap() {
    try {


      const [Map, MapView, Directions, RouteLayer, GroupLayer, MapImageLayer, EsriFeatureLayer, LayerList, Slider, SceneView, Search,
        Home, Locate, BasemapGallery, CoordinateConversion, Expand, Legend, WebMap,] = await loadModules([

          "esri/Map",
          "esri/views/MapView",
          "esri/widgets/Directions",
          "esri/layers/RouteLayer",
          "esri/layers/GroupLayer",
          "esri/layers/MapImageLayer",
          'esri/layers/FeatureLayer',
          "esri/widgets/LayerList",
          "esri/widgets/Slider",
          "esri/views/SceneView",
          "esri/widgets/Search",
          "esri/widgets/Home",
          "esri/widgets/Locate",
          "esri/widgets/BasemapGallery",
          "esri/widgets/CoordinateConversion",
          "esri/widgets/Expand",
          "esri/widgets/Legend",
          "esri/WebMap",
          "esri/widgets/BasemapGallery",


        ]);
      const apiKey = "";
      // create a new RouteLayer, required for Directions widget
      // create a new RouteLayer, required for Directions widget
      const routeLayer = new RouteLayer();
      // new RouteLayer must be added to the map


      // Create layer showing sample census data of the United States.
      // Set visibility to false so it's not visible on startup.
      // Create layer showing sample data of the United States.
      // const USALayer = new MapImageLayer({
      //   url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer",
      //   title: "US Sample Data"
      // });
      const USALayer = new MapImageLayer({
        url: "https://demo.satragroup.in/arcgis/rest/services/RRAMS_Dmo/StateAssets/MapServer",
        title: "StateAssets"
      });

      const censusLayer = new MapImageLayer({
        url: "https://demo.satragroup.in/arcgis/rest/services/RRAMS_Dmo/TrafficStations/MapServer",
        title: "TrafficSt",
        visible: false
      });


      // Create GroupLayer with the two MapImageLayers created above
      // as children layers.
      this.layersData.forEach((item: any) => {
        if (item.MapUrl.includes("arcgis")) {
          const layer: esri.FeatureLayer = new MapImageLayer({
            title: item.LayerName,
            url: item.MapUrl,
            outFields: ["*"],
          });
          this.layersData1.push(layer);
          //demographicGroupLayer.add(layer);
        }

      });
      const demographicGroupLayer = new GroupLayer({
        title: "Layers List",
        visible: true,
        visibilityMode: "exclusive",
        layers: this.layersData1,
        opacity: 0.75
      });

      // Create a map and add the group layer to it

      const map = new WebMap({
        basemap: "gray-vector",
        layers: [routeLayer, demographicGroupLayer],
        //basemap: "topo-vector",
        ground: "world-elevation",
        portalItem: {
          // autocasts as new PortalItem()
          id: "10f5128431d44f9180d9936834100ac5"
        }
      });



      // Add the map to a MapView

      const view = new SceneView({
        center: [-98.5795, 39.8282],
        zoom: 3,
        container: "viewDiv",
        map: map
      });
      // new RouteLayer must be added to Directions widget
      let directionsWidget = new Directions({
        layer: routeLayer,
        apiKey,
        view
      });

      // Add the Directions widget to the top right corner of the view
      view.ui.add(directionsWidget, {
        position: "top-right"
      });
      // Creates actions in the LayerList.

      async function defineActions(event: { item: any; }) {
        // The event object contains an item property.
        // is is a ListItem referencing the associated layer
        // and other properties. You can control the visibility of the
        // item, its title, and actions using this object.

        const item = event.item;

        await item.layer.when();

        if (item.title === "Layers List") {
          // if (true) {
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

        layerList.on("trigger-action", (event: any) => {
          // The layer visible in the view at the time of the trigger.
         // const visibleLayer = USALayer.visible ? USALayer : censusLayer;
          const visibleLayer = demographicGroupLayer['uid']
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
        view.ui.add(layerList, "top-left");
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

      // view.ui.add(ccWidget, "bottom-left");
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
      // add a legend widget instance to the view
      // and set the style to 'card'. This is a
      // responsive style, which is good for mobile devices

      const legend = new Expand({
        content: new Legend({
          view: view,
          style: "card" // other styles include 'classic'
        }),
        view: view,
        expanded: true
      });
      view.ui.add(legend, "bottom-right");
      const searchWidget = new Search({
        view: view
      });

      // Add the search widget to the top right corner of the view
      view.ui.add(searchWidget, {
        position: "top-right"
      });
    } catch (error) {
      alert('We have an error: ' + error);
    }
    // Add the widget to the top-right corner of the view

  }
  getlayerData() {
    // this.httpClient.get<any>("assets/layersData.json").subscribe((data)=>
    //   this.layerdData1=data
    // )
    this.httpClient.get<any>('assets/layers.json').subscribe({
      next: data => {
        this.layersData = data.Data
        console.log(this.layersData)

      },
      error: error => {
        this.errorMessage = error.message;
        console.error('There was an error!', error);
      }
    })
  }

  ngOnInit(): void {
    this.initializeMap();
    this.getlayerData();
  }

}
