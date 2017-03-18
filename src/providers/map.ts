import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import * as mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'
import * as turf from '@turf/turf';

import * as mapstyles from '../assets/mapstyles.ts';


/*const VALIDGEOJSONGEOMETRIES: string[] = ["Point", "MultiPoint", "LineString",
  "MultiLineString", "Polygon", "MultiPolygon",
  "GeometryCollection"];*/


@Injectable()
export class MapBox {
  public map: any = null;
  public baseStyle: any = null;
  public layerIDCount: number = 1;
  public selectedFeature: any = null;
  public highlightedFeature: any = null;


  constructor(public http: Http) { }


  makeMap(coords): void {
    try {
      /*mapboxgl.accessToken = "pk.eyJ1IjoidGVlc3B5IiwiYSI6ImNpenEyNXFvNTAwdWIzMm8waW9oMmtyY2EifQ.k5Wpgni6TJfUHfka5rrb0w";*/
      this.baseStyle = new mapstyles.MapboxStyle();
      this.map = new mapboxgl.Map(this.baseStyle.getStyle(coords, 'omt-osmbright'));
      this.map.addControl(new mapboxgl.NavigationControl());
    } catch (error) {
      console.log("Catched an error in MapBox.makeMap()");
    }
  }


  on = (event, callback): void => {
    try {
      this.map.on(event, callback);
    } catch (error) {
      console.log('Catched error in Mapbox.on()')
    }
  }


  /* TODO: Do all of the below with tippecanoe - https://github.com/mapbox/tippecanoe
                            and tileserver-php - https://github.com/klokantech/tileserver-php*/


  /*
    Selects exactly one feature on the map. 
    De-selects previously selected feature if needed.
  */
  selectFeature(event: any, featureObjSelector: any = { 'style': {}, 'layer': {}, 'geometry': {} }) {
    try {
      if (!(!!featureObjSelector.style && !!featureObjSelector.layer && !!featureObjSelector.geometry))
        return null; // invalid selector

      //let bbox = [[event.point.x - 5, event.point.y - 5], [event.point.x + 5, event.point.y + 5]];
      let point = [event.point.x, event.point.y];
      let selectedCandidate = null;
      let features = this.map.queryRenderedFeatures(point);  // https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures

      for (let feature of features) {
        let dontSelect = false;

        for (let selector of featureObjSelector) {
          for (let subSelector of selector) {
            if (feature[selector][subSelector] != featureObjSelector[selector][subSelector])
              dontSelect = true;
          }
        }

        if (!dontSelect)
          selectedCandidate = feature;
      }

      return selectedCandidate;
    } catch (error) {
      console.log("Catched an error in MapBox.selectFeature(): " + <string>error);
      return false;
    }
  }


  /*
    Highlights exactly one feature on the map. 
    De-highlights previously highlighted feature if needed.
  */
  highlightFeature(event: any, featureType: string = "lines"): any {
    try {
      let tmpSelection = null;

      if (featureType == "lines") {
        let selector = { 'style': {}, 'layer': { 'type': 'line' }, 'geometry': {} };

        tmpSelection = this.selectFeature(event, selector);

        if (tmpSelection) {
          let geoJson = {
            "type": "geojson",
            "data": tmpSelection
          }

          let layer = {
            "id": this.layerIDCount + "-highlighted",
            "type": "line",
            "source": geoJson,
            "layout": {
              "line-join": "round",
              "line-cap": "round"
            },
            "paint": {
              "line-color": "#0000ff",
              "line-width": 8,
              "line-opacity": 0.5
            },
          }

          if (this.highlightedFeature != null)
            this.map.removeLayer(this.highlightedFeature.id);

          this.map.addLayer(layer);
          this.highlightedFeature = layer;
          this.layerIDCount += 1;
        }
      } if (featureType == "polygons") {
        let selector = { 'style': {}, 'layer': { 'type': 'fill' }, 'geometry': {} };
        tmpSelection = this.selectFeature(event, selector);

        if (tmpSelection) {
          //console.log(selectedFeature);
          let geoJson = {
            "type": "geojson",
            "data": tmpSelection
          }

          let layer = {
            "id": this.layerIDCount + "-highlighted",
            "type": "fill",
            "source": geoJson,
            "paint": {
              "fill-color": "#ff0000",
              "fill-opacity": 0.5
            },
          }

          if (this.highlightedFeature != null)
            this.map.removeLayer(this.highlightedFeature.id);

          this.map.addLayer(layer);
          this.highlightedFeature = layer;
          this.layerIDCount += 1;
        }
      }
    } catch (error) {
      console.log("Catched an error in MapBox.highlightFeatures(): " + <string>error);
      return false;
    }
  }


  addGeoJSONPoint(longitude, latitude): void {
    try {
      let geojsonpoint = {
        "type": "Feature",
        "properties": {
          "title": "Circle"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [longitude, latitude]
        },
      };

      this.map.addLayer({
        "id": "point",
        "type": "circle",
        "source": {
          "type": "geojson",
          "data": geojsonpoint
        }
      });
    } catch (error) {
      console.log("Catched an error in MapBox.addGeoJSONPoint()");
    }
  }


  addGeoJSONSquare(longitude, latitude, length): void {
    try {
      let coordinates = [
        [
          [latitude + length, longitude + length],
          [latitude - length, longitude + length],
          [latitude - length, longitude - length],
          [latitude + length, longitude - length],
          [latitude + length, longitude + length]
        ]
      ];

      let geojsonsquare = {
        "type": "geojson",
        "data": {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": coordinates
          }
        },
      };

      this.map.addLayer({
        "id": "firstsquare",
        "type": "fill",
        "source": geojsonsquare,
        "paint": {
          "fill-color": "#ff0000",
          "fill-opacity": 0.4
        }
      });
    } catch (error) {
      console.log("Catched an error in MapBox.addGeoJSONSquare()");
    }
  }


  addGeoJSONCube(longitude, latitude, length, base_height, height, color, opacity, id): void {
    try {
      let coordinates = [
        [
          [longitude + length, latitude + length],
          [longitude - length, latitude + length],
          [longitude - length, latitude - length],
          [longitude + length, latitude - length],
          [longitude + length, latitude + length]
        ]
      ];

      let geojsoncube = {
        "type": "Feature",
        "properties": {
          "base_height": base_height,
          "height": height,
          "color": color
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": coordinates
        }
      }

      this.map.addLayer({
        "id": id,
        "type": "fill-extrusion",
        "source": {
          "type": "geojson",
          "data": geojsoncube
        },
        "paint": {
          'fill-extrusion-color': {
            'property': 'color', // Get the fill-extrusion-color from the source 'color' property.
            'type': 'identity'
          },
          'fill-extrusion-height': {
            'property': 'height', // Get fill-extrusion-height from the source 'height' property.
            'type': 'identity'
          },
          'fill-extrusion-base': {
            'property': 'base_height', // Get fill-extrusion-base from the source 'base_height' property.
            'type': 'identity'
          },
          'fill-extrusion-opacity': opacity
        }
      });
    } catch (error) {
      console.log("Catched an error in MapBox.addGeoJSONCube()");
    }
  }


  addGeoJSONRandomBuilding(coords): any {
    try {
      let colors = ['red', 'green', 'orange', 'yellow', 'blue'];
      let buildingbase = 0.0001 + 0.0002 * (Math.floor(Math.random() * colors.length));
      let sectionheight = 2 + 5 * (Math.floor(Math.random() * colors.length));
      let buildingcolors = [
        colors[Math.floor(Math.random() * colors.length)],
        colors[Math.floor(Math.random() * colors.length)],
        colors[Math.floor(Math.random() * colors.length)]
      ];
      let coordinates: [[[[number]]]] = [
        [[
          [coords.longitude, coords.latitude + buildingbase],
          [coords.longitude + buildingbase, coords.latitude],
          [coords.longitude, coords.latitude - buildingbase],
          [coords.longitude - buildingbase, coords.latitude],
          [coords.longitude, coords.latitude + buildingbase]
        ]],
        [[
          [coords.longitude, coords.latitude + buildingbase / 1.5],
          [coords.longitude + buildingbase / 1.5, coords.latitude],
          [coords.longitude, coords.latitude - buildingbase / 1.5],
          [coords.longitude - buildingbase / 1.5, coords.latitude],
          [coords.longitude, coords.latitude + buildingbase / 1.5]
        ]],
        [[
          [coords.longitude, coords.latitude + buildingbase / 3],
          [coords.longitude + buildingbase / 3, coords.latitude],
          [coords.longitude, coords.latitude - buildingbase / 3],
          [coords.longitude - buildingbase / 3, coords.latitude],
          [coords.longitude, coords.latitude + buildingbase / 3]
        ]],
      ];

      let geojsoncube = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "base_height": 0,
              "height": sectionheight,
              "color": buildingcolors[0]
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": coordinates[0]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "base_height": sectionheight,
              "height": sectionheight * 2,
              "color": buildingcolors[1]
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": coordinates[1]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "base_height": sectionheight * 2,
              "height": sectionheight * 3,
              "color": buildingcolors[2]
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": coordinates[2]
            }
          }
        ]
      }

      this.map.addLayer({
        "id": this.layerIDCount + "-randombuilding",
        "type": "fill-extrusion",
        "source": {
          "type": "geojson",
          "data": geojsoncube
        },
        "paint": {
          'fill-extrusion-color': {
            'property': 'color', // Get the fill-extrusion-color from the source 'color' property.
            'type': 'identity'
          },
          'fill-extrusion-height': {
            'property': 'height', // Get fill-extrusion-height from the source 'height' property.
            'type': 'identity'
          },
          'fill-extrusion-base': {
            'property': 'base_height', // Get fill-extrusion-base from the source 'base_height' property.
            'type': 'identity'
          },
          'fill-extrusion-opacity': 0.5
        }
      });

      this.layerIDCount += 1;
      return this.layerIDCount - 1;

    } catch (error) {
      console.log("Catched an error in Mapbox.addGeoJSONRandomBuilding()");
      return false;
    }
  }

}



/*  TODO: Do this using https://github.com/OSMBuildings/GLMap/blob/master/README.md
    check what it can do:
      http://osmbuildings.org/ 
      http://blog.webkid.io/3d-maps-with-osmbuildings/

    when coupled with buildings data*/
@Injectable()
export class GLMap {
}