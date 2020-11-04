export default {
    toMapLocation: function(location){
        if(!location){
            return null;
        }
        
        //return new Microsoft.Maps.Location(location.latitude, location.longitude);
    },
    toMapPoint: function(point){
        if(!point){
            return null;
        }

        //return new Microsoft.Maps.Point(point.x, point.y);
    },
    toMapTypeId: function(source){
        if(!source){
            return null;
        }

        if(Array.isArray(source)){
            return source.map(function(item){
                return Microsoft.Maps.MapTypeId[item];
            });
        }

        //return Microsoft.Maps.MapTypeId[source];
    },
    toNavigationBarOrientation: function(source){
        if(!source){
            return null;
        }

        //return Microsoft.Maps.NavigationBarOrientation[source];
    }/*,
    toDirectionAddress: async function(map, pushpin, location, search){
        if(pushpin != undefined){
            var utmObj = require('utm-latlng');
            var utm=new utmObj();
            utm = utm.convertLatLngToUtm(location.latitude, location.longitude, -1)
            search([location.longitude, location.latitude]).then(response => {
                let address = response.addresses[0].address;

                var country = address.country.toLowerCase();
                var chile = country.indexOf('chile') != -1;

                if (!chile) {
                    return 'direccion invalida'
                } else {
                    pushpin.setOptions({ position: [longitude, latitude] });
                    resolve({
                        'direction': address,
                        'huso': utm
                    });

                }
            });

        }else{
            return undefined
        }
        
    }*/

    
}