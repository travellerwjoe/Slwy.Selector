# 自定义数据说明

当列表的数据量过大，或是从接口请求的数据，此时可使用自定义数据。自定义数据传入的实际上就是一个对象数组，除了部分预留的关键字字段名，对对象的其他字段名没有要求，格式如下：

```js 
    [
        {
            "KeyID": 0,
            "CarrierCode": "HU",
            "CarrierShortName": "海南航空",
            "CarrierName": "海南航空",
            "SettleCode": "0",
            "CountryType": 0,
            "CountryTypeName": "国内",
            "IsDelete": 0,
            "AddTime": "0001-01-01T00:00:00",
            "AddUser": "",
            "ModifyUser": "",
            ...
            //预留字段（首字母大小写皆可）
            "Disabled": true, // 禁用，不可选
            "Selected": true // 默认选中

        }
        ...
    ]
```

**当带有`optgroup`时的数据格式**

```js
    [
        {
            //预留字段
            "label": "国内航空公司", //optgroup标签名
            "optgroup": true, //是否是optgroup
            "options": [ //optgroup下的option列表
                {
                    "KeyID": 0,
                    "CarrierCode": "HU",
                    "CarrierShortName": "海南航空",
                    "CarrierName": "海南航空",
                    "SettleCode": "0",
                    "CountryType": 0,
                    "CountryTypeName": "国内",
                    "IsDelete": 0,
                    "AddTime": "0001-01-01T00:00:00",
                    "AddUser": "",
                    "ModifyUser": "",
                    ...
                    //预留字段（首字母大小写皆可）
                    "Disabled": true, // 禁用，不可选
                    "Selected": true // 默认选中
                }
            ]
        }
    ]

```