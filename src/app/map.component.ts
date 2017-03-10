import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';

import { Map } from '../providers/map';
import { MapboxMapStyles } from '../assets/mapstyles.ts';

@Component({
    selector: 'map-component',
    templateUrl: 'map.component.html',
    providers: [Map]
})
export class MapComponent implements OnInit {
    currentLongitude = null;
    currentLatitude = null;
    colors = ['red', 'green', 'orange', 'yellow', 'blue'];
    overlayIDs = 1;

    constructor(public navCtrl: NavController, public bucalemu: Map) { }

    ngOnInit(): void {
        navigator.geolocation.getCurrentPosition(this.onSuccess, this.onError);
    }

    onSuccess = (position) => { // Golocation, center map in user's location
        try {
            var style = new MapStyles.MapboxMapStyles().getStyle(position.coords.longitude, position.coords.latitude, 'osmbright');
            this.bucalemu.makeMap(style);
            this.bucalemu.map.on('load', this.mapOnLoad);
        } catch (e) {
            console.log("MapComponent.onSuccess() error");
        }
    }

    onError = (error) => { // No geolocation, center map in Plaza de Armas
        try {
            var style = new MapStyles.MapboxMapStyles().getStyle(-70.650469, -33.437863, 'osmbright');
            this.bucalemu.makeMap(style);
            this.bucalemu.map.on('load', this.mapOnLoad);
        } catch (e) {
            console.log("MapComponent.onSuccess() error");
        }

    }

    mapOnLoad = () => {
        try {
            this.bucalemu.addGeoJSONRandomBuilding(this.currentLongitude, this.currentLatitude, 0.0002, 5, ["blue", "yellow", "green"], "building" + this.overlayIDs);
            this.overlayIDs += 1;
            this.bucalemu.map.on('click', this.mapOnClick);
        } catch (e) {
            console.log("MapComponent.mapOnLoad() error");
        }
    }

    mapOnClick = (eventinfo) => {
        try {
            let buildingcolors = [
                this.colors[Math.floor(Math.random() * this.colors.length)],
                this.colors[Math.floor(Math.random() * this.colors.length)],
                this.colors[Math.floor(Math.random() * this.colors.length)]
            ];
            let buildingbase = 0.0001 + 0.0002 * (Math.floor(Math.random() * this.colors.length));
            let buildingheight = 2 + 5 * (Math.floor(Math.random() * this.colors.length));

            this.bucalemu.addGeoJSONRandomBuilding(eventinfo.lngLat.lng, eventinfo.lngLat.lat, buildingbase, buildingheight, buildingcolors, "building" + this.overlayIDs);
            this.overlayIDs += 1;
        } catch (e) {
            console.log("MapComponent.mapOnClick() error");
        }
    }
}