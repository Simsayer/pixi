var Geometry2d = require('./Geometry2d');
var utils = require('../utils');

/**
 * Used by both Meshes and Sprites, mutable storage for sets of 2d points
 *
 * Can be used for calculation of bounds
 * Doesn't have anything related to particular DisplayObject
 * Renderers can use it to upload data to vertex buffer or to copy data to other buffers
 *
 * @class
 * @memberof PIXI
 */
function GeometryCache2d() {
    Geometry2d.call(this);
    this._transformUid = -1;
    this._transformVersion = -1;
    this._geometryUid = -1;
    this._geometryVersion = -1;
    this.bounds = new PIXI.Rectangle();
}

GeometryCache2d.prototype = Object.create(Geometry2d.prototype);
GeometryCache2d.prototype.constructor = Geometry2d;
module.exports = GeometryCache2d;

GeometryCache2d.prototype.applyTransformStatic = function (transform, geometry) {
    if (this._transformUid === transform.uid &&
        this._transformVersion === transform.versionGlobal &&
        this._geometryUid === geometry.uid &&
        this._geometryVersion === geometry.version) {
        //TODO: we need geometry version too
        //no changes
        return false;
    }
    this._transformUid = transform.uid;
    this._transformVersion = transform.versionGlobal;
    this._geometryUid = geometry.uid;
    this._geometryVersion = geometry.version;

    this.applyTransform(transform, geometry);
    return true;
};

GeometryCache2d.prototype.applyTransform = function(geometry, transform) {
    this.stride = geometry.stride;
    if (!this.vertices || this.size != geometry.size) {
        this.size = geometry.size;
    }

    //TODO: may be optimize for case of rotation===0
    this.applyMatrix(geometry, transform.worldTransform);
};

GeometryCache2d.prototype.applyMatrix = function(geometry, matrix) {
    var bounds = this.bounds;

    var maxX = -Infinity;
    var maxY = -Infinity;

    var minX = Infinity;
    var minY = Infinity;

    var a = matrix.a;
    var b = matrix.b;
    var c = matrix.c;
    var d = matrix.d;
    var tx = matrix.tx;
    var ty = matrix.ty;

    var out = this.vertices;
    var stride = geometry.stride;
    var vertices = geometry.vertices;
    for (var i = 0, j = 0, n = vertices.length; i < n; i += 2, j += stride) {
        var rawX = vertices[j], rawY = vertices[j + 1];
        out[i] = (a * rawX) + (c * rawY) + tx;
        out[i+1] = (d * rawY) + (b * rawX) + ty;
    }

    bounds.x = minX;
    bounds.width = maxX - minX;

    bounds.y = minY;
    bounds.height = maxY - minY;
};
