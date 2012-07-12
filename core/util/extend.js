Array.prototype.in_array = function(entity) {
    for (var idx in this) {
        if (this[idx] === entity)
            return true;
    }
    return false;
};

Array.prototype.indexOf = function (obj, fromIndex) {
    for (var i = (fromIndex || 0); i < this.length; i++) {
        if (this[i] === obj) {
            return i;
        }
    }
    return -1;
};

Array.prototype.removeItem = function(obj) {
    var index = this.indexOf(obj);
    if (-1 === index)return;

    this.splice(index, 1);
};

String.prototype.startswith = function(entity) {
    if (!entity) return false;
    if ('string' !== typeof(entity)) return false;

    return 0 === this.indexOf(entity);
};

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
};