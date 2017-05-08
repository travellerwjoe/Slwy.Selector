/**
 * @preserve jquery.Slwy.Calendar.js
 * @author Joe.Wu
 * @version v0.10.3
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
            opener: '<div class="' + prefix + '-selector ' + prefix + '-selector-opener" tabindex="0"></div>'
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
            disabledClassName: prefix + '-selector-option-disabled',
            optionClassName: prefix + '-selector-option',
            optgroupClassName: prefix + '-selector-optgroup',
            hasOptgroupClassName: prefix + '-selector-has-optgroup'
        },
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
            searchPlaceholder: '搜索',
            viewCount: 10,
            width: null
        }
        this.options = $.extend(true, defaults, options)
        this.$selector = $(tpl.selector)
        this.$srcElement = $srcElement
        this.data = this.options.data
        this.hasSetPosition = false

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
            viewIndex = this.options.viewCount - 1
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
                //上移
                var $prevItem = $hoverItem.prev().length ? $hoverItem.prev() : self.dropdown.$optionsList.find('li').last()
                hoverIndex = hoverIndex > 0 ? hoverIndex - 1 : 0
                //跳过disabled li元素
                while ($prevItem.hasClass(className.disabledClassName) || $prevItem.hasClass(className.optgroupClassName)) {
                    hoverIndex--
                    $hoverItem = $prevItem = $prevItem.prev()
                }
                if (hoverIndex < 0) {
                    $hoverItem = self.dropdown.$optionsList.find('li.' + className.optionClassName).not('.' + className.disabledClassName).first()
                    hoverIndex = $hoverItem.index()
                }
                curScrollTop = hoverIndex * liHeight
                scrollOffset = curScrollTop > viewStartScrollTop ? listScrollTop : hoverIndex * liHeight
            } else if (keyCode === 40) {
                //下移
                var len = self.dropdown.$optionsList.find('li').length,
                    $nextItem = $hoverItem.next().length ? $hoverItem.next() : self.dropdown.$optionsList.find('li').first()
                hoverIndex = hoverIndex < len - 1 ? hoverIndex + 1 : len - 1
                //跳过disabled li元素
                while ($nextItem.hasClass(className.disabledClassName) || $nextItem.hasClass(className.optgroupClassName)) {
                    // $hoverItem = $hoverItem.removeClass(hoverClassName).next()
                    hoverIndex++
                    $hoverItem = $nextItem = $nextItem.next()
                }
                if (hoverIndex >= len) {
                    $hoverItem = self.dropdown.$optionsList.find('li.' + className.optionClassName).not('.' + className.disabledClassName).last()
                    hoverIndex = $hoverItem.index()
                }
                curScrollTop = hoverIndex * liHeight
                scrollOffset = curScrollTop >= viewEndScrollTop ? (hoverIndex - viewIndex) * liHeight : listScrollTop
            } else if (keyCode === 13) {
                self.triggerSelected($hoverItem)
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
        if (!this.hasSetPosition) {
            this.setPosition()
            this.dropdown.setListHeigth()
        }
        this.$opener && this.$opener.addClass(prefix + '-selector-opener-expanded').blur()
        this.$search && this.$search.find('input').focus()
    }

    Selector.prototype.hide = function () {
        this.$selector.hide()
        this.$opener && this.$opener.removeClass(prefix + '-selector-opener-expanded')
    }

    Selector.prototype.setPosition = function () {
        var $relativeEl = this.$opener || this.$srcElement,
            offset = $relativeEl.offset(),
            height = $relativeEl.outerHeight(),
            width = typeof this.options.width === 'number' ? this.options.width : $relativeEl.outerWidth()
        this.$selector.css({
            top: offset.top + height - 2,
            left: offset.left,
            width: width
        })
        this.hasSetPosition = true
    }

    Selector.prototype.triggerSelected = function ($targetEl) {
        if ($targetEl.hasClass(className.disabledClassName)) return
        var index = $targetEl.data('index'),
            subindex = $targetEl.data('subindex'),
            data = this.data.length ? this.data[index] : this.optionsData[index],
            field = this.data.length ? this.options.showField : 'text',
            text

        if (!data) return
        if (typeof data === 'object') {
            if (data.optgroup && data.options && typeof subindex === 'number') {
                data = data.options[subindex]
            }
            text = data[field]
        } else {
            text = data
        }

        this.$srcElement.trigger({
            type: 'selected',
            value: data,
            text: text
        })

        $targetEl.addClass(className.activeClassName).siblings().removeClass(className.activeClassName)
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
        this.$optionsList.on(events.hoverEvent, 'li.' + className.optionClassName, function (e) {
            if ($(this).hasClass(className.disabledClassName)) return
            var hoverClassName = className.hoverClassName
            $(this).addClass(hoverClassName).siblings().removeClass(hoverClassName)
            self.hoverIndex = $(this).index()
        }).on(events.clickEvent, 'li.' + className.optionClassName, function (e) {
            self.selector.triggerSelected($(this))
        })
    }

    Dropdown.prototype.render = function (data) {
        this.$optionsList.html('')
        var html = '',
            showField = this.selector.options.showField,
            showRightFiled = this.selector.options.showRightFiled,
            showRight = this.selector.options.showRight,
            len = data.length,
            hasOptgroup = false,
            each = function (item, index, subindex) {
                var clsName = className.optionClassName,
                    index = item.index || index,
                    subindex = item.subindex || subindex,
                    html
                if (item.disabled || item.Disabled) {
                    clsName += ' ' + className.disabledClassName
                }
                html = '<li class="' + clsName + '" data-index="' + index + '"' + (typeof subindex === 'number' ? ' data-subindex="' + subindex + '"' : '') + '>'
                if (this.selector.data.length) {
                    if (typeof item === 'object') {
                        if (!showRight) {
                            html += item[showField]
                        } else {
                            html += '<span class="' + leftClsName + '">' + item[showField] + '</span>'
                            html += '<span class="' + rightClsName + '">' + item[showRightFiled] + '</span>'
                        }
                    } else {
                        html += item
                    }
                } else if (this.selector.optionsData.length) {
                    if (item.rightText) {
                        html += '<span class="' + leftClsName + '">' + item.text + '</span>'
                        html += '<span class="' + rightClsName + '">' + item.rightText + '</span>'
                    } else {
                        html += item.text
                    }
                }
                html += '</li>'
                return html
            }

        if (!len) {
            html += '<li class="' + className.disabledClassName + '">抱歉，没有找到结果！</li>'
        } else {
            for (var i = 0; i < len; i++) {
                var leftClsName = prefix + '-selector-option-left',
                    rightClsName = prefix + '-selector-option-right',
                    groupClsName = className.optgroupClassName,
                    item = data[i]

                if (item.optgroup && $.isArray(item.options)) {
                    html += '<li class="' + groupClsName + '">'
                    html += item.label
                    html += '</li>'
                    for (var m = 0; m < item.options.length; m++) {
                        html += each.call(this, item.options[m], i, m)
                    }
                } else {
                    html += each.call(this, item, i)
                }
            }
        }
        hasOptgroup = /optgroup/.test(html)
        if (hasOptgroup) this.$optionsList.addClass(className.hasOptgroupClassName)
        this.$optionsList.html(html).appendTo(this.$dropdown)
    }

    Dropdown.prototype.setListHeigth = function () {
        var liHeight = this.$optionsList.find('li').outerHeight(),
            height = this.$optionsList.height() > liHeight * this.selector.options.viewCount ? liHeight * this.selector.options.viewCount : this.$optionsList.height()
        this.$optionsList.css({
            maxHeight: height
        })
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
            self.filter($(this).val())
        })
    }

    Search.prototype.filter = function (decorated, keyword) {
        decorated.call(this)
        var field = this.data.length ? this.options.showField : 'text',
            rightField = this.options.showRight ? this.data.length ? this.options.showRightFiled : 'rightText' : null,
            data = this.data.length ? this.data : this.optionsData,
            filterData = [],
            reg = new RegExp('^' + keyword.toUpperCase() + '.*'),
            each = function (data, item, index, subindex) {
                item.index = index
                if (typeof subindex === 'number') item.subindex = subindex
                if (reg.test(item[field].toUpperCase())) {
                    data.push(item)
                }
                if (rightField && item[rightField] && reg.test(item[rightField].toUpperCase())) {
                    data.push(item)
                }
            }
        if (keyword) {
            for (var i = 0; i < data.length; i++) {
                var item = data[i]
                if (item.optgroup && $.isArray(item.options)) {
                    var obj = {
                        label: item.label,
                        optgroup: true,
                        options: []
                    }
                    if (reg.test(item.label.toUpperCase())) {
                        obj.options = item.options
                    } else {
                        for (var m = 0; m < item.options.length; m++) {
                            each.call(this, obj.options, item.options[m], i, m)
                        }
                    }
                    !!obj.options.length && filterData.push(obj)
                } else {
                    each.call(this, filterData, item, i)
                }
            }
        } else {
            filterData = data
        }
        this.dropdown.render(filterData)
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
        }).on(events.keyupEvent, function (e) {
            var keyCode = e.keyCode || e.which
            if (keyCode === 13) {
                self.show()
            }
        })
    }

    Opener.prototype.render = function (decorated) {
        decorated.call(this)
        var $selected = this.$srcElement.find('option:selected'),
            showField = this.options.showField,
            selectedText = !!this.data.length && (this.data[0].optgroup ? this.data[0].options[0][showField] : this.data[0][showField]) || $selected.text(),
            selectedValue = this.$srcElement.val()
        this.$srcElement.after(this.$opener.text(selectedText).data('value', selectedValue).show()).hide()
    }

    Opener.prototype.getSelectOptionData = function () {
        var $options = this.$srcElement.find('option'),
            $optgroup = !!this.$srcElement.find('optgroup').length ? this.$srcElement.find('optgroup') : null,
            data = [],
            eachOptions = function (data, item, index) {
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
            }

        if ($optgroup) {
            $optgroup.each(function (index, item) {
                var $options = $(item).find('option'),
                    label = $(item).attr('label'),
                    obj = {
                        label: label,
                        optgroup: true,
                        options: []
                    }
                $options.each(function (i, opt) {
                    eachOptions(obj.options, opt, i)
                })
                data.push(obj)
            })
        } else {
            $options.each(function (index, item) {
                eachOptions(data, item, index)
            })
        }
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