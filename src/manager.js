/*
 * Browser info manager module: webiste info persistence
 */
(function($, Cookies, WhatBrowser) {
    'use strict';

    var PARSE_BASE_URL = 'https://api.parse.com/1/classes/WhatBrowser',
        PARSE_HEADERS = {
                    'X-Parse-Application-Id': 'WxMn71WOwf2RM6s6vYR57Th1rsfRplumcDDaWQxF',
                    'X-Parse-REST-API-Key': 'EA4xA8UNhbUK5eMyHepEJnUWDyCzoMZxr0t1HOmp'
                },
        TIMEOUT = 1000;
    var parseEnabled = true;

    /**
     * Get browser info id from url hash or from cookies
     */
    function get_id() {
        function get_id_url() {
            var hash = window.location.hash;
            if (hash && hash.substr(0,2) === '#!') {
                return { value: hash.substr(2), own: false };
            }
            return null;
        }
        function get_id_cookies() {
            if (Cookies.enabled) {
                var id = Cookies.get('whatbrowser')
                if (id) {
                    return { value: id, own: true };
                }
            }
            return null;
        }
        return get_id_url() || get_id_cookies();
    }

    /**
     * Persist new browser info to DB.
     */
    function create() {
        var loader = WhatBrowser.create({ geo: true }),
            promise = $.Deferred();
        
        loader.done(function(whatbrowser) {
            if (parseEnabled) {
                // console.log('Saving info');
                $.ajax(PARSE_BASE_URL, {
                    contentType: 'application/json',
                    data: JSON.stringify(whatbrowser),
                    dataType: 'json',
                    headers: PARSE_HEADERS,
                    timeout: TIMEOUT,
                    type: 'POST'
                })
                .done(function(response) {
                    // console.log('Saved info');
                    whatbrowser.id = response.objectId;
                    whatbrowser.link = 'http://whatbrowser.ru/#!' + whatbrowser.id;
                    // save id to cookies to load it later on page refresh
                    if (Cookies.enabled) {
                        Cookies.set('whatbrowser', whatbrowser.id, { expires: 28800 });
                    }
                    promise.resolve(whatbrowser);
                })
                .fail(function(xhr, status, error) {
                    // console.log('Failed to save info, status ' + status + ', error ' + error);
                    promise.reject(whatbrowser, error);  
                });
            } else {
                // console.log('Failed to save info, Parse is not initialized');
                promise.reject(whatbrowser, 'Parse not initialized');
            }
        });
        
        return promise;
    }

    /**
     * Load browser info from DB.
     */
    function load(id) {
        var promise = $.Deferred();
        if (parseEnabled) {
            // console.log('Loading info #' + id);
            $.ajax(PARSE_BASE_URL + '/' + id, {
                contentType: 'application/json',
                dataType: 'json',
                headers: PARSE_HEADERS,
                timeout: TIMEOUT,
                type: 'GET'
            })
            .done(function(info) {
                // console.log('Loaded info #' + id);
                var whatbrowser = new WhatBrowser(info);
                whatbrowser.id = id;
                whatbrowser.link = 'http://whatbrowser.ru/#!' + whatbrowser.id;
                promise.resolve(whatbrowser);
            })
            .fail(function(xhr, status, error) {
                // console.log('Failed to load info #' + id + ', status ' + status + ', error ' + error);
                promise.reject(error);  
            });
        } else {
            // console.log('Failed to load info, Parse is not initialized');
            promise.reject('Parse not initialized');
        }
        return promise;
    }

    window.WhatBrowserManager = {
        get_id: get_id,
        create: create,
        load: load
    }
    return window.WhatBrowserManager;

})(window.jQuery, window.Cookies, window.WhatBrowser, window.Parse);
