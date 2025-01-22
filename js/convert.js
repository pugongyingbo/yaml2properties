function convertToProperties() {
    var yamlInput = yamlEdit.getValue();
    console.log( yamlInput );
    
    var jsonObj = jsyaml.load(yamlInput);
   
    var propertiesStr = convertJsonToProperties(jsonObj);
    console.log( propertiesStr );
    propertiesEdit.setValue(propertiesStr);
}

function convertToYAML() {

    var propertiesInput = propertiesEdit.getValue();
    
    var jsonObj = parsePropertiesToJson(propertiesInput); 
    
    var yamlStr = jsyaml.dump(jsonObj);
    console.log( yamlStr );
    yamlEdit.setValue(yamlStr);
}

function convertJsonToProperties(jsonObj) {
    var properties = "";
    var prefix = "";
    
    function traverse(obj, currentKey) {
        for (var key in obj) {
            var value = obj[key];
            
            if (Array.isArray(value)) {
                // 修改数组处理逻辑
                value.forEach(function (item, index) {
                    if (typeof item === "object" && !Array.isArray(item)) {
                        traverse(item, currentKey ? currentKey + "." + key + "[" + (index + 1) + "]" : key + "[" + (index + 1) + "]");
                    } else {
                        properties += (currentKey ? currentKey + "." : "") + key + "[" + (index + 1) + "]=" + item + "\n";
                    }
                });
            } else if(typeof value === "object") {
                traverse(value, currentKey ? currentKey + "." + key : key);
            } else {
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
        
        if (line === "" || line.startsWith("#")) {
            return;
        }
        
        var equalsIndex = line.indexOf("=");
        
        if (equalsIndex !== -1) {
            var key = line.substring(0, equalsIndex).trim();
            var value = line.substring(equalsIndex + 1).trim();
            
            var nestedKeys = key.split(".");
            var currentObj = jsonObj;
            
            nestedKeys.forEach(function(nestedKey, index) {
                
              if (/\[\d+\]$/.test(nestedKey)) {
                var arrKey = nestedKey.substring(0, nestedKey.indexOf("["));
                var arrIndex = parseInt(nestedKey.substring(nestedKey.indexOf("[") + 1, nestedKey.indexOf("]"))) - 1; // 将索引减1
                
                if (!currentObj[arrKey]) {
                  currentObj[arrKey] = [];
                }
                
                if (index === nestedKeys.length - 1) {
                  currentObj[arrKey][arrIndex] = formatValue(value);
                } else {
                  if (!currentObj[arrKey][arrIndex]) {
                    currentObj[arrKey][arrIndex] = {};
                  }
                  currentObj = currentObj[arrKey][arrIndex];
                }
              } else {
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
 
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    return value;
  }
// 添加新的功能函数
function formatProperties() {
  const value = propertiesEdit.getValue();
  const lines = value.split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .sort();
  propertiesEdit.setValue(lines.join('\n'));
}

function clearProperties() {
  if (confirm('确定要清空内容吗？')) {
    propertiesEdit.setValue('');
  }
}

function loadPropertiesExample() {
  propertiesEdit.setValue(`# 基础配置
server.port=8080
spring.application.name=demo

# 嵌套属性
spring.datasource.url=jdbc:mysql://localhost:3306/db
spring.datasource.username=root

# 数组示例
list[1]=item1
list[2]=item2`);
}

function formatYaml() {
  try {
    const value = yamlEdit.getValue();
    const obj = jsyaml.load(value);
    const formatted = jsyaml.dump(obj);
    yamlEdit.setValue(formatted);
  } catch (e) {
    alert('YAML 格式错误，无法格式化');
  }
}

function clearYaml() {
  if (confirm('确定要清空内容吗？')) {
    yamlEdit.setValue('');
  }
}

function loadYamlExample() {
  yamlEdit.setValue(`# 基础配置
server:
  port: 8080
spring:
  application:
    name: demo
  datasource:
    url: jdbc:mysql://localhost:3306/db
    username: root

# 数组示例
list:
  - item1
  - item2`);
}
