import { Component, Input, VERSION } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  name = "CPQ API Analyzer " + "0.1";
  userSelectionOnlyAPI: boolean = false;
  userSelectionGrouped: boolean = false;
  userSelectionRawAPI: boolean = true;

  fileToUpload: File = null;
  handleOnlyAPIChange = evt => {
    this.userSelectionOnlyAPI = evt.target.checked;
    this.userSelectionGrouped = false;
    this.userSelectionRawAPI = false;
  };
  handleGroupeChange = evt => {
    this.userSelectionGrouped = evt.target.checked;
    this.userSelectionOnlyAPI = false;
    this.userSelectionRawAPI = false;
  };
  handleRawApiChange = evt => {
    this.userSelectionRawAPI = evt.target.checked;
    this.userSelectionOnlyAPI = false;
    this.userSelectionGrouped = false;
  };
  resetFileName = evt => {
    //reset
    evt.target.value = null;
  };

  handleFileInput = event => {
    var self = this;
    let fileList: FileList = event.target.files;
    let apiList: String[] = ["updatePrice", "updateCartLineItems"];
    if (fileList.length > 0) {
      let file: File = fileList[0];

      let reader = new FileReader();

      reader.onload = e => {
        var self = this;
        let csvToUse;
        let parsedApis = new Map();
        let nonParsedApis = new Map();
        let rawApis: [string, string, number][] = [];
        let allData = new Map();
        let superMap: [
          Map<string, [number, number]>,
          Map<string, [number, number]>
        ];

        var jsonDt = JSON.parse(e.target.result.toString());
        // console.log(jsonDt) ;
        var jsonObj = jsonDt.log.entries;
        //console.log(jsonObj) ;

        let flatten = function(data) {
          var result = {};
          function search(payLoad) {
            let addtoList = function(action, category,cpqMethod, req, parseStrategy) {
              var setter;
              switch (parseStrategy) {
                case "Coarse": {
                  setter = parsedApis;
                  break;
                }
                case "Fine": {
                  setter = parsedApis;
                  break;
                }
                case "Raw": {
                  setter = rawApis;
                  break;
                }
                default: {
                  setter = rawApis;
                  break;
                }
              }

              if (parseStrategy !== "Raw") {
                if (setter.get(category) == null) {
                  if (req.time != null) {
                    let recTime: [number, number];
                    recTime = [req.time, 1];
                    setter.set(parseStrategy === "Coarse" ? cpqMethod: category, recTime);
                  }
                } else {
                  //get the value to add
                  if (req.time != null) {
                    let recTime = setter.get(category);
                    let p1 = recTime[0];
                    p1 += req.time;

                    let p2 = recTime[1];
                    p2++;
                    recTime = [p1, p2];
                    setter.set(parseStrategy === "Coarse" ? cpqMethod: category, recTime);
                  }
                }
              } else {
                let data = [action, category, req.time];
                setter.push(data);
              }
            };
            let i = 1;
            function addAction() {
              return "Action" + i++;
            }

            function initializeMaps() {
              parsedApis = new Map();
              nonParsedApis = new Map();
              let superMap: [
                Map<string, [number, number]>,
                Map<string, [number, number]>
              ];
              superMap = [parsedApis, nonParsedApis];
              action = addAction();
              allData.set(action, superMap);
            }
            superMap = [parsedApis, nonParsedApis];
            var action = addAction();
            //for raw APIs
            rawApis.push([action, "", 0]);

            allData.set(action, superMap);

            for (let entry of payLoad) {
              if (
                entry.request.method == "POST" &&
                entry.request.postData !== null &&
                !(
                  (entry.request.postData.text != null &&
                    entry.request.postData.text.includes("long-polling")) ||
                  entry.request.url.includes("cometd/24.0/")
                )
              ) {
                let apiInLoad = entry.request.postData.text;

                let postJData;
                try {
                  postJData = JSON.parse(apiInLoad);
                } catch (e) {
                  continue;
                }

                if (postJData.method == "performAction") {
                  if (
                    postJData.data != null &&
                    postJData.data[0] != null &&
                    ((postJData.data[0].displayAction != null &&
                      postJData.data[0].displayAction.ActionLabelName ==
                        "Add Marker") ||
                      superMap.entries.length == 0)
                  ) {
                    initializeMaps();
                  }
                }
                //  debugger ;
                console.log("Method :" + postJData.method);
                // var downloadAll = document.getElementById('onlyAPI') ;
                var downloadGrouped = document.getElementById("groupedAPI");
                //var grouped = downloadGrouped.getAttribute('checked') ;

                let refineLevel;
                if (self.userSelectionGrouped) refineLevel = "Fine";
                else if (self.userSelectionOnlyAPI) refineLevel = "Coarse";
                else if (self.userSelectionRawAPI === true) refineLevel = "Raw";

                switch (postJData.method) {
                  case "updatePrice":
                  case "updateCartLineItems": {
                    addtoList(action, "Pricing",postJData.method, entry, refineLevel);
                    break;
                  }
                  case "getGuidePageUrl":
                  case "getCategories": {
                    addtoList(action, "LaunchCatalog",postJData.method, entry, refineLevel);
                  }

                  case "addToCart": {
                    addtoList(action, "AddToCart",postJData.method, entry, refineLevel);

                    break;
                  }

                  case "searchProducts":
                  case "getConfigurationData": {
                    addtoList(action, "SearchProducts",postJData.method, entry, refineLevel);

                    break;
                  }

                  case "getDefaultLineItemRollup":
                  case "getCart":
                  case "getCartLineNumbers":
                  case "getLineItemFieldsMetaData":
                  case "getSObjectPermissions":
                  case "getAllCartViews":
                  case "getObjectForSummary":
                  case "getAnalyticsRecommendedProducts":
                  case "getReferenceObjects":
                  case "getCartLineItems":
                  case "getChildCartLineItems":
                  case "getProductDetails": {
                    addtoList(action, "CartLaunch",postJData.method, entry, refineLevel);

                    break;
                  }

                  case "getProductDetails": {
                    addtoList(action, "CartLaunch",postJData.method, entry, refineLevel);

                    break;
                  }
                  default: {
                    if (postJData.method == "performAction")
                      addtoList(action,postJData.method, postJData.method, entry, refineLevel);

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
        console.log("Non grouped apiData" + JSON.stringify(nonParsedApis));
        console.log("Non grouped raw apiData" + JSON.stringify(rawApis));

        let downloader = function downloadAsCSV() {
          let csvData: string = "";

          csvData +=
            "ActionGroup" +
            "," +
            "Action Name" +
            "," +
            "Total Time (ms)" +
            "," +
            "Total Calls" +
            "," +
            "Avg Time Per Call" +
            "\r\n";
          csvData += "" + "," + "," + "," + "," + "\r\n";
          if (self.userSelectionRawAPI === true) {
            rawApis.forEach((value: [string, string, number]) => {
              csvData +=
                value[0] +
                "," +
                value[1] +
                "," +
                (value[1] != "" ? value[2] : "") +
                "," +
                (value[1] != "" ? "1" : "") +
                "," +
                (value[1] != "" ? value[2] : "") +
                "\r\n";
            });
          } else {
            allData.forEach(
              (
                value: [
                  Map<string, [number, number]>,
                  Map<string, [number, number]>
                ],
                key: string
              ) => {
                csvData += key + "," + "," + "," + "," + "\r\n";
                value[0].forEach(
                  (value: [number, number], keyInner: string) => {
                    csvData +=
                      key +
                      "," +
                      keyInner +
                      "," +
                      (keyInner != "" ? value[0] : "") +
                      "," +
                      (keyInner != "" ? value[1] : "") +
                      "," +
                      (keyInner != "" ? value[0] / value[1] : "") +
                      "\r\n";
                  }
                );
                csvData +=
                  "--------Non Grouped API------" +
                  "," +
                  "," +
                  "," +
                  "," +
                  "\r\n";

                value[1].forEach(
                  (value: [number, number], keyInner: string) => {
                    csvData +=
                      key +
                      "," +
                      keyInner +
                      "," +
                      (keyInner != "" ? value[0] : "") +
                      "," +
                      (keyInner != "" ? value[1] : "") +
                      "," +
                      (keyInner != "" ? value[0] / value[1] : "") +
                      "\r\n";
                  }
                );
                csvData += "" + "," + "," + "," + "," + "\r\n";
              }
            );
          }
          /* csvData += "--------Non Tracked API------" + "\r\n";

          nonParsedApis.forEach((value: [number, number], key: string) => {
            csvData += key + "," + value[0] + "," + value[1] + "\r\n";
          });
*/
          var blob = new Blob([csvData], { type: "text/csv" });
          var url = window.URL.createObjectURL(blob);

          if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, "download_report.csv");
          } else {
            var a = document.createElement("a");
            a.href = url;
            a.download = "download_report.csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          window.URL.revokeObjectURL(url);
        };
        downloader();
      };

      reader.readAsText(file);
    }
  };
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
