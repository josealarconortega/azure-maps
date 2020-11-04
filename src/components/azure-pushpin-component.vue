<template>
    <div ref="pinTemplate">
        <slot v-if="initialized" v-bind:metadata="metadata"></slot>
    </div>
</template>

<script>
    const pushpinEvents = Object.freeze([
        'changed', 
        'click', 
        'dblclick', 
        'drag', 
        'dragend', 
        'dragstart', 
        'mousedown', 
        'mouseout', 
        'mouseover', 
        'mouseup' 
    ]);

    import ComponentBase from '../mixins/component-base.vue';
    import Utils from '../utils.js';
    import AzureConversions from '../services/azure-conversions.js'

    export default {
        name: 'azure-map-pushpin',
        mixins: [ComponentBase],
        props: {
            options: {
                type: Object,
                required: false,
                default: () => {}
            },
            metadata: {
                type: Object,
                required: false,
                default: () => null
            },
            location: {
                type: Object,
                required: true,
                validator: (value) => value && typeof(value.latitude) === 'number' && typeof(value.longitude) === 'number'
            },
            county: {
                type: String,
                required: false,
                default: () => null
            },
            styles: {
                type: Object,
                required: false,
            },
            position: {
                type: Array,
                required: false
            }

        },
        data(){
            return {
                itemType: 'push-pin',
                initialized: true,
                allowedEvents: pushpinEvents
            };
        },
        computed: {
            innerOptions(){
                let source = this.options;
                let target = {};

                for(var prop in source){
                    if(source.hasOwnProperty(prop)){
                        switch(prop){
                            case 'anchor':
                            case 'textOffset':
                                target[prop] = AzureConversions.toMapPoint(source[prop]);
                                break;
                            default: 
                                target[prop] = Utils.deepClone(source[prop]);
                                break;
                        }                        
                    }
                }

                return target;
            }
        },
        watch: {
            metadata: {
                deep: true,
                handler(value){
                    let pin = this.getItem();
                    if(pin){
                        pin.metadata = Utils.deepClone(value);
                    }
                }
            },
            location(value){
                let pin = this.getItem();
                if(pin){
                    pin.setLocation(AzureConversions.toMapLocation(value));
                }
            },
            innerOptions(value){
                let pin = this.getItem();
                if(pin){
                    pin.setOptions(value);
                }
            }
        },
        methods: {
            hasIconTemplate(){
                return !!(this.$slots && this.$slots.default && this.$slots.default.length);
            },
            async render(){
                //let layer = this.getLayer();
                let pin = this.getItem();
                //if(layer){
                if(pin){
                    this.destroy();
                }
                //let options = Utils.deepClone(this.innerOptions);
                let location = null;
                pin = this.setItem(await this.doPushPin(this.location, this.options));
                
                if(this.county != ''){
                    let address = {};
                    address['comuna'] = this.county;
                    address['calle'] = null;
                    address['numero'] = null;
                    location = await this.toMapForAddress(address, true);
                    this.location.latitude = location.location.latitude;
                    this.location.longitude = location.location.longitude;
                }
                
                //console.log('aca123123');
                //pin = this.setItem(await this.doPushPin(this.location, options));
                pin.metadata = Utils.deepClone(this.metadata);

                this.updateIcon();
                //this.toMapCenter(this.location); //centramos
                //layer.add(pin);
                //} else {
                //    Utils.logger.error('push-pin render error: layer not found!');
                //}
            },
            updateIcon(){
                if(this.hasIconTemplate()){
                    let pin = this.getItem();
                    if(pin){
                        let template = this.$refs.pinTemplate.innerHTML;
                        pin.setOptions({ icon: template });
                    }
                }
            },
            destroy(){
                let pin = this.getItem();

                try {
                    /*if(pin){
                        let layer = this.getLayer();

                        if(layer){
                            layer.remove(pin);
                        }
                    }*/
                } finally {
                    this.setItem(null);
                }
            }
        },
        async mounted(){
            Utils.logger.log('mounted lifecycle hook, rendering push-pin' + this._uid + '...');
            await this.render();
            await this.registerEvents(this.styles, this.position);
        },
        beforeUpdate(){
            Utils.logger.log('beforeUpdate lifecycle hook, pin ' + this._uid);
        },
        updated(){
            Utils.logger.log('updated lifecycle hook, pin '+ this._uid + ' updating icon...');
            this.updateIcon();
        },
        beforeDestroy(){
            Utils.logger.log('beforeDestroy lifecycle hook, destroying push-pin ' +  this._uid + '...');
            this.destroy();
        }
    }
</script>