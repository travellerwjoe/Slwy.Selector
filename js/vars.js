var prefix = 'slwy',
    tpl = {
        selector: '<div class="' + prefix + '-selector"></div>',
        dropdown: '<div class="' + prefix + '-selector-dropdown"></div>',
        title: '<div class="' + prefix + '-selector-title"></div>',
        options: '<div class="' + prefix + '-selector-options"></div>',
        optionsList: '<ul class="' + prefix + '-selector-options-list"></ul>',
        search: '<div class="' + prefix + '-selector-search"><input type="search" class="' + prefix + '-selector-search-input" autocomplete="off"></div>',
        opener: '<div class="' + prefix + '-selector ' + prefix + '-selector-opener" tabindex="0"></div>',
        multiple: `<div class="${prefix}-selector ${prefix}-selector-opener ${prefix}-selector-multiple" tabindex="0"></div>`,
        multipleList: `<ul class="${prefix}-selector-multiple-list"></ul>`,
        multipleInput: `<input class="${prefix}-selector-multiple-input" type="text">`,
        errorBox: `<div class="${prefix}-selector-error-box"></div>`
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
        hasOptgroupClassName: prefix + '-selector-has-optgroup',
        expandClassName: prefix + '-selector-opener-expanded',
        multipleClassName: prefix + '-selector-multiple',
        noborder: prefix + '-selector-noborder',
        multipleSelected: prefix + '-selector-multiple-selected'
    },
    specialKeyCode = ['112-123', 27, 9, 20, '16-19', '91-93', 13, '33-40', 45, 46, 144, 145]//特殊按键的keyCode
// export default {
module.exports = {
    prefix,
    tpl,
    namespace,
    events,
    className,
    specialKeyCode
}