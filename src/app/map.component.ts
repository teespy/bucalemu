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
    public overlayIDs:number = 1;

    constructor(public navCtrl: NavController, public bucalemu: MapBox) { }

    ngOnInit ():void {
        navigator.geolocation.getCurrentPosition(this.onSuccessGetPosition, this.onErrorGetPosition);
    }

    onSuccessGetPosition = (position):void => { // Golocation, center map in user's location
        try {
            this.currentCoords.longitude = position.coords.longitude;
            this.currentCoords.latitude = position.coords.longitude;
            this.bucalemu.makeMap(this.currentCoords);
            this.bucalemu.on('load', this.mapOnLoad);
        } catch (e) {
            console.log("Catched error in MapComponent.onSuccessGetPosition()");
        }
    }

    onErrorGetPosition = (error):void => { // No geolocation, center map in Plaza de Armas
        try {
            this.currentCoords.longitude = -70.650469; // Plaza de Armas, Santiago, Chile
            this.currentCoords.latitude = -33.437863;
            this.bucalemu.makeMap(this.currentCoords);
            this.bucalemu.on('load', this.mapOnLoad);
        } catch (e) {
            console.log("Catched error in MapComponent.onErrorGetPosition()");
        }
    }

    mapOnLoad = ():void => {
        try {
            this.bucalemu.addGeoJSONRandomBuilding(this.currentCoords.longitude, this.currentCoords.latitude, "b" + this.overlayIDs);
            this.bucalemu.on('click', this.mapOnClick);
            this.overlayIDs += 1;
        } catch (e) {
            console.log("Catched error in MapComponent.mapOnLoad()");
        }
    }

    mapOnClick = (eventinfo):void => {
        try {
            this.bucalemu.addGeoJSONRandomBuilding(eventinfo.lngLat.lng, eventinfo.lngLat.lat, "b" + this.overlayIDs);
            this.overlayIDs += 1;
        } catch (e) {
            console.log("MapComponent.mapOnClick() error");
        }
    }
}