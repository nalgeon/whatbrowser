/**
 * Hashcode module: object to string serialization
 */
(function(JSON, LZString) {
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

    window.Hashcode = {
        parse: JSON.parse,
        serialize: JSON.stringify,
        compress_base64: LZString.compressToBase64,
        decompress_base64: LZString.decompressFromBase64
    };

    return window.Hashcode;
    
})(window.JSON, window.LZString);