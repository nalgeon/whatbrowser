/**
 * Hashcode module: object to string serialization
 */
/*global window*/
(function(JSON, LZString) {
    'use strict';

    window.Hashcode = {
        parse: JSON.parse,
        serialize: JSON.stringify,
        compress_base64: LZString.compressToBase64,
        decompress_base64: LZString.decompressFromBase64
    };

    return window.Hashcode;

})(window.JSON, window.LZString);
