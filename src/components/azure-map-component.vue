<template>
    <div ref="mapContainer">
        <div style="display: none;">
            <slot v-if="initialized"></slot>
        </div>
    </div>
</template>

<script>
    const mapEvents = Object.freeze([
        'click', 
        'dblclick', 
        'mapresize', 
        'maptypechanged', 
        'mousedown', 
        'mousemove', 
        'mouseout', 
        'mouseover', 
        'mouseup', 
        'mousewheel', 
        'rightclick', 
        'viewchange', 
        'viewchangeend', 
        'viewchangestart'
    ]);

    import ComponentBase from '../mixins/component-base.vue';
    import Config from '../config.js';
    import Utils from '../utils.js';
    import AzureConversions from '../services/azure-conversions.js'
    import config from '../config.js';
    export default {
        name: 'azure-map',
        mixins: [ComponentBase],
        props: {
            credentials_key: {
                type: String,
                required: true
            },
            map_options: {
                type: Object,
                required: false
            },
            name: {
                type: String,
                required: true 
            }
        },
        data(){
            return {
                itemType: 'map',
                rendering: false,
                apiLoaded: false,
                allowedEvents: mapEvents
            };
        },
        computed: {
            mapOptions(){
                if(!this.apiLoaded){
                    return {};
                }

                let source = this.options;
                let target = {};

                for(var prop in source){
                    if(source.hasOwnProperty(prop)){
                        switch(prop){
                            case 'navigationBarOrientation':
                                //target[prop] = AzureConversions.toNavigationBarOrientation(source[prop]);
                            //    break;
                            case 'mapTypeId':
                            case 'supportedMapTypes':
                                //target[prop] = AzureConversions.toMapTypeId(source[prop])
                            //    break;
                            default:
                                target[prop] = source[prop];
                                break;
                        }
                    }
                }

                return target;
            }
        },
        provide() {
            return {
                getMap: this.getItem,
                loadModule: this.loadModule
            };
        },
        mounted() {
            let externalScript = document.createElement('script')
            externalScript.setAttribute('src', Config.attlasUrl)
            document.head.appendChild(externalScript)

            externalScript= document.createElement('script')
            externalScript.setAttribute('src', Config.atlasApiUrl)
            document.head.appendChild(externalScript)
        },
        methods: {
            libLoaded() {
                return !!(window.atlas && window.atlas.Map);
            },
            getInitCallbackFnName(){
                return 'mapInitializeCallback_' + this._uid;
            },
            loadApi() {
                let self = this;
                Utils.logger.log('loading api...');
                return new Promise((resolve, reject) => {
                    
                    if(self.libLoaded()){
                        Utils.logger.log('api already loaded!');
                        self.apiLoaded = true;
                        resolve();
                    } else {
                        let link = document.createElement('link');
                        link.type = 'text/css';
                        link.rel = 'stylesheet';
                        document.head.append(link);
                        link.href = config.attlasCSS;

                        let tag = document.createElement('script');
                        tag.type = 'text/javascript';
                        tag.src = Config.atlasApiUrl;
                        tag.async = true;
                        tag.defer = true;

                        document.body.append(tag);

                        self.apiLoaded = true;
                        resolve();
                    }
                });
            },
            loadModule(name){
                let self = this;
                let normalizedName = (name || '').toLowerCase().trim();
                return new Promise((resolve, reject) => {
                    if(!normalizedName){
                        reject('A module name must be specified');
                    } else if(!self.libLoaded()){
                        reject('This function can only be called after the Azure Map library has been loaded');
                    } else {
                        let loadedModules = Utils.loadedModules;
                        if(!loadedModules){
                            loadedModules = [];
                            Utils.loadedModules = loadedModules;
                        }
                        if(loadedModules.item.indexOf(normalizedName) > -1){
                            Utils.logger.log('Map module ' + normalizedName + ' already loaded, resolving...');
                            resolve();
                        } else {
                            resolve();
                        }
                    }
                });                
            },
            draw(){
                this.render();
            },
            render(){
                let self = this;
                return new Promise((resolve, reject) => {
                    self.rendering = this;
                    let map = self.getItem();

                    // if the map already exists, destroy it first so we can re-render
                    // we are doing this when we add a watcher on the mapOptions property
                    // since many of the map options can only be set via the Azure Map Constructor
                    // TODO: add property checking to the mapOptions watcher to only re-render map if
                    //       an option changed that is required in the map constructor
                    if(map){
                        self.destroy();
                    }
                    Promise.all([self.loadApi(), self.$nextTick()]).then(() => {
                        map = self.setItem(this.doMap(this.name, this.map_options, this.credentials_key));
                        //this.addControls(map, this.styles, this.position);
                        // azure maps will fire the viewchangeend event when the map is first drawn
                        // let's listen for this event to trigger the setting of our initialized property
                        // which will enable the slot and allow any child components to be created and rendered
                        map.events.add('ready', function () {
                            self.initialized = true;
                        });

                        resolve();
                    }).catch(function(err){
                        reject(err);
                    }).finally(() => {

                        self.rendering = false;
                    });
                });
            },
            destroy(){
                this.initialized = false;
                let map = this.getItem();

                if(map && typeof(map.dispose) === 'function'){
                    map.dispose();
                    this.setItem(null);
                }
            }
        },
        mounted(){
            Utils.logger.log('mounted lifecycle hook, rendering map...');
            this.draw();
            this.registerEvents();
        },
        beforeDestroy(){
            Utils.logger.log('beforeDestroy lifecycle hook, destroying map...');
            let self = this;
            self.destroying = true;
            self.unRegisterEvents().then(self.destroy).finally(() => {
                self.destroying = false;
            });
        },
        activated(){
            Utils.logger.log('map activated lifecycle hook, checking criteria for rendering map...');
            if(!this.rendering && !this.getItem()){
                Utils.logger.log('map component activated from deactivated state, rendering map...');
                this.draw();
            } else {
                Utils.logger.log('map component activated from initial mounted stated, no action performed here since already performed in mounted hook');
            }
        },
        deactivated(){
            Utils.logger.log('deactivated lifecyle hook, destroying map...');
            this.unRegisterEvents().then(this.destroy);
        }
    }
</script>