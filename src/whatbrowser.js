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
                height: window.innerHeight,
                width: window.innerWidth
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
                version: swfobject.getFlashPlayerVersion()
            };
        }, source);
        self.flash.toString = function() {
            return self.flash.enabled
                ? self.flash.version.major + '.' + 
                  self.flash.version.minor + '.' + 
                  self.flash.version.release
                : 'нет';
        };
    }

    function javafn(whatbrowser, source) {
        var self = whatbrowser;
        load_property(whatbrowser, 'java', function() {
            return {
                enabled: navigator.javaEnabled(),
                version: deployJava.getJREs().shift() || ''
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
            return {
                color_depth: window.screen.colorDepth,
                height: window.screen.height,
                width: window.screen.width
            };
        }, source);
        self.screen.toString = function() {
            return self.screen.width + ' x ' + self.screen.height + ' px, ' + self.screen.color_depth + ' bit';
        };
    }

    function ua(whatbrowser, source) {
        var self = whatbrowser;
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

    function geo(whatbrowser) {
        var self = whatbrowser;
        $.getJSON('//freegeoip.net/json/?callback=?', function(data) {
            self.geo = {
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
            };
            self.geo.position.toString = function() {
                var position = self.geo.position;
                return position.latitude ? position.latitude + ', ' + position.longitude : '';
            }
            self.geo.address.toString = function() {
                var address = self.geo.address,
                    str = address.country || '';
                str += (address.region && (', ' + address.region)) || '';
                str += (address.city && (', ' + address.city)) || '';
                return str;
            }
            if (WhatBrowser.on_geo) {
                WhatBrowser.on_geo(whatbrowser);
            }
        });
    }

    function WhatBrowser(source, options) {
        var self = this;
        options = options || {};
        browser_size(self, source);
        cookies(self, source);
        flash(self, source);
        javafn(self, source);
        language(self, source);
        online(self, source);
        screenfn(self, source);
        ua(self, source);
        if (options.geo) {
            geo(self, source);
        }
    }

    WhatBrowser.on_geo = null;

    window.WhatBrowser = WhatBrowser;
    return WhatBrowser;

})(window, jQuery, window.UAParser, window.swfobject, window.deployJava);