import { Component, VERSION } from "@angular/core";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  name = "Har Parser " + '0.01';

  fileToUpload: File = null;
  handleFileInput(event) {
    let fileList: FileList = event.target.files;
    let apiList: String[] = ["updatePrice", "updateCartLineItems"];
    if (fileList.length > 0) {
      let file: File = fileList[0];

      let reader = new FileReader();

      reader.onload = function(e) {
        let csvToUse;
        let parsedApis = new Map();
        let nonParsedApis = new Map();

        var jsonDt = JSON.parse(e.target.result.toString());
        // console.log(jsonDt) ;
        var jsonObj = jsonDt.log.entries;
        //console.log(jsonObj) ;

        let flatten = function(data) {
          var result = {};
          function search(payLoad) {
            for (let entry of payLoad) {
              if (
                entry.request.method != "GET" &&
                entry.request.postData !== null
              ) {
                let apiInLoad = entry.request.postData.text;

                //convert this json string to json
                let postJData = JSON.parse(apiInLoad);
                //  debugger ;
                console.log("Method :" + postJData.method);
                switch (postJData.method) {
                  case "updatePrice":
                  case "updateCartLineItems": {
                    if (parsedApis.get("pricing") == null) {
                      if (entry.time != null)
                        parsedApis.set("pricing", entry.time);
                    } else {
                      //get the value to add

                      if (entry.time != null) {
                        let recTime = parsedApis.get("pricing");
                        recTime += parsedApis.set("pricing", entry.time);
                      }
                    }
                    break;
                  }
                  case "addToCart": {
                    let varx: number = 0;
                    break;
                  }

                  default: {
                    if (nonParsedApis.get(postJData.method) == null)
                      nonParsedApis.set(postJData.method, entry.time);
                    else {
                      if (entry.time != null) {
                        let recTime = nonParsedApis.get(postJData.method);
                        recTime += entry.time;
                        nonParsedApis.set(postJData.method, recTime);
                      }
                    }
                    break;
                  }
                }
              }
            }
          }
          search(data);
          return parsedApis;
        };

        let apiData = flatten(jsonObj);
        console.log("Tracked apiData" + JSON.stringify(apiData));
        console.log("Non tracked apiData" + JSON.stringify(nonParsedApis));


   let downloader = function downloadAsCSV() {
    

/*
   function ConvertToCSV(objArray: any): string 
    {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    var row = "";

    for (var index in objArray[0]) {
        //Now convert each value to string and comma-separated
        row += index + ',';
    }
    row = row.slice(0, -1);
    //append Label row with line break
    str += row + '\r\n';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
}*///Iterate over map values
let csvData : string = '' ;


     csvData += 'API Name' + ',' + 'Total time (ms)' + "\r\n";


parsedApis.forEach((value: number, key: string) => {
       csvData += key + ',' + value + "\r\n";
});



     csvData += '--------Non Tracked API------'  + "\r\n";



nonParsedApis.forEach((value: number, key: string) => {
       csvData += key + ',' + value + "\r\n";
});

  var blob = new Blob([csvData], { type: 'text/csv' });
  var url = window.URL.createObjectURL(blob);

  if(navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, 'download_report.csv');
  } else {
    var a = document.createElement("a");
    a.href = url;
    a.download = 'download_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  window.URL.revokeObjectURL(url);
} 
downloader() ;
      };

      reader.readAsText(file);
    }
  }
}

/*   var recMap = function(obj) {
  return obj.map(obj, function(val) { 
    return typeof val !== 'object' ? val : recMap(val); 
  });
}*/

// var fields = Object.keys(jsonObj[0]) ;

/* let flatten = (obj, path = []) => {
               console.log(Object.keys(obj))
               if(Object !== null && Object.keys !==null)
               
  return Object.keys(obj).reduce((result, prop) => {
    if (typeof obj[prop] !== "object") {
      result[path.concat(prop).join(".")] = obj[prop];
      return result;
    
    }
    return Object.assign(result, flatten(obj[prop], path.concat(prop)),result);
  }, {});
}*/
/*
            var replacer = function(key, value) { return value === null ? '' : value } 
            var csv = jsonObj.map(function(row){
            return fields.map(function(fieldName){
              return JSON.stringify(row[fieldName], replacer)
            }).join(',')
})
csv.unshift(fields.join(',')) // add header column
 csv = csv.join('\r\n');
console.log(csv)
*/
