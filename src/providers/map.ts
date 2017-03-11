import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'

import * as mapstyles from '../assets/mapstyles.ts';

@Injectable()
export class MapBox {
  public overlayIDs: number; 
  public map: any;
  public basestyle: any;


  constructor(public http: Http) {
    this.overlayIDs = 1;
  }


  makeMap(coords): void {
    try {
      this.basestyle = new mapstyles.MapboxStyle();
      this.map = new mapboxgl.Map(this.basestyle.getStyle(coords.longitude, coords.latitude, 'osmbright'));
      this.map.addControl(new mapboxgl.NavigationControl());
    } catch (e) {
      console.log("catched an error in MapBox.makeMap()");
    }
  }

  on = (event, callback):void => {
    try {
      this.map.on(event, callback);
    } catch (e) {
      console.log('Catched error in Mapbox.on()')
    }
  }

  // TODO: Do all of this with tippecanoe - https://github.com/mapbox/tippecanoe
  //                   and tileserver-php - https://github.com/klokantech/tileserver-php
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
    } catch (e) {
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
    } catch (e) {
      console.log("catched an error in MapBox.addGeoJSONSquare()");
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
    } catch (e) {
      console.log("catched an error in MapBox.addGeoJSONCube()");
    }
  }

  addGeoJSONRandomBuilding(longitude, latitude, id): void {
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
          [longitude, latitude + buildingbase],
          [longitude + buildingbase, latitude],
          [longitude, latitude - buildingbase],
          [longitude - buildingbase, latitude],
          [longitude, latitude + buildingbase]
        ]],
        [[
          [longitude, latitude + buildingbase / 1.5],
          [longitude + buildingbase / 1.5, latitude],
          [longitude, latitude - buildingbase / 1.5],
          [longitude - buildingbase / 1.5, latitude],
          [longitude, latitude + buildingbase / 1.5]
        ]],
        [[
          [longitude, latitude + buildingbase / 3],
          [longitude + buildingbase / 3, latitude],
          [longitude, latitude - buildingbase / 3],
          [longitude - buildingbase / 3, latitude],
          [longitude, latitude + buildingbase / 3]
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
          'fill-extrusion-opacity': 0.5
        }
      });
    } catch (e) {
      console.log("Catched an error in Mapbox.addGeoJSONRandomBuilding()");
    }
  }
}

// TODO: Do this using https://github.com/OSMBuildings/GLMap/blob/master/README.md
// check what it can do
//   http://osmbuildings.org/ 
//   http://blog.webkid.io/3d-maps-with-osmbuildings/
// when coupled with buildings data
@Injectable()
export class GLMap {
}