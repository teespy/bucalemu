export const MAPBOXSTYLES = {
    'omt-osmbright': {
        container: 'map',
        style: 'https://openmaptiles.github.io/osm-bright-gl-style/style-cdn.json',
        zoom: 17,
        pitch: 60
    },
    'omt-positron': {
        container: 'map',
        style: 'https://openmaptiles.github.io/positron-gl-style/style-cdn.json',
        zoom: 17,
        pitch: 60
    },
    'omt-klokantech-basic': {
        container: 'map',
        style: 'https://openmaptiles.github.io/klokantech-basic-gl-style/style-cdn.json',
        zoom: 17,
        pitch: 60
    },
    'omt-dark-matter': {
        container: 'map',
        style: 'https://openmaptiles.github.io/dark-matter-gl-style/style-cdn.json',
        zoom: 17,
        pitch: 60
    },
    'mapbox-streets-v9': {
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        zoom: 9,
        pitch: 60
    }
}

export class MapboxStyle {
    getStyle(coords, style): any {
        try {
            var newmap: any = MAPBOXSTYLES[style];
            newmap.center = [coords.longitude, coords.latitude];
            return newmap;
        } catch (e) {
            console.log('Catched an error in MapboxStyle.getStyle()');
        }
    }
}