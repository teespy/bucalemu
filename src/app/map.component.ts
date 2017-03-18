    import { Component } from '@angular/core';
    import { NavController } from 'ionic-angular';
    import { OnInit } from '@angular/core';

    import { MapBox } from '../providers/map';

    @Component({
        selector: 'map-component',
        templateUrl: 'map.component.html',
        providers: [MapBox]
    })
    export class MapComponent implements OnInit {
        public currentCoords:any = {'longitude': null, 'latitude': null};

        constructor(public navCtrl: NavController, public bucalemu: MapBox) { }

        ngOnInit ():void {
            navigator.geolocation.getCurrentPosition(this.onSuccessGetPosition, this.onErrorGetPosition);
        }

        onSuccessGetPosition = (position):void => { // Golocation, center map in user's location
            try {
                this.currentCoords.longitude = position.coords.longitude;
                this.currentCoords.latitude = position.coords.latitude;
                this.bucalemu.makeMap(this.currentCoords);
                this.bucalemu.on('load', this.mapOnLoad);
            } catch (error) {
                console.log("Catched error in MapComponent.onSuccessGetPosition()");
            }
        }

        onErrorGetPosition = (error):void => { // No geolocation, center map in Plaza de Armas
            try {
                this.currentCoords.longitude = -70.650469; // Plaza de Armas, Santiago, Chile
                this.currentCoords.latitude = -33.437863;
                this.bucalemu.makeMap(this.currentCoords);
                this.bucalemu.on('load', this.mapOnLoad);
            } catch (error) {
                console.log("Catched error in MapComponent.onErrorGetPosition()");
            }
        }

        mapOnLoad = ():void => {
            try {
                this.bucalemu.addGeoJSONRandomBuilding(this.currentCoords);
                this.bucalemu.on('click', this.mapOnClick);
            } catch (error) {
                console.log("Catched error in MapComponent.mapOnLoad()");
            }
        }

        mapOnClick = (event):void => {
            try {
                /*  
                    TODO: Create a method to decide which shapes for the base of a building are permisible
                    in the area that was clicked. 

                    To do this on the client-side, one can use
                        https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
                        http://geojson.org/geojson-spec.html#feature-objects

                    so that one can do something like this
                        var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
                        var features = this.bucalemu.map.queryRenderedFeatures(bbox);
                        console.log(features);

                    but, more likely, this has to be done on the server side, because it will be 
                    computationally intensive and will have to check with both the base tiles 
                    provider and the Bucalemu Map GeoJSON Database
                */
                /*this.bucalemu.addGeoJSONRandomBuilding({'longitude': event.lngLat.lng, 'latitude': event.lngLat.lat});*/
                this.bucalemu.highlightFeature(event, "lines");
            } catch (error) {
                console.log("MapComponent.mapOnClick() error");
            }
        }
    }