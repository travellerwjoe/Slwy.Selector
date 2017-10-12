// import VARS from './vars'
var VARS = require('./vars')
// export default function Multiple(decorated, ...args) {
function Multiple(decorated, ...args) {
    decorated.apply(this, args)
    this.$multiple = $('.multiple')
    this.$multipleList = $(VARS.tpl.multipleList)
    this.$multipleInput = $(VARS.tpl.multipleInput)
    this.multipleHeight = this.$opener.outerHeight()
    this.multipleMaxCountTips = this.options.multipleMaxCountTips.replace(/\{[nN]\}/, this.options.multipleMaxCount)
    this.multipleInputMaxLength = this.options.multipleInputMaxLength
    this.multipleInputSeparator = this.options.multipleInputSeparator
    this.multipleInputCustom = this.options.multipleInputCustom
    // this.selected = []
}

Multiple.prototype.init = function (decorated) {
    decorated.call(this)
}

Multiple.prototype.bind = function (decorated) {
    decorated.call(this)
    var self = this,
        events = VARS.events,
        className = VARS.className
        // specialKeyCode = VARS.specialKeyCode
    this.$opener.off(events.clickEvent).on(events.clickEvent, function (e) {
        self.$multipleInput.focus()
    })
    this.$multipleList.on(events.clickEvent, 'li', function () {
        var id = $(this).data('id')
        self.dropdown.$dropdown.find(`#${id}`).click()
    })
    this.$multipleInput.on(events.focusEvent, function (e) {
        self.show()
    }).on(events.keydownEvent, function (e) {
        var keyCode = e.keyCode || e.which,
            len = $(this).val().length,
            maxlength = parseInt(self.multipleInputMaxLength)

        if (maxlength && len >= maxlength && keyCode !== 8 && e.key !== self.multipleInputSeparator) {
            $(this).val($(this).val().substr(0, 30))
            e.preventDefault()
            return
        }

        //后退删除选择
        if (keyCode === 8 && !$(this).val()) {
            e.preventDefault()
            self.inputBackspace($(this))
        }
    }).on(events.keyupEvent, function (e) {
        var keyCode = e.keyCode || e.which

        //回车键并且有元素被选择
        if (keyCode === 13 && self.dropdown.$dropdown.find('.' + className.hoverClassName).length) {
            $(this).val('')
            self.filter($(this).val())
            return
        }

        //检查最大选择数量
        if (self.checkMultipleMaxCount()) {
            return
        }

        self.inputCustom($(this))

        self.$searchInput.trigger({
            type: events.keyupEvent,
            keyword: $(this).val(),
            keyCode: keyCode
        })
    })
}

Multiple.prototype.render = function (decorated) {
    decorated.call(this)
    this.renderMultipleList()
    this.$opener.addClass(VARS.className.multipleClassName).append(this.$multipleList)
    this.renderMultipleInput()
}

Multiple.prototype.renderMultipleList = function () {
    var html = '',
        showField = !this.hasOptionsData ? this.options.showField : '_text',
        className = VARS.className
    for (var i = 0; i < this.selected.length; i++) {
        var item = this.selected[i],
            showStr = item[showField]

        if (this.multipleInputCustom) {
            showStr = showStr || item._text
        }

        html += `<li class="${className.multipleSelected}" data-id="${item._id}" data-index="${i}">${showStr}</li>`
    }
    this.$multipleList.html(html)
    this.checkMultipleHeight()
    this.dropdown.resetHover()
}

Multiple.prototype.renderMultipleInput = function () {
    // var maxlength = parseInt(this.multipleInputMaxLength)
    this.$multipleList.after(this.$multipleInput)
    // maxlength && this.$multipleInput.attr('maxlength', maxlength + 1)
}

//this.selected是否包含item,返回索引
Multiple.prototype.inSelected = function (decorated, item) {
    for (var i = 0; i < this.selected.length; i++) {
        if (this.selected[i]._id === item._id) {
            return i
        }
    }
    return -1
}

//multiple模式下自定义输入
Multiple.prototype.inputCustom = function (decorated, $el) {
    if (this.multipleInputCustom && this.multipleInputSeparator) {
        var separator = this.multipleInputSeparator,
            val = $el.val(),
            str = val.substr(0, val.length - 1),
            lastStr = val.substr(-1),
            $option,
            item,
            newItem

        function match(separator) {
            if (lastStr === separator) {
                item = {
                    disabled: false,
                    _text: str,
                    _value: str
                }
                this.dropdown.setItemID(item)

                newItem = $.extend(true, {}, item)
                //_text_bak,_text原始数据的备份
                newItem._text_bak = newItem._text
                if (typeof this.options.select === 'function') {
                    var newStr = this.options.select(newItem)
                    newItem._text = newStr
                }

                this.selected.push(newItem)
                this.data.push(item)
                $el.val('')
                $option = $(`<option value="${item._value}">${item._text}</option>`)
                this.$srcElement.trigger({
                    type: 'selected',
                    value: item,
                    text: item._text,
                    status: true,
                    selectedData: this.selected
                })
                this.renderMultipleList()
            }
        }
        if (!str) return
        if (typeof separator === 'string') {
            match.call(this, separator)
        } else if ($.isArray(separator)) {
            for (var i = 0; i < separator.length; i++) {
                match.call(this, separator[i])
            }
        }


    }
}

//multiple模式下自定义输入 - 后退
Multiple.prototype.inputBackspace = function (decorated, $el) {
    var pos = this.selected.length - 1,
        lastSelected = this.selected[pos],
        showField = this.options.showField
    if (!lastSelected) return
    this.selected.splice(pos, 1)
    $el.val(lastSelected[showField + '_bak'] || lastSelected._text_bak)
    this.$srcElement.trigger({
        type: 'selected',
        value: lastSelected,
        text: lastSelected[showField] || lastSelected._text,
        status: false,
        selectedData: this.selected
    })
    this.hideError()
    this.renderMultipleList()
}

Multiple.prototype.checkMultipleHeight = function (decorated) {
    if (this.$opener.outerHeight() != this.multipleHeight) {
        this.setPosition()
        this.multipleHeight = this.$opener.outerHeight()
    }
}

Multiple.prototype.checkMultipleMaxCount = function (decorated) {
    if ($.isArray(this.selected) && this.options.multipleMaxCount && this.selected.length >= this.options.multipleMaxCount) {
        if (!this.error) {
            this.showError(this.multipleMaxCountTips)
        }
        return true
    }
    return false
}

module.exports = Multiple