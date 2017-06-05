import VARS from './vars'
export default function Search(decorated) {
    this.$search = $(VARS.tpl.search)
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
    var self = this,
        events = VARS.events,
        specialKeyCode = VARS.specialKeyCode
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
            return keyword.replace(reg, '<b class="' + VARS.prefix + '-selector-keyword">$&</b>')
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