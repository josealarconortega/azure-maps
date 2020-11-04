### AZURE MAPA
Para poder editar y subir los cambios se debe hacer un build, para luego poder subir los cambios como se muestra en el siguiente ejemplo

**npm run build-full**

Una vez hecho esto se debe tomar el archivo dist y reemplazarlo por el anterior. En caso de querer publicar, se deben seguir los siguientes pasos.

1.- npm run build-full
2.- npm login (Se debe tener cuenta)
3.- npm publish

### INTEGRAR AZURE MAPA

Para poder integrar AZURE mapas se deben seguir los siguientes pasos


1.- npm install @vue-azure-maps/azure-mapa
2.- import VueAzureMaps from '@vue-azure-maps/azure-mapa';
3.- Vue.use(VueAzureMaps, { debug: true });

Ejemplo


### Using npm

`npm i --save @vue-azure-maps/azure-mapa`

Usage
-----

### Bundler (Webpack, Rollup)

```js
import Vue from 'vue'

import VueAzureMaps from '@vue-azure-maps/azure-mapa'

// Default configuration
Vue.use(VueAzureMaps);

// Turn on debug logging
Vue.use(VueAzureMaps, { debug: true });
```


```html 

<template>
    <div class="hello">
        <div id="map-example" :style="styles">
            <azure-map :credentials_key="apiKey" :map_options="mapOptions" styles="" :name="namedMap">
                <azure-map-pushpin  
                v-on:push-pin-dragend="dragend" 
                key="pin" :location="location" :options="options"  :county="county"></azure-map-pushpin> 
            </azure-map>
        </div> 
    </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Prop, Watch } from "vue-property-decorator";
@Component
export default class CustomMapComp {
    apiKey = 'xx'
    inputVal =  ''
    
     
    namedMap: 'map-example'
    mapOptions: {
        center: [-70.6553139, -33.4402043],
        zoom: 10
    }
    key: 'pin1'
    location: {
        latitude: -33.4402043,
        longitude: -70.6553139,
        isComune: true
    }
    options: {
        typePushping: 'marker-circle',
        draggable: true,
        position: [-70.6553139, -33.4402043],
        color: '#008aff'
    }
    styles:{
        'height': '636px',
        'width': '100%' 
    }
    county: '',
    classAuto: {
        direccion: '',
        latitud: '',
        longitud: '',
        utm: {
            este: '',
            norte: '',
            huso: ''
        }
    }
    change(n){ 
        
    }
    drag(n) { 
        console.log(n)
    } 
    dragend(n){
        console.log(n)
    }
}
 
</script>
  
```


