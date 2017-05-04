(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        require(['jQuery'], factory)
    } else if (typeof module !== 'undefined' && typeof module.exports === 'object') {
        module.exports = factory(require('jQuery'))
    } else {
        root.SlwyCalendar = factory(root.jQuery)
    }
}(this, function ($) {
    var prefix = 'slwy',
        tpl = {
            selector: '<div class="' + prefix + '-selector"></div>',
            dropdown: '<div class="' + prefix + '-selector-dropdown">' +
            '<div class="' + prefix + '-selector-title"></div>' +
            '</div>',
            optionsList: '<ul class="' + prefix + '-selector-options-list"></ul>',
            search: '<div class="' + prefix + '-selector-search"><input type="search" class="' + prefix + '-selector-search-input" autocomplete="off"></div>'
        },
        namespace = '.' + prefix + '.selector',
        events = {
            keyupEvent: 'keyup' + namespace,
            keydownEvent: 'keydown' + namespace,
            inputEvent: 'input' + namespace,
            mouseoverEvent: 'mouseover' + namespace,
            focusEvent: 'focus' + namespace,
            blurEvent: 'blur' + namespace,
            clickEvent: 'click' + namespace,
            hoverEvent: 'hover' + namespace,
            selectedEvent: 'selected' + namespace
        },
        className = {
            hoverClassName: prefix + '-selector-hover',
            activeClassName: prefix + '-selector-active',
            disabledClassName: prefix + '-selector-option-disabled'
        },
        viewCount = 10, //列表每页显示数量
        specialKeyCode = ['112-123', 27, 9, 20, '16-19', '91-93', 13, '33-40', 45, 46, 144, 145]//特殊按键的keyCode



    function getMethods(theClass) {
        var proto = theClass.prototype;

        var methods = [];

        for (var methodName in proto) {
            var m = proto[methodName];

            if (typeof m !== 'function') {
                continue;
            }

            if (methodName === 'constructor') {
                continue;
            }

            methods.push(methodName);
        }

        return methods;
    }

    function Decorate(SuperClass, DecoratorClass) {
        var decoratedMethods = getMethods(DecoratorClass);
        var superMethods = getMethods(SuperClass);

        function DecoratedClass() {
            var unshift = Array.prototype.unshift;

            var argCount = DecoratorClass.prototype.constructor.length;

            var calledConstructor = SuperClass.prototype.constructor;

            if (argCount > 0) {
                unshift.call(arguments, SuperClass.prototype.constructor);

                calledConstructor = DecoratorClass.prototype.constructor;
            }

            calledConstructor.apply(this, arguments);
        }

        DecoratorClass.displayName = SuperClass.displayName;

        function ctr() {
            this.constructor = DecoratedClass;
        }

        DecoratedClass.prototype = new ctr();

        for (var m = 0; m < superMethods.length; m++) {
            var superMethod = superMethods[m];

            DecoratedClass.prototype[superMethod] =
                SuperClass.prototype[superMethod];
        }

        var calledMethod = function (methodName) {
            var originalMethod = function () { };

            if (methodName in DecoratedClass.prototype) {
                originalMethod = DecoratedClass.prototype[methodName];
            }

            var decoratedMethod = DecoratorClass.prototype[methodName];

            return function () {
                var unshift = Array.prototype.unshift;

                unshift.call(arguments, originalMethod);

                return decoratedMethod.apply(this, arguments);
            };
        };

        for (var d = 0; d < decoratedMethods.length; d++) {
            var decoratedMethod = decoratedMethods[d];

            DecoratedClass.prototype[decoratedMethod] = calledMethod(decoratedMethod);
        }

        return DecoratedClass;
    }

    function Selector(options, $srcElement) {
        var defaults = {
            title: '支持中文搜索',
            data: null,
            showField: '',
            showRight: false,
            showRightFiled: '',
            search: false,
            searchPlaceholder: '搜索'
        }
        this.options = $.extend(true, defaults, options)
        this.$selector = $(tpl.selector)
        this.$srcElement = $srcElement
        this.data = this.options.data

        this.dropdown = new Dropdown(this)
        this.init()
    }

    Selector.prototype.init = function (container) {
        this.$selector.appendTo('body')
        this.bind()
        this.render()
    }

    Selector.prototype.bind = function () {
        var self = this,
            viewIndex = viewCount - 1
        $(document).on(events.keydownEvent, function (e) {
            console.log(e.keyCode)
            if (self.$selector.is(':hidden')) {
                return
            }

            var keyCode = e.keyCode || e.which,
                hoverIndex = self.dropdown.hoverIndex,
                hoverClassName = className.hoverClassName,
                $hoverItem = self.dropdown.$optionsList.find('.' + hoverClassName),
                listHeight = self.dropdown.$optionsList.outerHeight(),
                liHeight = self.dropdown.$optionsList.find('li').outerHeight(),
                listScrollTop = self.dropdown.$optionsList.scrollTop(),
                scrollOffset,
                viewStartScrollTop = listScrollTop,//当前列表显示的第一个元素的滚动高度
                viewEndScrollTop = viewStartScrollTop + listHeight,//当前列表显示的最后一个元素的滚动高度
                curScrollTop //当前li的滚动高度
            if (keyCode === 38) {
                hoverIndex = hoverIndex > 0 ? hoverIndex - 1 : 0
                //跳过disabled li元素
                while ($hoverItem.prev().hasClass(className.disabledClassName)) {
                    hoverIndex--
                    $hoverItem = $hoverItem.removeClass(hoverClassName).prev()
                }
                curScrollTop = hoverIndex * liHeight
                scrollOffset = curScrollTop > viewStartScrollTop ? listScrollTop : hoverIndex * 30
            } else if (keyCode === 40) {
                hoverIndex = hoverIndex < self.data.length - 1 ? hoverIndex + 1 : self.data.length - 1
                //跳过disabled li元素
                while ($hoverItem.next().hasClass(className.disabledClassName)) {
                    hoverIndex++
                    $hoverItem = $hoverItem.removeClass(hoverClassName).next()
                }
                curScrollTop = hoverIndex * liHeight
                scrollOffset = curScrollTop >= viewEndScrollTop ? (hoverIndex - viewIndex) * 30 : listScrollTop
            } else if (keyCode === 13) {
                self.$srcElement.trigger({
                    type: 'selected',
                    text: $hoverItem.data('text'),
                    value: $hoverItem.data('data')
                })
                $hoverItem.addClass(className.activeClassName).siblings().removeClass(className.activeClassName)
            }
            self.dropdown.$optionsList.scrollTop(scrollOffset)
            self.dropdown.hoverIndex = hoverIndex
            self.dropdown.$optionsList.find('li').removeClass(hoverClassName).eq(hoverIndex).addClass(hoverClassName)
        })

        if (this.$srcElement.is('input')) {
            this.$srcElement.on(events.clickEvent, function (e) {
                self.$selector.show()
            }).on(events.selectedEvent, function (e) {
                $(this).val(e.text)
                self.$selector.hide()
            })
            $(document).on(events.clickEvent, function (e) {
                if ($(e.target).is(self.$srcElement) || self.$selector.find($(e.target)).length) {
                    return
                }
                self.$selector.hide()
            })
        }
    }

    Selector.prototype.render = function () {
        this.$selector.append(this.dropdown.$dropdown)
    }

    function Dropdown(selector) {
        this.selector = selector
        this.$dropdown = $(tpl.dropdown)
        this.$optionsList = $(tpl.optionsList)
        this.hoverIndex = -1
        this.activeIndex = -1
        this.init()
    }

    Dropdown.prototype.init = function () {
        this.$dropdown.find('.' + prefix + '-selector-title').text(this.selector.options.title)
        this.bind()
        this.render(this.selector.data)
    }

    Dropdown.prototype.bind = function () {
        var self = this
        this.$optionsList.on(events.hoverEvent, 'li', function (e) {
            if ($(this).hasClass(className.disabledClassName)) return
            var hoverClassName = className.hoverClassName
            $(this).addClass(hoverClassName).siblings().removeClass(hoverClassName)
            self.hoverIndex = $(this).index()
        }).on(events.clickEvent, 'li', function (e) {
            if ($(this).hasClass(className.disabledClassName)) return
            var index  = $(this).index(),
                data = self.selector.data[index],
                text = data[self.selector.options.showField],
                activeClassName = className.activeClassName
            self.selector.$srcElement.trigger({
                type: 'selected',
                value: data,
                text: text
            })

            $(this).addClass(activeClassName).siblings().removeClass(activeClassName)
        })
    }

    Dropdown.prototype.render = function (data) {
        this.$optionsList.html('')
        if (!data.length) return
        var html = '',
            // len = data.length > 15 ? 15 : data.length
            len = data.length
        console.log(len)
        for (var i = 0; i < len; i++) {
            var clsName = prefix + '-selector-option ',
                leftClsName = prefix + '-selector-option-left',
                rightClsName = prefix + '-selector-option-right',
                item = data[i]
            if (item.disabled || item.Disabled) {
                clsName += className.disabledClassName
            }
            html += '<li class="' + clsName + '">'
            if (!this.selector.options.showRight) {
                html += item[this.selector.options.showField]
            } else {
                html += '<span class="' + leftClsName + '">' + item[this.selector.options.showField] + '</span>'
                html += '<span class="' + rightClsName + '">' + item[this.selector.options.showRightFiled] + '</span>'
            }
            html += '</li>'
        }

        this.$optionsList.html(html).appendTo(this.$dropdown)
    }

    function Search(decorated) {
        this.$search = $(tpl.search)
        decorated.apply(this, Array.prototype.slice.call(arguments, 1))
    }

    Search.prototype.init = function (decorated) {
        decorated.call(this)
    }

    Search.prototype.render = function (decorated) {
        decorated.call(this)
        this.dropdown.$dropdown.find('.' + prefix + '-selector-title').after(this.$search)
        this.$search.find('input').attr('placeholder', this.options.searchPlaceholder)
    }

    Search.prototype.bind = function (decorated) {
        decorated.call(this)
        var self = this
        this.$search.find('input').on(events.keyupEvent + ' ' + events.inputEvent, function (e) {
            var keyCode = e.keyCode || e.which
            for (var i = 0; i < specialKeyCode.length; i++) {
                var item = specialKeyCode[i].toString(),
                    arr
                if (item.indexOf('-') >= 0) {
                    arr = item.split('-')
                    if (keyCode >= arr[0] || keyCode <= arr[1]) {
                        return
                    }
                } else {
                    if (keyCode == item) {
                        return
                    }
                }
            }
            console.time('search')
            self.filter($(this).val())
            console.timeEnd('search')
        })
    }

    Search.prototype.filter = function (decorated, keyword) {
        decorated.call(this)
        console.time('loop')
        var field = this.options.showField,
            rightField = this.options.showRight ? this.options.showRightFiled : null,
            filterData = [],
            reg = new RegExp('^' + keyword.toUpperCase() + '.*')

        if (keyword) {
            // $.each(this.data, function (index, item) {
            for (var i = 0; i < this.data.length; i++) {
                var item = this.data[i]
                if (reg.test(item[field].toUpperCase())) {
                    filterData.push(item)
                }
                if (rightField && reg.test(item[rightField].toUpperCase())) {
                    filterData.push(item)
                }
            }
        } else {
            filterData = this.data
        }
        console.timeEnd('loop')
        console.time('render')
        this.dropdown.render(filterData)
        console.timeEnd('render')
    }


    $.fn.SlwySelector = function (options) {
        if (options.search) {
            var SelectorWithSearch = Decorate(Selector, Search)
            var s = new SelectorWithSearch(options, $(this))
        } else {
            var s = new Selector(options, $(this))
        }
        return $(this);
    }
}))