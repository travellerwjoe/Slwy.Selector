# 事件

## selected事件 {docsify-ignore}

1. 当列表被选择时，将触发`selected`事件

```js
$('#date')
    .SlwyCalendar({
        ...
    })
    .on('selected', function(e){
        //当前被选择的数据对象
        console.log(e.value)
    })
```

> 同样也可以传入[选项select](/options?id=select-回调函数)来触发事件