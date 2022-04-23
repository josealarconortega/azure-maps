<script>
    import Utils from '../utils.js';
    import AzureConversions from  '../services/azure-conversions.js'
    import Config from '../config.js';
    import * as atlas from '../../lib/atlas.min.js';
    import * as atlas_service from '../../lib/atlas-service.min.js';
    //import * as atlas from 'azure-maps-control'

    export default {
        data() {
            return {
                /**
                 * @property __item
                 * @description The Azure Maps entity object, this can be the map, layer, pushpin, etc.  
                 *              It is prefixed with two underscores, since Vue will not proxy a property that is prefixed
                 *              an underscore (_) or a dollar sign ($), we will take advantage of this since proxying this
                 *              type of object will KILL the browser and application.
                 */
                __item: null,
                ___itemMap: null,
                /**
                 * @property __itemHandlers
                 * @description Used to store the event handler ids for all events registered to the Azure Map entity object
                 */
                __itemHandlers: [],
                itemType: null,
                initialized: false,
                allowedEvents: [],
                map: null,
                pushpin: null,
                queryTranslate: [
                    {
                        key: 'Paihuano',
                        q: 'Paiguano, Coquimbo'
                    },
                    {
                        key: 'Isla de Pascua',
                        q: 'Isla de Pascua, Valparaíso'
                    },
                    {
                        key: 'Llay Llay',
                        q: 'Llaillay'
                    },
                    {
                        key: 'Cerrillos',
                        q: 'Cerrillos, Santiago'
                    },
                    {
                        key: 'Independencia',
                        q: 'Independencia, Santiago'
                    },
                    {
                        key: 'La Reina',
                        q: 'La Reina, Santiago'
                    },
                    {
                        key: 'San Joaquín',
                        q: 'San Joaquín, Santiago'
                    },
                    {
                        key: 'San Miguel',
                        q: 'San Miguel, Santiago'
                    },
                    {
                        key: 'San Pedro',
                        q: 'San Pedro, Santiago'
                    },
                    {
                        key: 'San Ramón',
                        q: 'San Ramón, Santiago'
                    },
                    {
                        key: 'Til til',
                        q: 'Tiltil'
                    },
                    {
                        key: 'San Vicente',
                        q: 'San Vicente, O\'Higgins'
                    },
                    {
                        key: 'Portezuelo',
                        q: 'Portezuelo, Nuble'
                    },
                    {
                        key: 'Trehuaco',
                        q: 'Treguaco, Nuble'
                    }
                ],
                positionTranslate: [
                    {
                        key: 'Retiro',
                        lat: -36.051019,
                        lon: -71.758976
                    },
                    {
                        key: 'Coelemu',
                        lat: -36.489525,
                        lon: -72.7024357
                    },
                    {
                        key: 'Cabo de Hornos',
                        lat: -55.733524,
                        lon: -67.381401
                    }
                ]
            };
        },
        computed: {

        },
        methods: {
            getItem() {
                return this.__item;
            },
            getItemMap() {
                return this.___item_map;
            },
            setItem(item){
                this.__item = item;
                return item;
            }, 
            doMap(name, options, credentials){
                if (!options.hasOwnProperty('zoom')) {
                    options['zoom'] = 10
                }
                if (!options.hasOwnProperty('view')) {
                    options['view'] = 'Auto'
                }
                if (!options.hasOwnProperty('center')) {
                    options['center'] =  [-70.6553139, -33.4402043];
                }
                options['authOptions'] = {};
                options['authOptions'] = {
                    'authType': 'subscriptionKey',
                    'subscriptionKey': credentials
                }; 
                this.map = new atlas.Map(name, {
                    center: options['center'],
                    zoom: options['zoom'],
                    view: options['view'],
                    authOptions: {
                        'authType': options['authOptions']['authType'],
                        'subscriptionKey': credentials
                    }
                });
                this.$store.state.map = this.map
                
                return this.map;
            },
            addControls(map , styles = null, position = null){
                if(styles == null) {
                    styles = {
                        mapStyles: ['road', 'satellite_road_labels']
                    }
                }
                if(position == null) {
                    position = [];
                    position[0] = 'top-right';
                    position[1] = 'bottom-right';
                }
                map.controls.add(
                    new atlas.control.StyleControl(styles), {
                    position: position[0]
                });

                map.controls.add(
                    new atlas.control.ZoomControl(), {
                    position: position[1]
                });

            },
            getAttachedEventListeners() {
                let listeners = this.$listeners || {};
                let prefix = this.itemType + '-';
                let names = [];
                for(var prop in listeners){
                    if(listeners.hasOwnProperty(prop)){
                        names.push(prop.replace(prefix, ''));
                    }
                }

                return names;
            },
            async registerEvents(style, position){
                var utmObj = require('utm-latlng');
                var utm=new utmObj();
                let self = this;
                let itemType = this.itemType;
                let events = self.getAttachedEventListeners();
                let map = this.$store.state.map
                let item = self.getItem();
                if (map != undefined) {
                    let defaultTransform = async function(event){
                        Utils.logger.log(event); 
                        return { 
                            meta: event.primitive && event.primitive.metadata,
                            location: {
                                'longitude': event['target']['options'].position[0],
                                'latitude': event['target']['options'].position[1]
                            },
                            targetType: event.targetType,
                            address: await self.toMapForCoordinates(event['target']['options'].position[1], event['target']['options'].position[0]),
                            utm: utm.convertLatLngToUtm(event['target']['options'].position[1], event['target']['options'].position[0], -1)
                        };  
                    };
                    if(!self.__itemHandlers){
                        self.__itemHandlers = [];
                    }
                    
                    return new Promise((resolve, reject) => {
                        var eventHandlers = self.allowedEvents.reduce(function(handlers, currentEvent){
                            var filteredHandlers = events.filter(function(item){
                                return item === currentEvent || (item && item.name === currentEvent);
                            });
                            filteredHandlers.forEach(function(handler){
                                var handlerType = typeof(handler);
                                if(handlerType === 'undefined'){
                                    Utils.logger.log('no user-defined ' + itemType + ' event handler for event: ' + currentEvent);
                                } else if(handlerType === 'string'){
                                    Utils.logger.log('setting up default handler for ' + itemType + ' event: ' + handler);
                                    handlers.push({
                                        name: currentEvent,
                                        transform: defaultTransform,
                                        delay: 0,
                                        once: false
                                    });
                                } else if(handlerType === 'object'){
                                    handlers.push({
                                        name: currentEvent,
                                        transform: handler.transform,
                                        delay: handler.delay || 0,
                                        once: handler.once || false
                                    });
                                } else{
                                    Utils.logger.warn('unknown ' + itemType + ' event handler type: ', handler);
                                }

                            });

                            return handlers;
                        }, []);

                        eventHandlers.forEach((eventHandler) => {
                            var eventHandle;
                            var handler = function(e){
                                var args = eventHandler.transform(e).then((data)=> {
                                    self.$emit(self.itemType + '-' + eventHandler.name, Utils.deepClone(data));
                                });
                            };
                            map.events.add(eventHandler.name, item, handler);
                            
                            if(eventHandle){
                                self.__itemHandlers.push(eventHandle);
                            }
                            
                            //map.controls(map);
                        });
                        
                        map.markers.add(item);
                        self.addControls(map, style, position);
                        resolve(item);
                    });
                }
            },
            unRegisterEvents(){
                let self = this;
                return new Promise((resolve, reject) => {
                    let events = self.__itemHandlers || [];
    
                    while(events.length){
                        var event = events.pop();
                    }

                    resolve();
                });
            },
            async doPushPin(location, options){
                let typePushping = options['typePushping'];
                delete options['typePushping'];
                if (!options.hasOwnProperty('position')) {
                    options['position'] = [-70.6553139, -33.4402043];
                }
                options['htmlContent'] = atlas.getImageTemplate(typePushping);
                this.pushpin = new atlas.HtmlMarker(options);
                this.$store.state.pushpin = this.pushpin;
                return this.pushpin
            },
            createQuery(address) {
                let comuna = address.comuna;
                let calle = address.calle;
                let numero = address.numero;
                let map = this.$store.state.map;
                this.queryTranslate.forEach((item) => {
                    if (item.key.indexOf(address.comuna) != -1) {
                        comuna = item.q;
                    }
                });
                var query = comuna;
                if ((!calle || !/^\s*$/.test(calle)) ) {
                    query = calle + ', ' + comuna;

                    if ((!numero || !/^\s*$/.test(numero))) {

                        query = calle + ' ' + numero + ', ' + comuna;
                    }
                }
                return query;
            },
            getSearchService() {
                let pipeline = atlas_service.MapsURL.newPipeline(new atlas_service.SubscriptionKeyCredential(atlas.getSubscriptionKey()));
                return new atlas_service.SearchURL(pipeline);

            },
            searchAddressReverse(position) {
                let s = this.getSearchService();
                return s.searchAddressReverse(atlas_service.Aborter.timeout(3000), position, {
                    view: 'Auto'
                });
            },
            searchAddress(query) {
                let s = this.getSearchService();
                return s.searchAddress(atlas_service.Aborter.timeout(3000), query);
            },
            setCameraAndMarker(map, marker, position, zoom) {
                marker.setOptions({ position: position });
                map.setCamera({ zoom: zoom, center: position });
            },
            findPosition(address) {
                var obj = {};
                this.positionTranslate.forEach( (item) => {
                    if (item.key.indexOf(address.comuna) != -1) {
                        obj = item;
                        return false;
                    }

                });
                return obj;
            },
            async toMapForAddress(address, init = null) {
                let map = this.$store.state.map;
                let pushpin = this.$store.state.pushpin; 
                let position = [];
                let query = this.createQuery(address);
                return new Promise((resolve, reject) => {
                    if (pushpin != undefined){
                        this.searchAddress(query).then((response) => {
                            let addressResult = {};
                            let results = response.results.filter((result) => /*result.type == 'Geography' &&*/ result.id.indexOf('CL') != -1);
                            if (results.length > 0) {
                                position = [results[0].position.lon, results[0].position.lat];
                                addressResult = results[0]['address'];
                            } 
                            let pos = this.findPosition(address);

                            if (pos.key) {
                                position = [pos.lon, pos.lat];
                            }
                            this.setCameraAndMarker(map, pushpin, position, 14);
                            var utmObj = require('utm-latlng');
                            var utm=new utmObj();
                            utm = utm.convertLatLngToUtm(position[1], position[0], -1)
                            resolve({location: {'latitude': position[1], 'longitude': position[0]},/*'location': response.results[0].location,*/ 'address':  this.direccionNormalizada(addressResult), 'utm': utm});

                        }).catch((err) => {
                            resolve({location: {}, 'address': {}, utm: {}})
                        });
                    } else {
                        resolve({location: {}, 'address': {}, utm: {}})
                    }
                });
            },
            toMapCenter(location){
                let map = this.$store.state.map;
                
                let pushpin = this.$store.state.puhspin;
                this.setCameraAndMarker(map, pushpin, [location.longitude, location.latitude], 15);

            },
            direccionNormalizada(address) {

                var direccion = {
                    calle: 'Sin Calle',
                    numero: 'S/N',
                    comuna: address.municipality,
                    casilla: ''
                };

                if (address.streetName) {
                    direccion.calle = address.streetName;
                }

                if (address.streetNumber) {
                    direccion.numero = address.streetNumber;
                }

                if (address.municipalitySubdivision) {
                    direccion.comuna = address.municipalitySubdivision;
                }

                if (address.extendedPostalCode) {
                    direccion.casilla = address.extendedPostalCode;
                }
            
                return direccion;
            },
            async toMapForCoordinates(latitude, longitude){
                let map = this.$store.state.map;
                let pushpin = this.$store.state.pushpin;
                return new Promise((resolve, reject) => {
                    if(pushpin != undefined){
                        var utmObj = require('utm-latlng');
                        var utm=new utmObj();
                        utm = utm.convertLatLngToUtm(latitude, longitude, -1)
                        this.searchAddressReverse([longitude, latitude]).then(response => {

                            let address = response.addresses[0].address;
                            var country = address.country.toLowerCase();
                            var chile = country.indexOf('chile') != -1;

                            if (!chile) {
                                resolve({});
                            } else {
                                pushpin.setOptions({ position: [longitude, latitude] });
                                resolve({
                                    'direction': this.direccionNormalizada(address),
                                    'huso': utm
                                });

                            }
                        });
                    }else{
                        resolve({});
                    }
                });

            }
        }
    }
</script>
