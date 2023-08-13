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
                value.forEach(function (item, index) {
                  traverse(item, currentKey ? currentKey + "." + key + "[" + index + "]" : key + "[" + index + "]");
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
 
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    return value;
  }
