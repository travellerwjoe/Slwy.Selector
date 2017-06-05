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
export default {
    prefix,
    tpl,
    namespace,
    events,
    className,
    specialKeyCode
}