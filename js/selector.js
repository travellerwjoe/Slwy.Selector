/**
 * @preserve jquery.Slwy.Selector.js
 * @author Joe.Wu
 * @version v0.11.1
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
            mouseenterEvent: 'mouseenter' + namespace,
            selectedEvent: 'selected' + namespace,
            propertyChangeEvent: 'propertychange' + namespace
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
            showField: '',//需要展示的自定义数据字段名
            showRight: false,//是否显示右侧字段
            showRightFiled: '',//需要展示的右侧自定义数据字段名
            search: false,//是否显示搜索
            searchPlaceholder: '搜索',
            searchField: [],//可被用于搜索的字段
            viewCount: 10,
            width: null
        }
        this.options = $.extend(true, defaults, options)
        this.$selector = $(tpl.selector)
        this.$srcElement = $srcElement
        this.data = this.options.data
        this.hasSetPosition = false
        this.isShow = false
        // this.init()
    }

    Selector.prototype.init = function (container) {
        this.dropdown = new Dropdown(this)
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
            hoverIndex >= 0 && self.dropdown.$optionsList.find('li').removeClass(hoverClassName).eq(hoverIndex).addClass(hoverClassName)
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
        if (this.isShow) return
        this.$selector.show()
        if (!this.hasSetPosition) {
            this.setPosition()
            this.dropdown.setListHeigth()
        }
        this.$opener && this.$opener.addClass(prefix + '-selector-opener-expanded').blur()
        this.$search && this.$search.find('input').focus()
        this.isShow = true
    }

    Selector.prototype.hide = function () {
        if (!this.isShow) return
        this.$selector.hide()
        this.$opener && this.$opener.removeClass(prefix + '-selector-opener-expanded')
        this.isShow = false
    }

    Selector.prototype.setPosition = function () {
        var $relativeEl = this.$opener || this.$srcElement,
            offset = $relativeEl.offset(),
            height = $relativeEl.outerHeight(),
            width = typeof this.options.width === 'number' ? this.options.width : $relativeEl.outerWidth(),
            top = this.options.titleBar ? offset.top + height + 2 : offset.top + height - 2
        this.$selector.css({
            top: top,
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
        var data = this.selector.data.length ? this.selector.data : this.selector.optionsData
        this.bind()
        this.render(data)
    }

    Dropdown.prototype.bind = function () {
        var self = this
        this.$optionsList.on(events.mouseenterEvent, 'li.' + className.optionClassName, function (e) {
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
                // if (this.selector.selected && showField && item[showField] == this.selector.selected[showField]) {
                if (item == this.selector.selected) {

                    clsName += ' ' + className.activeClassName
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
                    if (item.rightText && showRight) {
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
            if (keyCode) {
                for (var i = 0; i < specialKeyCode.length; i++) {
                    var item = specialKeyCode[i].toString(),
                        arr
                    if (item.indexOf('-') >= 0) {
                        arr = item.split('-')
                        if (keyCode >= arr[0] && keyCode <= arr[1]) {
                            return
                        }
                    } else {
                        if (keyCode == item) {
                            return
                        }
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
            searchField = this.options.searchField,
            filterData = [],
            // reg = new RegExp('^' + keyword.toString().toUpperCase() + '.*'),//半模糊左匹配
            reg = new RegExp('(' + keyword.toString().toUpperCase() + ')'),//全模糊
            each = function (data, item, index, subindex) {
                item.index = index
                if (typeof subindex === 'number') item.subindex = subindex
                var newItem = $.extend(true, {}, item)
                if (reg.test(newItem[field].toString().toUpperCase())) {
                    newItem[field] = replaceKeyword(newItem[field])
                    data.push(newItem)
                }
                if (rightField && newItem[rightField] && reg.test(newItem[rightField].toString().toUpperCase())) {
                    newItem[rightField] = replaceKeyword(newItem[rightField])
                    data.push(newItem)
                }
                if (!!searchField.length) {
                    for (var i = 0; i < searchField.length; i++) {
                        if (newItem[searchField[i]] && reg.test(newItem[searchField[i]].toString().toUpperCase())) {
                            data.push(newItem)
                        }
                    }
                }
            },
            replaceKeyword = function (keyword) {
                return keyword.replace(reg, '<b class="' + prefix + '-selector-keyword">$&</b>')
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
                    if (reg.test(item.label.toString().toUpperCase())) {
                        obj.label = replaceKeyword(obj.label)
                        obj.options = item.options
                        // obj.options = item.options.concat()
                        /* for (var j = 0; j < item.options.length; j++) {
                             var newItem = $.extend(true, {}, item.options[j])
                             newItem[field] = replaceKeyword(newItem[field])
                             obj.options.push(newItem)
                         }*/
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
        this.selected = this.getSelectedFormData()
        this.optionsData = this.getSelectOptionData()
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
        var showField = this.options.showField,
            selectedText = !!this.data.length ? this.selected[showField] : this.selected.text,
            selectedValue = this.selected

        this.$srcElement.after(this.$opener.text(selectedText).data('value', selectedValue).show()).hide()
    }

    //从自定义数据中获取第一个非disabled作为selected数据
    Opener.prototype.getSelectedFormData = function () {
        var selected = null,
            i = 0;
        if (!!this.data.length) {
            (function (data, index) {
                do {
                    if (data[index].optgroup) {
                        var m = 0
                        arguments.callee.call(this, data[index].options, m)
                    } else {
                        selected = data[index]
                    }
                    index++
                } while (selected.Disabled || selected.disabled)
            })(this.data, i)
        }
        return selected
    }

    Opener.prototype.getSelectOptionData = function () {
        var self = this,
            $options = this.$srcElement.find('option'),
            $optgroup = !!this.$srcElement.find('optgroup').length ? this.$srcElement.find('optgroup') : null,
            data = [],
            eachOptions = function (data, item, index) {
                var text = $(item).text(),
                    rightText = $(item).data('right'),
                    value = $(item).attr('value'),
                    disabled = $(item).is(':disabled'),
                    obj = {
                        text: text,
                        rightText: rightText,
                        value: value,
                        disabled: disabled
                    }
                if ($(item).is(':selected')) {
                    self.selected = obj
                }
                data.push(obj)
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
        new S(options, $(this)).init()

        return $(this);
    }
}))