module MapStyles {
    export const MAPSTILES = {
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

    export class MapboxMapStyles {
        getStyle(longitude, latitude, style): object {
            try {
                var newmap: any = MAPSTILES[style];
                newmap.center = [longitude, latitude];
                return newmap;
            } catch (e) {
                console.log('MapboxMaxStyles.getStyle() error');
            }
        }
    }
}