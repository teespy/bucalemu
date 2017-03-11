export const MAPBOXSTYLES = {
    'osmbright': {
        container: 'map',
        style: 'https://openmaptiles.github.io/osm-bright-gl-style/style-cdn.json',
        zoom: 17,
        pitch: 60
    },

    'positron': {
        container: 'map',
        style: 'https://openmaptiles.github.io/positron-gl-style/style-cdn.json',
        zoom: 17,
        pitch: 60
    },

    'klokantech-basic': {
        container: 'map',
        style: 'https://openmaptiles.github.io/klokantech-basic-gl-style/style-cdn.json',
        zoom: 17,
        pitch: 60
    },
    'dark-matter': {
        container: 'map',
        style: 'https://openmaptiles.github.io/dark-matter-gl-style/style-cdn.json',
        zoom: 17,
        pitch: 60
    }
}

export class MapboxStyle {
    getStyle(longitude, latitude, style): any {
        try {
            var newmap: any = MAPBOXSTYLES[style];
            newmap.center = [longitude, latitude];
            return newmap;
        } catch (e) {
            console.log('MapboxStyle.getStyle() error');
        }
    }
}