/*
 * Browser info manager module: webiste info persistence
 */
/*global window*/
(function($, Cookies, Hashcode, WhatBrowser) {
    'use strict';

    var PARSE_BASE_URL = 'https://api.parse.com/1/classes/WhatBrowser',
        PARSE_HEADERS = {
                    'X-Parse-Application-Id': 'WxMn71WOwf2RM6s6vYR57Th1rsfRplumcDDaWQxF',
                    'X-Parse-REST-API-Key': 'EA4xA8UNhbUK5eMyHepEJnUWDyCzoMZxr0t1HOmp'
                },
        SAVE_TIMEOUT = 1000,
        LOAD_TIMEOUT = 2000,
        BASE_URL = 'http://whatbrowser.ru/';

    function log(message) {
        // console.log(message);
        return message;
    }

    /**
     * Get browser info id from url hash or from cookies
     */
    function get_id() {
        function get_id_url() {
            var hash = window.location.hash;
            if (hash && hash.substr(0, 2) === '#!') {
                return { value: hash.substr(2), local: false };
            }
            return null;
        }
        function get_id_cookies() {
            if (Cookies.enabled) {
                var id = Cookies.get('whatbrowser');
                if (id) {
                    return { value: id, local: true };
                }
            }
            return null;
        }
        return get_id_url() || get_id_cookies() || { value: null, local: true };
    }

    function get_long_link(whatbrowser) {
        try {
            var whatbrowser_str = Hashcode.serialize(whatbrowser);
            return BASE_URL + '#!' + Hashcode.compress_base64(whatbrowser_str);
        } catch (e) {
            return '';
        }
    }

    function get_short_link(whatbrowser) {
        return BASE_URL + '#!' + whatbrowser.id;
    }

    /**
     * Create a new browser info
     */
    function create(id) {
        var loader = WhatBrowser.create(),
            promise = $.Deferred();

        loader.done(function(whatbrowser) {
            if (id) {
                whatbrowser.id = id;
                whatbrowser.link = get_short_link(whatbrowser);
            } else {
                whatbrowser.link = get_long_link(whatbrowser);
            }
            promise.resolve(whatbrowser);
        });

        return promise;
    }

    /**
     * Create a new browser info and persist it to DB.
     */
    function create_and_save() {
        var loader = WhatBrowser.create(),
            promise = $.Deferred();

        loader.done(function(whatbrowser) {
            log('Saving new info');
            $.ajax(PARSE_BASE_URL, {
                contentType: 'application/json',
                data: JSON.stringify(whatbrowser),
                dataType: 'json',
                headers: PARSE_HEADERS,
                timeout: SAVE_TIMEOUT,
                type: 'POST'
            })
            .done(function(response) {
                log('Saved info');
                whatbrowser.id = response.objectId;
                whatbrowser.link = get_short_link(whatbrowser);
                // save id to cookies to load it later on page refresh
                if (Cookies.enabled) {
                    Cookies.set('whatbrowser', whatbrowser.id, { expires: 28800 });
                }
                promise.resolve(whatbrowser);
            })
            .fail(function(xhr, status, error) {
                log('Failed to save info, status ' + status + ', error ' + error);
                whatbrowser.link = get_long_link(whatbrowser);
                promise.reject(whatbrowser, error);
            });
        });

        return promise;
    }

    /**
     * Update existng browser info.
     */
    function update(id, whatbrowser) {
        var promise = $.Deferred();

        log('Updating info');
        $.ajax(PARSE_BASE_URL + '/' + id, {
            contentType: 'application/json',
            data: JSON.stringify(whatbrowser),
            dataType: 'json',
            headers: PARSE_HEADERS,
            timeout: SAVE_TIMEOUT,
            type: 'PUT'
        })
        .done(function() {
            log('Updated info');
            promise.resolve(whatbrowser);
        })
        .fail(function(xhr, status, error) {
            log('Failed to update info, status ' + status + ', error ' + error);
            promise.reject(whatbrowser, error);
        });

        return promise;
    }

    /**
     * Load browser info from serialized string.
     */
    function load_from_str(id) {
        var whatbrowser,
            whatbrowser_str,
            promise = $.Deferred();

        log('Loading info from string: ' + id);
        try {
            whatbrowser_str = Hashcode.decompress_base64(id);
            whatbrowser = new WhatBrowser(Hashcode.parse(whatbrowser_str));
            whatbrowser.link = get_long_link(whatbrowser);
            whatbrowser.id = whatbrowser.link.substr(whatbrowser.link.indexOf('/#!') + 3);
            log('Loaded info');
            promise.resolve(whatbrowser);
        } catch (e) {
            log('Failed to load info: ' + e);
            promise.reject(whatbrowser, 'Failed to load info from string:' + id);
        }
        return promise;
    }

    /**
     * Load browser info from DB.
     */
    function load_from_db(id) {
        var promise = $.Deferred();

        log('Loading info #' + id);
        $.ajax(PARSE_BASE_URL + '/' + id, {
            contentType: 'application/json',
            dataType: 'json',
            headers: PARSE_HEADERS,
            timeout: LOAD_TIMEOUT,
            type: 'GET'
        })
        .done(function(info) {
            log('Loaded info #' + id);
            var whatbrowser = new WhatBrowser(info);
            whatbrowser.id = id;
            whatbrowser.link = get_short_link(whatbrowser);
            promise.resolve(whatbrowser);
        })
        .fail(function(xhr, status, error) {
            log('Failed to load info #' + id + ', status ' + status + ', error ' + error);
            promise.reject(error);
        });

        return promise;
    }

    /**
     * Load browser info from DB or from serialized string.
     */
    function load(id) {
        if (id.length === 10) {
            return load_from_db(id);
        } else {
            return load_from_str(id);
        }
    }

    window.WhatBrowserManager = {
        get_id: get_id,
        create: create,
        create_and_save: create_and_save,
        update: update,
        load: load
    };

    return window.WhatBrowserManager;

})(window.jQuery, window.Cookies, window.Hashcode, window.WhatBrowser);
