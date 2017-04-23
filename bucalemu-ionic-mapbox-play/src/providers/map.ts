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
  public geoJSONOverlays: any = null;
  public bufferZones: any = null;


  constructor(public http: Http) {
    this.geoJSONOverlays = { // an empty GeoJSON FeatureCollection object
      "type": "FeatureCollection",
      "features": []
    }
  }


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


  /*
    Adds a random building
  */
  addGeoJSONRandomBuilding(coords): void {
    try {
      let colors = ['red', 'green', 'orange', 'yellow', 'blue'];
      let buildingbase = 0.0001 + 0.0002 * (Math.floor(Math.random() * colors.length));
      let sectionheight = 2 + 5 * (Math.floor(Math.random() * colors.length));

      this.geoJSONOverlays.features.push(
        { // Level 1
          "type": "Feature",
          "properties": {
            "base_height": 0,
            "height": sectionheight,
            "color": colors[Math.floor(Math.random() * colors.length)]
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[ // Level 1
              [coords.longitude, coords.latitude + buildingbase],
              [coords.longitude + buildingbase, coords.latitude],
              [coords.longitude, coords.latitude - buildingbase],
              [coords.longitude - buildingbase, coords.latitude],
              [coords.longitude, coords.latitude + buildingbase]
            ]]
          }
        },
        { // Level 2
          "type": "Feature",
          "properties": {
            "base_height": sectionheight,
            "height": sectionheight * 2,
            "color": colors[Math.floor(Math.random() * colors.length)]
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[ // Level 2
              [coords.longitude, coords.latitude + buildingbase / 1.5],
              [coords.longitude + buildingbase / 1.5, coords.latitude],
              [coords.longitude, coords.latitude - buildingbase / 1.5],
              [coords.longitude - buildingbase / 1.5, coords.latitude],
              [coords.longitude, coords.latitude + buildingbase / 1.5]
            ]]
          }
        },
        { // Level 3
          "type": "Feature",
          "properties": {
            "base_height": sectionheight * 2,
            "height": sectionheight * 3,
            "color": colors[Math.floor(Math.random() * colors.length)]
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[ // Level 3
              [coords.longitude, coords.latitude + buildingbase / 3],
              [coords.longitude + buildingbase / 3, coords.latitude],
              [coords.longitude, coords.latitude - buildingbase / 3],
              [coords.longitude - buildingbase / 3, coords.latitude],
              [coords.longitude, coords.latitude + buildingbase / 3]
            ]]
          }
        }
      );

      // Check if geojson-overlays source exists, if so update it, if not add it
      let source = this.map.getSource("geojson-overlays");
      if (! !!source)
        this.map.addSource("geojson-overlays", { "type": "geojson", "data": this.geoJSONOverlays });
      else
        source.setData(this.geoJSONOverlays);

      // Check if random-buildings layer exists, if not then add it
      if (! !!this.map.getLayer("random-buildings")) {
        this.map.addLayer({
          "id": "random-buildings",
          "type": "fill-extrusion",
          "source": "geojson-overlays",
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
      }
    } catch (error) {
      console.log("Catched an error in Mapbox.addGeoJSONRandomBuilding()");
    }
  }


  /*
    Adds a random building
  */
  addGeoJSONRandomBuilding2(coords): void {
    try {
      let colors = ['red', 'green', 'orange', 'yellow', 'blue'];
      let buildingbase = 0.01 + 0.02 * Math.random();
      let sectionheight = 2 + 5 * (Math.floor(Math.random() * colors.length));

      let point = turf.point([coords.longitude, coords.latitude]);
      
      let firstfloor = turf.circle(point, buildingbase/10, 10, "kilometers");
      firstfloor.properties['base_height'] = 0;
      firstfloor.properties['height'] = 5*sectionheight;
      firstfloor.properties['color'] = colors[Math.floor(Math.random() * colors.length)];      
      this.geoJSONOverlays.features.push(firstfloor);

      let secondfloor = turf.circle(point, buildingbase/2, 10, "kilometers");
      secondfloor.properties['base_height'] = 5*sectionheight;
      secondfloor.properties['height'] = 6*sectionheight;
      secondfloor.properties['color'] = colors[Math.floor(Math.random() * colors.length)];
      this.geoJSONOverlays.features.push(secondfloor);

      let thirdfloor = turf.circle(point, buildingbase/3, 10, "kilometers");
      thirdfloor.properties['base_height'] = 6*sectionheight;
      thirdfloor.properties['height'] = 7*sectionheight;
      thirdfloor.properties['color'] = colors[Math.floor(Math.random() * colors.length)];
      this.geoJSONOverlays.features.push(thirdfloor);
      
      // Check if geojson-overlays source exists, if so update it, if not add it
      let source = this.map.getSource("geojson-overlays");
      if (! !!source)
        this.map.addSource("geojson-overlays", { "type": "geojson", "data": this.geoJSONOverlays });
      else
        source.setData(this.geoJSONOverlays);

      // Check if random-buildings layer exists, if not then add it
      if (! !!this.map.getLayer("random-buildings")) {
        this.map.addLayer({
          "id": "random-buildings",
          "type": "fill-extrusion",
          "source": "geojson-overlays",
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
            'fill-extrusion-opacity': 1
          }
        });

        this.layerIDCount += 1;
      }
    } catch (error) {
      console.log("Catched an error in Mapbox.addGeoJSONRandomBuilding2()");
    }
  }


  /*
      Adds a buffer zone around Random Buildings
    */
  addBufferZone(): void {
    try {
      let bufferZone = turf.buffer(this.geoJSONOverlays, 0.1);

      let source = this.map.getSource("geojson-bufferzone");
      if (! !!source)
        this.map.addSource("geojson-bufferzone", { "type": "geojson", "data": bufferZone });
      else
        source.setData(bufferZone);

      // Check if random-buildings layer exists, if not then add it
      if (! !!this.map.getLayer("buffer-zone")) {
        this.map.addLayer({
          "id": "buffer-zone",
          "type": "fill",
          "source": "geojson-bufferzone",
          "paint": {
            'fill-color': 'blue',
            'fill-opacity': 0.2
          }
        });

        this.layerIDCount += 1;
      }
    } catch (error) {
      console.log("Catched an error in Mapbox.addGeoJSONRandomBuilding()");
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