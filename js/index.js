/*import Selector from './selector'
import Dropdown from './dropdown'
import Opener from './opener'
import Search from './search'
import Multiple from './multiple'
import '../sass/selector.scss'*/
var Selector = require('./selector'),
    Dropdown = require('./dropdown'),
    Opener = require('./opener'),
    Search = require('./search'),
    Multiple = require('./multiple')
require('../sass/selector.scss')

function getMethods(theClass) {
    var proto = theClass.prototype,
        methods = [];

    for (var methodName in proto) {
        var m = proto[methodName]

        if (typeof m !== 'function') {
            continue
        }
        if (methodName === 'constructor') {
            continue
        }
        methods.push(methodName);
    }
    return methods;
}

function Decorate(SuperClass, DecoratorClass) {
    var decoratedMethods = getMethods(DecoratorClass),
        superMethods = getMethods(SuperClass)

    function DecoratedClass() {
        var unshift = Array.prototype.unshift,
            argCount = DecoratorClass.prototype.constructor.length,
            calledConstructor = SuperClass.prototype.constructor

        if (argCount > 0) {
            unshift.call(arguments, SuperClass.prototype.constructor)
            calledConstructor = DecoratorClass.prototype.constructor
        }
        calledConstructor.apply(this, arguments)
    }

    DecoratorClass.displayName = SuperClass.displayName

    function ctr() {
        this.constructor = DecoratedClass;
    }

    DecoratedClass.prototype = new ctr();

    for (var i = 0; i < superMethods.length; i++) {
        var superMethod = superMethods[i]

        DecoratedClass.prototype[superMethod] = SuperClass.prototype[superMethod]
    }

    var calledMethod = function (methodName) {
        var originalMethod = function () { },
            decoratedMethod = DecoratorClass.prototype[methodName]

        if (methodName in DecoratedClass.prototype) {
            originalMethod = DecoratedClass.prototype[methodName]
        }

        return function () {
            var unshift = Array.prototype.unshift

            unshift.call(arguments, originalMethod)
            return decoratedMethod.apply(this, arguments)
        };
    };

    for (var i = 0; i < decoratedMethods.length; i++) {
        var decoratedMethod = decoratedMethods[i]

        DecoratedClass.prototype[decoratedMethod] = calledMethod(decoratedMethod)
    }

    return DecoratedClass;
}

$.fn.SlwySelector = function (options) {
    try {
        var S = Selector,
            isSelect = $(this).is('select'),
            isMultiple = (this).attr('multiple')
        if (options.search || isMultiple) {
            S = Decorate(S, Search)
        }
        if (isSelect) {
            S = Decorate(S, Opener)
            if (isMultiple) {
                S = Decorate(S, Multiple)
            }
        }
        new S(options, $(this)).init()
    } catch (e) {
        console.error(e)
    }
    return $(this);
}