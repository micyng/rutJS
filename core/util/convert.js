jsfx.util.convert = function() {

};

jsfx.util.convert.getDictKeys = function(dict) {
    if (!dict)return [];
    var arr = [];
    for (var k in dict) {
        arr.push(k);
    }

    return arr;
};

jsfx.util.convert.getDictLength = function(dict) {
    if (!dict)return 0;
    var len = 0;
    for (var k in dict)
        ++len;
    return len;
};

jsfx.util.convert.getDictValues = function(dict) {
    if (!dict)return [];
    var arr = [];
    for (var k in dict) {
        arr.push(dict[k]);
    }

    return arr;
};

jsfx.util.convert.range = function(begin, end) {
    if (null === begin
            || null === end
            || undefined === begin
            || undefined === end
            || 'number' !== typeof(begin)
            || 'number' !== typeof(end)
            || begin >= end)
        throw new TypeError("invalid begin or end for range: " + begin + ", " + end);

    var arr = [];
    for (var i = begin; i < end; i++) {
        arr.push(i);
    }

    return arr;
};

jsfx.util.convert.genGuid = function() {
    var guid = "";
    for (var i = 1; i <= 32; i++) {
        var n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
            guid += "-";
    }
    return guid;
};


jsfx.util.fmt = function() {

};

jsfx.util.fmt.isDictKeysOK = function(dict, requiredKeys) {
    if (!dict) return false;
    if (!requiredKeys) return false;

    for (var i = 0; i < requiredKeys.length; i++) {
        var k = requiredKeys[i];
        var v = dict[k];
        if ("" === v)continue;
        if (undefined === v)return false;
    }

    return true;
};

jsfx.util.fmt.isCN = function(input) {
    if (!input)return false;
    if ('string' !== typeof(input))return false;

    return (/^[\u4e00-\u9fa5]+$/).test(input);
};

jsfx.util.fmt.isArray = function (o) {
    return Object.prototype.toString.call(o) === '[object Array]' || 'in_array' in o;
};