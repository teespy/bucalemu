import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';

import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'

@Component({
    selector: 'map-component',
    templateUrl: 'map.component.html'
})
export class MapComponent implements OnInit {
    constructor(public navCtrl: NavController) {}

    ngOnInit(): void {
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'https://openmaptiles.github.io/osm-bright-gl-style/style-cdn.json',
            center: [8.5456, 47.3739],
            zoom: 11
        });
        
        // XXX loads but with no width or height

    }
}