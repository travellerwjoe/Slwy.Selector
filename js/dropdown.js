import VARS from './vars'
export default function Dropdown(selector) {
    this.selector = selector
    this.$dropdown = $(VARS.tpl.dropdown)
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
        self.selector.isSelect && self.selector.$srcElement.trigger('change')
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
        className = VARS.className,
        each = function (item, index, subindex) {
            var clsName = className.optionClassName,
                index = item.index || index,
                subindex = item.subindex || subindex,
                html

            setID(item)

            if (item.disabled || item.Disabled) {
                clsName += ' ' + className.disabledClassName
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
        },
        setID = function (item) {
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
    this.$optionsList.html(html).appendTo(this.$dropdown)
}

Dropdown.prototype.setListHeigth = function () {
    var liHeight = this.$optionsList.find('li').outerHeight(),
        height = this.$optionsList.height() > liHeight * this.selector.options.viewCount ? liHeight * this.selector.options.viewCount : this.$optionsList.height()
    this.$optionsList.css({
        maxHeight: height
    })
}