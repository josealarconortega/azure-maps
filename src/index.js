import Promise from 'promise-polyfill'

import Config from './config.js'
import Utils from './utils.js'

import AzureConversions from './services/azure-conversions.js'

import ComponentBase from './mixins/component-base.vue'

import MapComponent from './components/azure-map-component.vue'
import PushPinComponent from './components/azure-pushpin-component.vue'
import InfoBoxComponent from './components/azure-infobox-component.vue'

if(!window.Promise){
    window.Promise = Promise;
}

export default {
    mixins: {
        componentBase: ComponentBase
    },
    components: {
        map: MapComponent,
        pushpin: PushPinComponent,
        infobox: InfoBoxComponent,
    },
    services: {
        conversions: AzureConversions
    },
    install(Vue, options){
        if(options){
            Object.assign(Config, options);
        }

        Utils.logger.log('registering azure-map component...');
        Vue.component(MapComponent.name, Vue.extend(MapComponent));

        Utils.logger.log('registering azure-map-pushpin component...');
        Vue.component(PushPinComponent.name, Vue.extend(PushPinComponent));

        Utils.logger.log('registering azure-map-infobox component...');
        Vue.component(InfoBoxComponent.name, Vue.extend(InfoBoxComponent)); 
        
        
        Utils.logger.log('azure map vue plugin installed!');       
    }
}