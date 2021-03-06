// import VARS from './vars'
var VARS = require('./vars')
// export default function Search(decorated) {
function Search(decorated) {
    this.$search = $(VARS.tpl.search)
    this.$searchInput = this.$search.find('input')
    decorated.apply(this, Array.prototype.slice.call(arguments, 1))
}

Search.prototype.init = function (decorated) {
    decorated.call(this)
}

Search.prototype.render = function (decorated) {
    decorated.call(this)
    //multiple下不添加搜索框
    !this.isMultiple && this.dropdown.$dropdown.prepend(this.$search)
    this.$searchInput.attr('placeholder', this.options.searchPlaceholder)
}

Search.prototype.bind = function (decorated) {
    decorated.call(this)
    var self = this,
        events = VARS.events,
        specialKeyCode = VARS.specialKeyCode
    // input 事件在IE中可能存在问题，加载页面后就会执行回调
    // this.$searchInput.on(events.keyupEvent + ' ' + events.inputEvent, function (e) {
    this.$searchInput.on(events.keyupEvent + ' ' + events.changeEvent + ' search', function (e) {
        var keyCode = e.keyCode || e.which,
            keyword = typeof e.keyword !== 'undefined' ? e.keyword : $(this).val()
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
        self.filter(keyword)
    })
}

Search.prototype.filter = function (decorated, keyword) {
    decorated.call(this)
    var field = !this.hasOptionsData ? this.options.showField : '_text',
        rightField = this.options.showRight ? !this.hasOptionsData ? this.options.showRightField : '_rightText' : null,
        data = this.data,
        searchField = this.options.searchField,
        filterData = [],
        // reg = new RegExp('^' + keyword.toString() + '.*'),//半模糊左匹配
        reg = new RegExp('(' + keyword.toString() + ')', 'i'),//全模糊
        each = function (data, item, index, subindex) {
            item.index = index
            if (typeof subindex === 'number') item.subindex = subindex
            var newItem = $.extend(true, {}, item),
                showStr = item[field] && item[field].toString()

            if (this.options.multipleInputCustom) {
                showStr = showStr || item._text
            }

            if (reg.test(showStr.toString())) {
                if (this.options.multipleInputCustom) {
                    newItem._text = replaceKeyword(showStr)
                }
                newItem[field] = replaceKeyword(showStr)

                data.push(newItem)
                return
            }
            if (rightField && newItem[rightField] && reg.test(newItem[rightField].toString())) {
                newItem[rightField] = replaceKeyword(newItem[rightField])
                data.push(newItem)
                return
            }
            if (!!searchField.length) {
                for (var i = 0; i < searchField.length; i++) {
                    if (newItem[searchField[i]] && reg.test(newItem[searchField[i]].toString())) {
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
                if (reg.test(item.label.toString())) {
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
    this.dropdown.renderList(filterData)
}

module.exports = Search