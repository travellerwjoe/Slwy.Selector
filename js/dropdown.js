// import VARS from './vars'
var VARS = require('./vars')
// export default function Dropdown(selector) {
function Dropdown(selector) {
    this.selector = selector
    this.$dropdown = $(VARS.tpl.dropdown)
    this.$options = $(VARS.tpl.options)
    this.$optionsList = $(VARS.tpl.optionsList)
    this.hoverIndex = -1
    this.activeIndex = -1
    this.init()
}

Dropdown.prototype.init = function () {
    var data = this.selector.data.length ? this.selector.data : this.selector.optionsData || []
    this.bind()
    this.render(data)
}

Dropdown.prototype.bind = function () {
    var self = this,
        events = VARS.events,
        className = VARS.className
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
    this.$options.html(this.$optionsList).appendTo(this.$dropdown)
    this.renderList(data)
}

Dropdown.prototype.renderList = function (data) {
    this.selector.hideError()
    this.$optionsList.html('')
    var html = '',
        showField = !this.selector.hasOptionsData ? this.selector.options.showField : '_text',
        showRightField = this.selector.options.showRight ? !this.selector.hasOptionsData ? this.selector.options.showRightField : '_rightText' : null,
        showRight = this.selector.options.showRight,
        len = data.length,
        hasOptgroup = false,
        className = VARS.className,
        each = function (item, index, subindex) {
            var clsName = className.optionClassName,
                index = item.index || index,
                subindex = item.subindex || subindex,
                showStr = item[showField],
                html

            this.setItemID(item)

            if (item.disabled || item.Disabled) {
                clsName += ' ' + className.disabledClassName
            }

            //首次遍历提取自定义数据中的selected
            if (this.selector.first && (item.selected || item.Selected)) {
                var newItem = $.extend(true, {}, item)
                if (this.selector.isMultiple) {
                    newItem[showField + '_bak'] = newItem[showField]
                    if (typeof this.selector.options.select === 'function') {
                        var str = this.selector.options.select(newItem)
                        newItem[showField] = str
                    }
                    this.selector.selected.push(newItem)

                } else {
                    this.selector.selected = newItem
                }
                this.selector.$srcElement.trigger({
                    type: 'selected',
                    value: item,
                    text: item[showField],
                    status: true,
                    selectedData: this.selector.selected
                })
            }

            if (this.selector.selected) {
                //selected为数组，multiple模式下
                if ($.isArray(this.selector.selected)) {
                    for (let i = 0; i < this.selector.selected.length; i++) {
                        const selected = this.selector.selected[i]
                        if (selected._id === item._id) {
                            clsName += ' ' + className.activeClassName
                            break
                        }
                    }
                } else if (typeof this.selector.selected === 'object' && item._id == this.selector.selected._id) {
                    clsName += ' ' + className.activeClassName
                }
            }
            html = '<li class="' + clsName + '" data-index="' + index + '"' + (typeof subindex === 'number' ? ' data-subindex="' + subindex + '"' : '') + ' id="' + item._id + '">'

            if (this.selector.options.multipleInputCustom) {
                showStr = showStr || item._text
            }

            if (this.selector.data.length) {
                if (typeof item === 'object') {
                    if (!showRight) {
                        html += showStr
                    } else {
                        html += '<span class="' + leftClsName + '">' + showStr + '</span>'
                        item[showRightField] ? html += '<span class="' + rightClsName + '">' + item[showRightField] + '</span>' : ''
                    }
                } else {
                    html += item
                }
            } else if (this.selector.optionsData.length) {
                if (item._rightText && showRight) {
                    html += '<span class="' + leftClsName + '">' + item._text + '</span>'
                    html += '<span class="' + rightClsName + '">' + item._rightText + '</span>'
                } else {
                    html += item._text
                }
            }
            html += '</li>'
            return html
        }

    if (!len) {
        if (this.selector.options.searchShowEmpty) {
            html += '<li class="' + className.disabledClassName + '">抱歉，没有找到结果！</li>'
        } else {
            this.$dropdown.addClass(className.noborder)
        }
    } else {
        this.$dropdown.has(className.noborder) && this.$dropdown.removeClass(className.noborder)
        for (var i = 0; i < len; i++) {
            var leftClsName = VARS.prefix + '-selector-option-left',
                rightClsName = VARS.prefix + '-selector-option-right',
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
    this.$optionsList.html(html)
}

Dropdown.prototype.setListHeigth = function () {
    var liHeight = this.$optionsList.find('li').outerHeight(),
        viewCount = parseInt(this.selector.options.viewCount)
    // maxHeight = this.$optionsList.height() > liHeight * viewCount ? liHeight * viewCount : this.$optionsList.height()
    this.$optionsList.css({
        maxHeight: liHeight * viewCount,
    })
}

//为每个item设置一个随机id
Dropdown.prototype.setItemID = function (item) {
    if (item._id) return
    function random(min, max) {
        var range = max - min,
            rand = Math.random(),
            num = min + Math.round(rand * range)
        return num
    }
    var id = String.fromCharCode(random(65, 90)) + String.fromCharCode(random(97, 122)) + random(100000, 999999)
    item._id = `selector_${id}`
}

Dropdown.prototype.resetHover = function () {
    var className = VARS.className
    this.hoverIndex = -1
    this.$optionsList.find('.' + className.hoverClassName).removeClass(className.hoverClassName)
}

module.exports = Dropdown