/**
 * @typedef Options
 * @property {string} group
 * @property {string} valuePattern
 * @property {string} prefix
 * @property {string} pattern
 * @property {string} postfix
 * @property {RegExp} [regKey]
 */

/** @type {Options} */
const defaults = {
  group: 'key',
  /** means "not delimiter" */
  valuePattern: '[^\\/]*',
  prefix: ':',
  pattern: '[\\w0-9]+',
  postfix: '',
}
defaults.regKey = keyReg()

module.exports = {
  "__esModule": true,
  obj2path,
  path2obj 
}

/**
 * @param {Object.<string, string>} source
 * @param {string} schema
 * @param {Options | undefined} options 
 * @this {Object}
 */
function obj2path(source, schema, options = undefined) {
  return schema.replace(
    keyReg(
      //optioning.call(this, options)
      options
    ),
    (_, key) => source[key]
  )
}

/**
 * @param {string} path
 * @param {string} schema
 * @param {Options} [options] 
 * @this {Object}
 */
function path2obj(path, schema, options = undefined) {
  const reg = route2reg(schema, options) 
  return (
    reg.exec(path)
    || {groups: undefined}
  ).groups
}

/**
 * @param {string} route
 * @param {Options} [options] 
 * @this {Object}
 */
function route2reg(route, options) {
  const o = options
  , {
    valuePattern, 
    group
  } = o
  //TODO: Fix
  , {
    regKey
  } = {regKey: keyReg(options)}
  || o
  
  return new RegExp(
    route
    .replace('/', '\\/')
    .replace(
      regKey,
      `(?<$<${group}>>${valuePattern})`
    )
  )
}

/**
 * @param {Options} [options] 
 * @this {Object}
 */
function optioning(options) {
  return Object.assign({}, defaults, /*this || {},*/ options)
}

/**
 * @param {Options} [options] 
 * @this {Object}
 */
function keyReg(options) {
  if (options && 'regKey' in options)
    return options.regKey
  const {
    prefix, pattern, postfix, group
  } = optioning.call(this, options)
  
  let regKey
  try {
    regKey = new RegExp(`${prefix}(${group ? `?<${group}>` : ""}${pattern})${postfix}`, 'g')
  } catch(e) {
    regKey = new RegExp(`${prefix}(${pattern})${postfix}`, 'g')
  }

  if (options)
    options.regKey = regKey
  return regKey
}

/*
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactIconBase = require('react-icon-base');

var _reactIconBase2 = _interopRequireDefault(_reactIconBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _reactIconBase2.default;
module.exports = exports['default'];
*/