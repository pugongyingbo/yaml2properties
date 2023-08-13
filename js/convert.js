function convertToProperties() {
    var yamlInput = yamlEdit.getValue();
    console.log( yamlInput );
    // 将YAML转换为JSON对象
    var jsonObj = jsyaml.load(yamlInput);
    //const data = yaml.safeLoad(yamlInput);
    //var propertiesStr = properties.stringify(jsonObj, { unicode: true });
    // 转换JSON对象为Properties字符串
    var propertiesStr = convertJsonToProperties(jsonObj);
    console.log( propertiesStr );
    propertiesEdit.setValue(propertiesStr);
}

function convertToYAML() {

    var propertiesInput = propertiesEdit.getValue();
    // 解析Properties字符串为JSON对象
    var jsonObj = parsePropertiesToJson(propertiesInput); 
    // 将JSON对象转换为YAML字符串
    var yamlStr = jsyaml.dump(jsonObj);
    console.log( yamlStr );
    yamlEdit.setValue(yamlStr);
}

function convertJsonToProperties(jsonObj) {
    var properties = "";
    var prefix = "";
    // 递归处理JSON对象
    function traverse(obj, currentKey) {
        for (var key in obj) {
            var value = obj[key];
            
            if (Array.isArray(value)) {
                value.forEach(function (item, index) {
                  traverse(item, currentKey ? currentKey + "." + key + "[" + index + "]" : key + "[" + index + "]");
                });
            // 处理嵌套对象的情况
            } else if(typeof value === "object") {
                traverse(value, currentKey ? currentKey + "." + key : key);
            } else {
                // 拼接Properties字符串
                //properties += (currentKey ? currentKey + "." + key : key) + "=" + value + "\n";
                properties += (prefix ? prefix + "." : "") + (currentKey ? currentKey + "." + key : key) + "=" + value + "\n";

            }
        }
    }
    
    traverse(jsonObj, "");

    return properties;
}

function parsePropertiesToJson(propertiesStr) {
    var jsonObj = {};
    var lines = propertiesStr.split("\n");
    
    lines.forEach(function(line) {
        line = line.trim();
        
        // 忽略空行和注释行
        if (line === "" || line.startsWith("#")) {
            return;
        }
        
        var equalsIndex = line.indexOf("=");
        
        if (equalsIndex !== -1) {
            var key = line.substring(0, equalsIndex).trim();
            var value = line.substring(equalsIndex + 1).trim();
            
            // 处理嵌套属性的情况
            var nestedKeys = key.split(".");
            var currentObj = jsonObj;
            
            nestedKeys.forEach(function(nestedKey, index) {
                // 处理数组的情况
              if (/\[\d+\]$/.test(nestedKey)) {
                var arrKey = nestedKey.substring(0, nestedKey.indexOf("["));
                var arrIndex = nestedKey.substring(nestedKey.indexOf("[") + 1, nestedKey.indexOf("]"));
                
                if (!currentObj[arrKey]) {
                  currentObj[arrKey] = [];
                }
                
                if (index === nestedKeys.length - 1) {
                  currentObj[arrKey][arrIndex] = formatValue(value);
                } else {
                  currentObj[arrKey][arrIndex] = currentObj[arrKey][arrIndex] || {};
                  currentObj = currentObj[arrKey][arrIndex];
                }
              }else{
                if (!currentObj[nestedKey]) {
                    currentObj[nestedKey] = {};
                }
                
                if (index === nestedKeys.length - 1) {
                    currentObj[nestedKey] = formatValue(value);
                } else {
                    currentObj = currentObj[nestedKey];
                }
              }
               
            });
        }
    });
    return jsonObj;
}

function formatValue(value) {
    // 判断是否为数字类型，并不添加单引号
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    // 其他情况保持原样
    return value;
  }
