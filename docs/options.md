# 选项

## titleBar 展示标题栏
* 类型： `Boolean`
* 默认： `false`
* 值：`true` || `false`

是否展示下拉列表标题栏


## title 标题内容
* 类型： `String`
* 默认： `支持中文搜索`

展示标题栏时的标题内容


## data 自定义数据
* 类型： `Array`
* 默认： `[]`

使用自定义的数据（接口返回的`json`数据）代替`<option>`，自定义数据格式参考[自定义数据说明](/data)


## showField 自定义数据展示字段名
* 类型： `String`
* 默认： `''`

需要展示的自定义数据字段名，传入自定义数据`data`后有效


## showRightField 自定义数据右侧展示字段名
* 类型： `String`
* 默认： `''`

需要展示的右侧自定义数据字段名，传入自定义数据`data`后有效


## showRight 展示右侧字段
* 类型： `Boolean`
* 默认： `false`
* 值：`true` || `false`

是否展示右侧字段，传入自定义数据时展示`showRightField`对应的字段，若是传统的`<option>`形式则展示属性`data-right`，如`<option value="MU" data-right="MU">东方航空</option>`


## search 展示搜索
* 类型： `Boolean`
* 默认： `false`
* 值：`true` || `false`

是否展示搜索框，默认列表下所有已展示的字段可被搜索


## searchPlaceholder 搜索框placeholder
* 类型： `String`
* 默认： `'搜索'`

搜索框placeholder，前提已开启搜索


## searchField 被搜索字段
* 类型： `Array`
* 默认： `[]`

自定义被搜索的字段，将与列表已展示的字段合并，用于自定义数据下


## searchShowEmpty 搜索无结果提示
* 类型： `Boolean`
* 默认： `true`
* 值：`true` || `false`

搜索时若无结果显示对应提示


## searchAutoFocus 自动聚焦搜索框
* 类型： `Boolean`
* 默认： `true`
* 值：`true` || `false`

启用后展开下拉列表会自动聚焦搜索框


## viewCount 每页展示数量
* 类型： `Number`
* 默认： `10`

自定义下拉列表默认显示数量，类似于设置高度


## width 宽度
* 类型： `Number`
* 默认： `null`

自定义宽度


## multipleInputCustom 多选下自定义输入
* 类型： `Boolean`
* 默认： `false`
* 值：`true` || `false`

多选下是否允许自定义输入，只能在绑定元素为`<select>`且为`multiple`多选的情况下可用


## multipleInputSeparator 多选下分隔完成符
* 类型： `Array`
* 默认： `[';', '；']`

自定义多选下输入后的分隔完成符，默认可使用中英文分号`;`，`；`完成输入并添加到列表。只能在绑定元素为`<select>`且为`multiple`多选的情况下可用


## multipleInputMaxLength 多选下自定义输入长度
* 类型： `Number`
* 默认： `30`

多选下自定义输入时的最大输入长度。只能在绑定元素为`<select>`且为`multiple`多选的情况下可用


## multipleMaxCount 多选下最大选择数量
* 类型： `Number`
* 默认： `null`

自定多选下最大可选择的数量


## multipleMaxCountTips 多选下最大选择数量提示
* 类型： `String`
* 默认： `'只能选择{n}个!'`

超过最大可选数量时的提示内容，其中`{n}`指代`multipleMaxCount`数量


## skin 皮肤
* 类型： `String`
* 默认： `''`

暂为提供自带的更多皮肤选择，目前等同于添加自定义类名，然后自由替换默认样式


## select 回调函数
* 类型： `Function`
* 默认： `callback(data)`

下拉选择后的回调函数

> 也可通过为绑定的input元素使用`.on`监听[selected事件](event.md)
