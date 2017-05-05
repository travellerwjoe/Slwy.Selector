/**
 * @preserve jquery.Slwy.Calendar.js
 * @author Joe.Wu
 * @version v0.9.2 - alpha
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        require(['jQuery'], factory)
    } else if (typeof module !== 'undefined' && typeof module.exports === 'object') {
        module.exports = factory(require('jQuery'))
    } else {
        root.SlwySelector = factory(root.jQuery)
    }
}(this, function ($) {
    var prefix = 'slwy',
        tpl = {
            selector: '<div class="' + prefix + '-selector"></div>',
            dropdown: '<div class="' + prefix + '-selector-dropdown"></div>',
            title: '<div class="' + prefix + '-selector-title"></div>',
            optionsList: '<ul class="' + prefix + '-selector-options-list"></ul>',
            search: '<div class="' + prefix + '-selector-search"><input type="search" class="' + prefix + '-selector-search-input" autocomplete="off"></div>',
            opener: '<div class="' + prefix + '-selector ' + prefix + '-selector-opener"></div>'
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

    function Selector(options, $srcElement) {
        var defaults = {
            title: '支持中文搜索',
            titleBar: false,
            data: [],
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
        this.setPosition()
    }

    Selector.prototype.bind = function () {
        var self = this,
            viewIndex = viewCount - 1
        $(document).on(events.keydownEvent, function (e) {
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
                var $prevItem = $hoverItem.prev().length ? $hoverItem.prev() : self.dropdown.$optionsList.find('li').last()
                hoverIndex = hoverIndex > 0 ? hoverIndex - 1 : 0
                //跳过disabled li元素
                while ($prevItem.hasClass(className.disabledClassName)) {
                    hoverIndex--
                    $hoverItem = $prevItem = $prevItem.prev()
                }
                if (hoverIndex < 0) {
                    $hoverItem = self.dropdown.$optionsList.find('li').not('.' + className.disabledClassName).first()
                    hoverIndex = $hoverItem.index()
                }
                curScrollTop = hoverIndex * liHeight
                scrollOffset = curScrollTop > viewStartScrollTop ? listScrollTop : hoverIndex * 30
            } else if (keyCode === 40) {
                var len = self.data.length || self.optionsData.length,
                    $nextItem = $hoverItem.next().length ? $hoverItem.next() : self.dropdown.$optionsList.find('li').first()
                hoverIndex = hoverIndex < len - 1 ? hoverIndex + 1 : len - 1
                //跳过disabled li元素
                while ($nextItem.hasClass(className.disabledClassName)) {
                    hoverIndex++
                    // $hoverItem = $hoverItem.removeClass(hoverClassName).next()
                    $hoverItem = $nextItem = $nextItem.next()
                }
                if (hoverIndex >= len) {
                    $hoverItem = self.dropdown.$optionsList.find('li').not('.' + className.disabledClassName).last()
                    hoverIndex = $hoverItem.index()
                }
                curScrollTop = hoverIndex * liHeight
                scrollOffset = curScrollTop >= viewEndScrollTop ? (hoverIndex - viewIndex) * 30 : listScrollTop
            } else if (keyCode === 13) {
                var data = self.data.length ? self.data[hoverIndex] : self.optionsData[hoverIndex],
                    text = typeof data === 'object' ? self.data.length ? data[self.options.showField] : data.text : data
                if (!data) return
                self.$srcElement.trigger({
                    type: 'selected',
                    text: text,
                    value: data
                })
                $hoverItem.addClass(className.activeClassName).siblings().removeClass(className.activeClassName)
            } else {
                return
            }
            self.dropdown.$optionsList.scrollTop(scrollOffset)
            self.dropdown.hoverIndex = hoverIndex
            self.dropdown.$optionsList.find('li').removeClass(hoverClassName).eq(hoverIndex).addClass(hoverClassName)
        })

        this.$srcElement.on(events.clickEvent, function (e) {
            self.show()
        }).on(events.selectedEvent, function (e) {
            if ($(this).is('input')) {
                $(this).val(e.text)
            } else if ($(this).is('select')) {
                $(this).val(e.value.value)
                self.$opener.text(e.text)
            }
            self.hide()
        })
        $(document).on(events.clickEvent, function (e) {
            if ($(e.target).is(self.$opener || self.$srcElement) || self.$selector.find($(e.target)).length) {
                return
            }
            self.hide()
        })
    }

    Selector.prototype.render = function () {
        if (this.options.titleBar) {
            var $title = $(tpl.title).text(this.options.title)
            this.$selector.prepend($title)
        }
        this.$selector.append(this.dropdown.$dropdown)
    }

    Selector.prototype.show = function () {
        this.$selector.show()
        this.$opener && this.$opener.addClass(prefix + '-selector-opener-expanded')
    }

    Selector.prototype.hide = function () {
        this.$selector.hide()
        this.$opener && this.$opener.removeClass(prefix + '-selector-opener-expanded')
    }

    Selector.prototype.setPosition = function () {
        var $relativeEl = this.$opener || this.$srcElement,
            offset = $relativeEl.offset(),
            height = $relativeEl.outerHeight(),
            width = $relativeEl.outerWidth()
        this.$selector.css({
            top: offset.top + height - 2,
            left: offset.left,
            width: width
        })
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
        var data = this.selector.data.length ? this.selector.data : this.selector.getSelectOptionData()
        this.bind()
        this.render(data)
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
            var index = $(this).index(),
                data = self.selector.data.length ? self.selector.data[index] : self.selector.optionsData[index],
                text = typeof data === 'object' ? self.selector.data.length ? data[self.selector.options.showField] : data.text : data,
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
        var html = '',
            // len = data.length > 15 ? 15 : data.length
            len = data.length
        if (!len) {
            html += '<li class="' + className.disabledClassName + '">抱歉，没有找到结果！</li>'
        } else {
            for (var i = 0; i < len; i++) {
                var clsName = prefix + '-selector-option ',
                    leftClsName = prefix + '-selector-option-left',
                    rightClsName = prefix + '-selector-option-right',
                    item = data[i]

                if (item.disabled || item.Disabled) {
                    clsName += className.disabledClassName
                }
                html += '<li class="' + clsName + '">'
                if (this.selector.data.length) {
                    if (typeof item === 'object') {
                        if (!this.selector.options.showRight) {
                            html += item[this.selector.options.showField]
                        } else {
                            html += '<span class="' + leftClsName + '">' + item[this.selector.options.showField] + '</span>'
                            html += '<span class="' + rightClsName + '">' + item[this.selector.options.showRightFiled] + '</span>'
                        }
                    } else {
                        html += item
                    }
                } else if (this.selector.optionsData.length) {
                    if (item.rightText && this.selector.options.showRight) {
                        html += '<span class="' + leftClsName + '">' + item.text + '</span>'
                        html += '<span class="' + rightClsName + '">' + item.rightText + '</span>'
                    } else {
                        html += item.text
                    }
                }
                html += '</li>'
            }
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
        this.dropdown.$dropdown.prepend(this.$search)
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
        var field = this.data.length ? this.options.showField : 'text',
            rightField = this.options.showRight ? this.data.length ? this.options.showRightFiled : 'rightText' : null,
            data = this.data.length ? this.data : this.optionsData,
            filterData = [],
            reg = new RegExp('^' + keyword.toUpperCase() + '.*')
        if (keyword) {
            for (var i = 0; i < data.length; i++) {
                var item = data[i]
                if (reg.test(item[field].toUpperCase())) {
                    filterData.push(item)
                }
                if (rightField && item[rightField] && reg.test(item[rightField].toUpperCase())) {
                    filterData.push(item)
                }
            }
        } else {
            filterData = data
        }
        console.timeEnd('loop')
        console.time('render')
        this.dropdown.render(filterData)
        console.timeEnd('render')
    }

    function Opener(decorated) {
        this.$opener = $(tpl.opener)
        this.optionsData = []
        decorated.apply(this, Array.prototype.slice.call(arguments, 1))
    }

    Opener.prototype.init = function (decorated) {
        decorated.call(this)
    }

    Opener.prototype.bind = function (decorated) {
        decorated.call(this)
        var self = this
        this.$opener.on(events.clickEvent, function (e) {
            self.show()
        })
    }

    Opener.prototype.render = function (decorated) {
        decorated.call(this)
        var $selected = this.$srcElement.find('option:selected'),
            selectedText = $selected.text(),
            selectedValue = this.$srcElement.val()
        this.$srcElement.after(this.$opener.text(selectedText).data('value', selectedValue).show()).hide()
    }

    Opener.prototype.getSelectOptionData = function () {
        var $options = this.$srcElement.find('option'),
            data = []

        $options.each(function (index, item) {
            var text = $(item).text(),
                rightText = $(item).data('right'),
                value = $(item).attr('value'),
                disabled = $(item).is(':disabled')
            data.push({
                text: text,
                rightText: rightText,
                value: value,
                disabled: disabled
            })
        })
        this.optionsData = data
        return data;
    }


    $.fn.SlwySelector = function (options) {
        var S = Selector
        if (options.search) {
            S = Decorate(S, Search)
        }
        if ($(this).is('select')) {
            S = Decorate(S, Opener)
        }
        new S(options, $(this))

        return $(this);
    }
}))