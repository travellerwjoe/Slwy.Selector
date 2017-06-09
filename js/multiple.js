import VARS from './vars'
import Search from './search'
export default function Multiple(decorated, ...args) {
    decorated.apply(this, args)
    this.$multiple = $('.multiple')
    this.$multipleList = $(VARS.tpl.multipleList)
    this.$multipleInput = $(VARS.tpl.multipleInput)
    this.selected = []
}

Multiple.prototype.init = function (decorated) {
    decorated.call(this)
}

Multiple.prototype.bind = function (decorated) {
    decorated.call(this)
    var self = this,
        events = VARS.events,
        className = VARS.className,
        specialKeyCode = VARS.specialKeyCode
    this.$opener.off(events.clickEvent).on(events.clickEvent, function (e) {
        self.$multipleInput.focus()
    })
    this.$multipleList.on(events.clickEvent, 'li', function () {
        var id = $(this).data('id')
        self.dropdown.$dropdown.find(`#${id}`).click()
    })
    this.$multipleInput.on(events.focusEvent, function (e) {
        self.show()
    }).on(events.keyupEvent, function (e) {
        var keyCode = e.keyCode || e.which
        //回车键并且有元素被选择
        if (keyCode === 13 && self.dropdown.$dropdown.find('.' + className.hoverClassName).length) {
            $(this).val('')
            self.filter($(this).val())
            return
        }

        self.inputCustom($(this))

        self.inputBackspace($(this), keyCode)

        self.renderMultipleList()

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
        showField = !this.hasOptionsData ? this.options.showField : 'text'
    for (var i = 0; i < this.selected.length; i++) {
        var item = this.selected[i]
        html += `<li data-id="${item._id}" data-index="${i}">${item[showField]}</li>`
    }
    this.$multipleList.html(html)
}

Multiple.prototype.renderMultipleInput = function () {
    this.$multipleList.after(this.$multipleInput)
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
    if (this.options.multipleInputCustom && this.options.multipleInputSeparator) {
        var separator = this.options.multipleInputSeparator,
            val = $el.val(),
            str = val.substr(0, val.length - 1),
            lastStr = val.substr(-1),
            item
        if (lastStr === separator) {
            item = {
                disabled: false,
                text: str,
                value: str
            }
            this.dropdown.setItemID(item)
            this.selected.push(item)
            this.data.push(item)
            $el.val('')
            this.$srcElement.trigger({
                type: 'selected',
                value: item,
                text: item.text
            })
        }
    }
}

//multiple模式下自定义输入 - 后退
Multiple.prototype.inputBackspace = function (decorated, $el, keyCode) {
    if (keyCode === 8 && !$el.val()) {
        var pos = this.selected.length - 1,
            lastSelected = this.selected[pos]
        if (!lastSelected) return
        this.selected.splice(pos, 1)
        $el.val(lastSelected.text)
    }
}