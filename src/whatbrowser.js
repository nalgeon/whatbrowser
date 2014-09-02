/*
 * Browser info module: webiste info detection 
 */
(function(window, $, UAParser, swfobject, deployJava) {
    'use strict';

    var navigator = window.navigator;

    function has_cookies() {
        if (navigator.cookieEnabled) {
            return true;
        }
        // create and delete cookie
        document.cookie = "cookietest=1";
        var ret = document.cookie.indexOf("cookietest=") != -1;
        document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
        return ret;
    }

    function has_flash() {
        try {
          var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
          if (fo) {
            return true;
          }
        } catch (e) {
          if (navigator.mimeTypes
                && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
                && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
            return true;
          }
        }
        return false;
    }

    function load_property(whatbrowser, property_name, load_func, source) {
        whatbrowser[property_name] = source ? source[property_name] : load_func();
    } 

    function browser_size(whatbrowser, source) {
        var self = whatbrowser;
        load_property(whatbrowser, 'browser_size', function() {
            return {
                height: $(window).height(),
                width: $(window).width()
            };
        }, source);
        self.browser_size.toString = function() {
            return self.browser_size.width + ' x ' + self.browser_size.height + ' px';
        };
    }

    function cookies(whatbrowser, source) {
        var self = whatbrowser;
        load_property(whatbrowser, 'cookies', function() {
            return has_cookies();
        }, source);
    }

    function flash(whatbrowser, source) {
        var self = whatbrowser;
        load_property(whatbrowser, 'flash', function() {
            return {
                enabled: has_flash(),
                version: swfobject && swfobject.getFlashPlayerVersion()
            };
        }, source);
        self.flash.toString = function() {
            if (self.flash.enabled && self.flash.version) {
                return self.flash.version.major + '.' + 
                  self.flash.version.minor + '.' + 
                  self.flash.version.release;
            } else {
                return self.flash.enabled ? 'да' : 'нет';
            }
        };
    }

    function javafn(whatbrowser, source) {
        var self = whatbrowser;
        load_property(whatbrowser, 'java', function() {
            return {
                enabled: navigator.javaEnabled && navigator.javaEnabled(),
                version: deployJava && deployJava.getJREs().shift()
            };
        }, source);
        self.java.toString = function() {
            return self.java.enabled
                ? self.java.version || 'да'
                : 'нет';    
        };
    }

    function language(whatbrowser, source) {
        var self = whatbrowser;
        load_property(whatbrowser, 'language', function() {
            return navigator.language || navigator.userLanguage;
        }, source);
    }

    function online(whatbrowser, source) {
        var self = whatbrowser;
        load_property(whatbrowser, 'online', function() {
            return navigator.onLine;
        }, source);
    }

    function screenfn(whatbrowser, source) {
        var self = whatbrowser;
        load_property(whatbrowser, 'screen', function() {
            return window.screen && {
                color_depth: window.screen.colorDepth,
                height: window.screen.height,
                width: window.screen.width
            };
        }, source);
        self.screen.toString = function() {
            return window.screen 
                ? self.screen.width + ' x ' + self.screen.height + ' px, ' + self.screen.color_depth + ' bit'
                : '';
        };
    }

    function ua(whatbrowser, source) {
        var self = whatbrowser;
        if (!UAParser) {
            self.ua = {
                ua: navigator.userAgent
            };
            return;
        }
        load_property(whatbrowser, 'ua', function() {
            return (new UAParser()).getResult();
        }, source);
        self.ua.toString = function() {
            return self.ua.ua;
        };
        self.ua.browser.toString = function() {
            var browser = self.ua.browser,
                str = browser.name || '';
            str += (browser.major && (' ' + browser.major)) || '';
            str += (browser.version && (' (' + browser.version + ')')) || '';
            return str;
        };
        self.ua.device.toString = function() {
            var device = self.ua.device,
                str = device.vendor || '';
            str += (device.model && (' ' + device.model)) || '';
            str += (device.type && (' (' + device.type + ')')) || '';
            return str;
        };
        self.ua.engine.toString = function() {
            var engine = self.ua.engine,
                str = engine.name || '';
            str += (engine.version && (' ' + engine.version)) || '';
            return str;
        };
        self.ua.os.toString = function() {
            var os = self.ua.os,
                str = os.name || '';
            str += (os.version && (' ' + os.version)) || '';
            return str;
        };
    }

    function fill_geo(whatbrowser, geo) {
        var self = whatbrowser;
        self.geo = geo;
        if (self.geo && self.geo.position) {
            self.geo.position.toString = function() {
                var position = self.geo.position;
                return position.latitude ? position.latitude + ', ' + position.longitude : '';
            }
        }
        if (self.geo && self.geo.address) {
            self.geo.address.toString = function() {
                var address = self.geo.address,
                    str = address.country || '';
                str += (address.region && (', ' + address.region)) || '';
                str += (address.city && (', ' + address.city)) || '';
                return str;
            }
        }
    }

    function geo(whatbrowser) {
        var self = whatbrowser,
            promise = $.Deferred(),
            received_answer = false;
        $.getJSON('//freegeoip.net/json/?callback=?', { timeout: 450 })
            .done(function(data) {
                fill_geo(whatbrowser, 
                    {
                        ip: data.ip,
                        position: {
                            latitude: data.latitude,
                            longitude: data.longitude
                        },
                        address: {
                            country: data.country_name,
                            region: data.region_name,
                            city: data.city
                        }
                    }
                );
                console.log('Geo ready');
                promise.resolve(whatbrowser);
            })
            .fail(function() {
                console.log('Geo failed');
                promise.resolve(whatbrowser);  
            })
            .always(function() {
                received_answer = true;
            });

        // jQuery does not handle cross-domain JSONP errors,
        // need to check for it manually
        window.setTimeout(function() {
            if (!received_answer) {
                console.log('Geo failed');
                promise.resolve(whatbrowser);
            }
        }, 500);
        return promise;
    }

    function WhatBrowser(source) {
        var self = this;
        browser_size(self, source);
        cookies(self, source);
        flash(self, source);
        javafn(self, source);
        language(self, source);
        online(self, source);
        screenfn(self, source);
        ua(self, source);
        if (source) {
            fill_geo(self, source.geo);
        }
    }

    WhatBrowser.create = function(options) {
        var whatbrowser = new WhatBrowser(),
            promise = $.Deferred();
        options = options || {};
        if (options.geo) {
            geo(whatbrowser).always(function(whatbrowser) {
                promise.resolve(whatbrowser);    
            });
        } else {
            promise.resolve(whatbrowser);
        }
        return promise;
    }

    window.WhatBrowser = WhatBrowser;
    return WhatBrowser;

})(window, window.jQuery, window.UAParser, window.swfobject, window.deployJava);