import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'

/*
  Generated class for the Map provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Map {
  public map = null;


  constructor(public http: Http) { }


  makeMap(mapParams): void {
    this.map = new mapboxgl.Map(mapParams);
    this.map.addControl(new mapboxgl.NavigationControl());
  }


  addGeoJSONPoint(longitude, latitude): void {
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
  }


  addGeoJSONSquare(longitude, latitude, length): void {
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
  }


  addGeoJSONCube(longitude, latitude, length, base_height, height, color, opacity, id): void {
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
  }

  addGeoJSONRandomBuilding(longitude, latitude, length, height, colors, id): void {
    // TODO: Do this with GeoJSON VT - https://github.com/mapbox/geojson-vt
    //                      and Turf - https://www.mapbox.com/help/intro-to-turf/
    
    let coordinates: [[[[number]]]] = [
      [[
        [longitude, latitude + length],
        [longitude + length, latitude],
        [longitude, latitude - length],
        [longitude - length, latitude],
        [longitude, latitude + length]
      ]],
      [[
        [longitude, latitude + length / 1.5],
        [longitude + length / 1.5, latitude],
        [longitude, latitude - length / 1.5],
        [longitude - length / 1.5, latitude],
        [longitude, latitude + length / 1.5]
      ]],
      [[
        [longitude, latitude + length / 3],
        [longitude + length / 3, latitude],
        [longitude, latitude - length / 3],
        [longitude - length / 3, latitude],
        [longitude, latitude + length / 3]
      ]],
    ];

    let geojsoncube = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "base_height": 0,
            "height": height,
            "color": colors[0]
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": coordinates[0]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "base_height": height,
            "height": height * 2,
            "color": colors[1]
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": coordinates[1]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "base_height": height*2,
            "height": height * 3,
            "color": colors[2]
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": coordinates[2]
          }
        }
      ]
    }

    console.log(geojsoncube);

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
  }

}