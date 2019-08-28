/*
 * Browser info manager module: webiste info persistence
 */
/*global window*/
(function($, Cookies, Hashcode, WhatBrowser) {
    "use strict";

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
            if (hash && hash.substr(0, 2) === "#!") {
                return { value: hash.substr(2), local: false };
            }
            return null;
        }
        function get_id_cookies() {
            if (Cookies.enabled) {
                var id = Cookies.get("whatbrowser");
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
            var whatbrowser_str = Hashcode.serialize(whatbrowser),
                hash = Hashcode.compress_base64(whatbrowser_str);

            return {
                hash: hash,
                full: window.location.origin + "/#!" + hash
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * Create a new browser info
     */
    function create() {
        var whatbrowser = new WhatBrowser();
        whatbrowser.link = get_long_link(whatbrowser);
        return whatbrowser;
    }

    /**
     * Update existng browser info.
     */
    function update(id, whatbrowser) {
        // do nothing
    }

    /**
     * Load browser info from serialized string.
     */
    function load_from_str(id) {
        var whatbrowser = null;
        log("Loading info from string: " + id);
        try {
            var whatbrowser_str = Hashcode.decompress_base64(id);
            whatbrowser = new WhatBrowser(Hashcode.parse(whatbrowser_str));
            whatbrowser.link = get_long_link(whatbrowser);
            whatbrowser.id =
                whatbrowser.link.hash.substr(0, 3) +
                whatbrowser.link.hash.substr(-5, 3);
            log("Loaded info");
        } catch (e) {
            log("Failed to load info: " + e);
        }
        return whatbrowser;
    }

    /**
     * Load browser info from DB or from serialized string.
     */
    function load(id) {
        return load_from_str(id);
    }

    window.WhatBrowserManager = {
        get_id: get_id,
        create: create,
        load: load
    };

    return window.WhatBrowserManager;
})(window.jQuery, window.Cookies, window.Hashcode, window.WhatBrowser);
