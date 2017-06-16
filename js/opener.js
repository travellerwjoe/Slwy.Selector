// import VARS from './vars'
var VARS = require('./vars')
// export default function Opener(decorated) {
function Opener(decorated) {
    decorated.apply(this, Array.prototype.slice.call(arguments, 1))
    this.$opener = $(VARS.tpl.opener)
    this.hasOptionsData = false
    this.selected = this.isMultiple ? [] : this.getSelectedFormData()
    if (!this.data.length) {
        var optionsData = this.getSelectOptionData()
        this.data = optionsData
        this.hasOptionsData = true
    }
}

Opener.prototype.init = function (decorated) {
    decorated.call(this)
}

Opener.prototype.bind = function (decorated) {
    decorated.call(this)
    var self = this,
        events = VARS.events
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
    var showField = !this.hasOptionsData ? this.options.showField : '_text',
        selectedText = this.selected[showField],
        selectedValue = this.selected
    // debugger
    this.options.width && this.$opener.width(this.options.width)
    this.options.skin && this.$opener.addClass(this.options.skin)
    this.$srcElement.after(this.$opener.text(selectedText).data('value', selectedValue).show()).hide()
}

//从自定义数据中获取第一个非disabled作为selected数据
Opener.prototype.getSelectedFormData = function () {
    var selected = {},
        i = 0;
    if (!!this.data.length) {
        (function each(data, index) {
            do {
                if (data[index].optgroup) {
                    var m = 0
                    // arguments.callee.call(this, data[index].options, m)
                    each.call(this, data[index].options, m)
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
                    _text: text,
                    _rightText: rightText,
                    _value: value,
                    disabled: disabled
                }
            if ($(item).is(':selected')) {
                if (self.isMultiple) {
                    obj._text_bak = obj._text
                    if (typeof this.options.select === 'function') {
                        var str = this.options.select(obj)
                        obj._text = str
                    }
                    self.selected.push(obj)
                } else {
                    self.selected = obj
                }
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

module.exports = Opener