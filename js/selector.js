import VARS from './vars'
import Dropdown from './dropdown'

export default function Selector(options, $srcElement) {
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
    this.$selector = $(VARS.tpl.selector)
    this.$srcElement = $srcElement
    this.isSelect = this.$srcElement.is('select')
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
        viewIndex = this.options.viewCount - 1,
        events = VARS.events
    $(document).on(events.keydownEvent, function (e) {
        if (self.$selector.is(':hidden')) {
            return
        }

        var keyCode = e.keyCode || e.which,
            className = VARS.className,
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
        var $title = $(VARS.tpl.title).text(this.options.title)
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
    this.$opener && this.$opener.addClass(VARS.prefix + '-selector-opener-expanded').blur()
    this.$search && this.$search.find('input').focus()
    this.isShow = true
}

Selector.prototype.hide = function () {
    if (!this.isShow) return
    this.$selector.hide()
    this.$opener && this.$opener.removeClass(VARS.prefix + '-selector-opener-expanded')
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
    var className = VARS.className
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



