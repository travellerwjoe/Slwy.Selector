/*import VARS from './vars'
import Dropdown from './dropdown'*/
var VARS = require('./vars'),
    Dropdown = require('./dropdown')
// export default function Selector(options, $srcElement) {
function Selector(options, $srcElement) {
    var defaults = {
        title: '支持中文搜索',
        titleBar: false,
        data: [],
        showField: '',//需要展示的自定义数据字段名
        showRight: false,//是否显示右侧字段
        showRightField: '',//需要展示的右侧自定义数据字段名
        search: false,//是否显示搜索
        searchPlaceholder: '搜索',
        searchField: [],//可被用于搜索的字段
        searchShowEmpty: true,//搜索时显示无结果提示
        searchAutoFocus: true,//打开自动聚焦搜索框
        viewCount: 10,
        width: null,
        multipleInputSeparator: [';', '；'], //multiple下输入时分隔符
        multipleInputCustom: false,//multiple下允许自定义输入
        multipleInputMaxLength: 30,//multiple下自定义输入时最大输入长度
        multipleMaxCount: null, // multiple下最大选择数量
        multipleMaxCountTips: '只能选择{n}个!',
        select: null,//回调函数，刚选择还未渲染已选择内容时触发，可返回一个字符串自定义已选择的option的显示内容
        skin: '',//自定义皮肤，传入class
    }
    this.options = $.extend(true, defaults, options)
    this.$selector = $(VARS.tpl.selector)
    this.$srcElement = $srcElement
    this.$errorBox = $(VARS.tpl.errorBox)
    this.isInput = this.$srcElement.is(':text')
    this.isSelect = this.$srcElement.is('select')
    this.isMultiple = this.isSelect && !!this.$srcElement.attr('multiple')
    this.selected = null
    this.data = this.options.data
    this.first = true
    this.isShow = false
    this.error = false
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
        viewIndex = this.options.viewCount - 1,
        events = VARS.events
    $(document).on(events.keydownEvent, function (e) {
        if (self.$selector.is(':hidden')) {
            return
        }

        var keyCode = e.keyCode || e.which,
            className = VARS.className,
            hoverClassName = className.hoverClassName,
            hoverIndex = self.dropdown.hoverIndex,
            $hoverItem = hoverIndex >= 0 ? self.dropdown.$optionsList.find('li').eq(hoverIndex) : self.dropdown.$optionsList.find('.' + hoverClassName),
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
            $hoverItem.length && self.triggerSelected($hoverItem)
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
        var $el = $(this)
        if (self.isInput) {
            $el.val(e.text)
        } else if (self.isSelect) {
            if (!self.isMultiple) {
                $el.val(e.value._value)
                self.$opener.html(e.text)
            } else {
                var values = []
                for (let i = 0; i < self.selected.length; i++) {
                    values.push(self.selected[i]._value)
                }
                $el.val(values)
            }
        }
    })
    $(document).on(events.clickEvent, function (e) {
        var $opener = $(e.target).parents().filter(self.$opener),
            $selector = $(e.target).parents().filter(self.$selector)
        if ($(e.target).is(self.$opener || self.$srcElement) || $opener.is(self.$opener) || $selector.is(self.$selector)) {
            return
        }

        self.hide()
    })
}

Selector.prototype.render = function () {
    if (this.options.titleBar) {
        var $title = $(VARS.tpl.title).text(this.options.title)
        this.$selector.prepend($title)
    }
    this.$selector.append(this.dropdown.$dropdown)
    this.dropdown.$dropdown.append(this.$errorBox.hide())
    this.options.skin && this.$selector.addClass(this.options.skin)
}

Selector.prototype.show = function () {
    if (this.isShow) return
    this.$selector.show()
    if (this.first) {
        this.setPosition()
        // if (parseInt(this.options.viewCount)) {
        this.dropdown.setListHeigth()
        // }
        this.first = false
    }
    this.$opener && this.$opener.addClass(VARS.className.expandClassName).blur()
    this.$search && this.options.searchAutoFocus && this.$searchInput.focus()
    this.isShow = true
}

Selector.prototype.hide = function () {
    if (!this.isShow) return
    this.$selector.hide()
    this.$opener && this.$opener.removeClass(VARS.className.expandClassName)
    this.isShow = false
}

Selector.prototype.setPosition = function () {
    // debugger
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
}

Selector.prototype.triggerSelected = function ($targetEl) {
    var index = $targetEl.data('index'),
        subindex = $targetEl.data('subindex'),
        data = $.extend(true, {}, this.data[index]),
        field = !this.hasOptionsData ? this.options.showField : '_text',
        className = VARS.className,
        text,
        selectStatus = true

    if ($targetEl.hasClass(className.disabledClassName)) return

    if (!data) return

    data[field + '_bak'] = data[field]
    if (typeof this.options.select === 'function') {
        var str = this.options.select(data)

        data[field] = str
    }

    if (typeof data === 'object') {
        if (data.optgroup && data.options && typeof subindex === 'number') {
            data = data.options[subindex]
        }
        text = data[field]
    } else {
        text = data
    }

    $targetEl.addClass(className.activeClassName)

    //是多选时的操作
    if (this.isMultiple) {
        var index = this.inSelected(data)
        if (index >= 0) {
            this.selected.splice(index, 1)
            selectStatus = false
            $targetEl.removeClass(className.activeClassName)
            this.hideError()
        } else {
            if (this.checkMultipleMaxCount()) {
                return
            }
            this.selected.push(data)
        }
        this.$multipleInput.val('').keyup()
        this.renderMultipleList()
    } else {
        this.selected = data
        $targetEl.siblings().removeClass(className.activeClassName)
    }

    this.$srcElement.trigger({
        type: 'selected',
        value: data,
        text: text,
        status: selectStatus,
        selectedData: this.selected
    })

    this.isSelect && this.$srcElement.trigger('change')

    this.hide()
}


Selector.prototype.showError = function (errorTips) {
    var html = '',
        className = VARS.className

    this.dropdown.$options.hide()
    this.dropdown.$dropdown.has(className.noborder) && this.dropdown.$dropdown.removeClass(className.noborder)
    this.$errorBox.text(errorTips).show()
    this.error = true
}

Selector.prototype.hideError = function () {
    this.$errorBox.hide()
    this.dropdown && this.dropdown.$options.show()
    this.error = false
}

module.exports = Selector