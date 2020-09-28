import { Component, VERSION } from '@angular/core';



@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  name = 'Angular ' + VERSION.major;

  fileToUpload: File = null;
  handleFileInput(event) {
    
    

    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
     
        let file: File = fileList[0];
      
         var reader = new FileReader();

          reader.onload = function(e) { 
            var csvToUse ;
  
            var jsonDt = JSON.parse(e.target.result.toString());
            console.log(jsonDt) ;
            var jsonObj = jsonDt.log.entries ;
            console.log(jsonObj) ;



 var flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop ? prop+"."+i : ""+i);
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
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
 csvToUse = flatten(jsonObj) ;
 console.log(csvToUse);

  }

  reader.readAsText(file);


    }

}


 
}
