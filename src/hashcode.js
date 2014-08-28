/**
 * Hashcode module: object to string serialization
 */
(function() {
    'use strict';

    /**
     * Implemantation of Java's String.hashcode.
     * http://stackoverflow.com/a/7616484
     */
    function hashcode(str) {
        var hash = 0, i, chr, len;
        if (str.length == 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
            chr   = str.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    /**
     * Serialize object to a string. If object property is a function, it is ignored.
     * http://pmav.eu/stuff/javascript-hash-code/source/
     */
    function serialize(parent, element) {
        var type, 
            obj = element ? parent[element] : parent,
            serialized = '';

        function quote(el) {
            return '"' + el + '"';
        }
        
        type = typeof obj;

        if (type === 'object') {
            if (element) {
                serialized += quote(element) + ':{';
            } else {
                serialized += '{';
            }
            for (var child in obj) {
                serialized += serialize(obj, child);
            }
            serialized += '},';
        } else if (type === 'function') {
            // do nothing
        } else if (type === 'string') {
            serialized += quote(element) + ':' + quote(obj) + ',';
        } else {
            serialized += quote(element) + ':' + obj + ',';
        }

        return serialized;
    }

    window.Hashcode = {
        serialize: window.JSON ? window.JSON.stringify : serialize
    };

    return window.Hashcode;
    
})();