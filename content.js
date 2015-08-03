var gg = gg||{};
gg.parseTranscript = (function(){
    var promise = new Promise(function(resolve,reject){
        //set ending marker
        var eoTrans = document.querySelectorAll("table.dataentrytable")[1];
        var lastTR = eoTrans.firstElementChild.lastElementChild;
        lastTR.setAttribute("gg-marker","eoTrans");
        gg.endMarker = lastTR;
        //we need some transcript info:
        //Current cGPA
        //Points
        //GPA Cr
        //This information is always in the last tr with a table child
        var details = {};
        var _infoContainer = document.querySelectorAll("tr table tbody");
        var infoContainer = Array.prototype.slice.call(_infoContainer,-1)[0].lastElementChild;
        var trParent = infoContainer.parentElement;
        //set marker on parent tr
        while(trParent.tagName !== "TR")
        {
            trParent = trParent.parentElement;
        }

        trParent.setAttribute("gg-marker","");
        gg.startMarker = trParent;
        console.log(trParent);
        var jumbledInfo = infoContainer.innerText;
        var splitInfo = jumbledInfo.match(/[a-z A-Z:0-9\.]+/g);
        //some hardcoding 
        //from the back of the array since those values are not labelled
        details.points = splitInfo.pop();
        details.gpaCreds = splitInfo.pop();
        details.earnedCreds = splitInfo.pop();
        details.attCreds = splitInfo.pop();
        details.cumGPA = splitInfo[1];
        details.totalCreds = splitInfo[3];
        gg.transcript = details;
        resolve();
    });
    return promise;
})().then(function(){
    var promise = new Promise(function(resolve,reject){
        var currRow = gg.startMarker;
        while(currRow.nextElementSibling !== gg.endMarker)
        {
            if(currRow.innerText.match(/winter/i) 
               || currRow.innerText.match(/fall/i)
               ||currRow.innerText.match(/summer/i) 
               && currRow !== gg.startMarker)
            {
                 //&nbsp causes problems when selecting using attribute. Removing it using whitespace regex
                var _sem = currRow.innerText.split(/\s/); 
                var sem = _sem.join("_");
                currRow.setAttribute("gg-semester",sem);
            }
            currRow = currRow.nextElementSibling;
        }
        resolve();
    });
    return promise;
}).then(function(){
    var promise = new Promise(function(resolve,reject){
        //find all the tags that have been given a semester attribute
        var semesters = document.querySelectorAll("tr[gg-semester]");
        gg.courses = [];
        for(var index = 0; index < semesters.length; index++){
            //get the courses and fill the respective semester hash
            var currentSem = semesters[index];
            (function(curr,sem){
                var original = curr;
                while(curr.nextElementSibling
                  && !curr.nextElementSibling.hasAttribute("gg-semester"))
                {
                    var row = curr;
                    var course = {};
                    if(row.innerText.startsWith("RW"))
                    {
                        row = row.innerText.replace(/ /g,"_").trim(); //replace spaces in names with underscore
                        row = row.split(/\s/); //split by spaces and remove RW
                        course.credits = row.pop();
                        course.name = row.pop().replace(/[_]/g," ");
                        course.section = row.pop();
                        course.courseCode = row.pop().replace("_"," ");
                        course.semester = original.getAttribute("gg-semester").replace("_"," ");
                        sem.push(course);
                    }
                    curr = curr.nextElementSibling;
                }
            })(currentSem,gg.courses)

        }
        resolve();
    })
    return promise;
}).then(function(){
    //I think this is pretty bad but couldn't figure out templating because I suck
    chrome.runtime.sendMessage({message:"LOAD"});
});
//should add types to messages incase I need to store data in localStorage
chrome.runtime.onMessage.addListener(function(msg,sender,sendResp){
  var ggContainer = document.createElement("div");
  var rowTemplate =  
    "<div class=\"gg-divider\"></div>"
    +"<div class=\"gg-grade\">"
      +"<select class=\"gg-select\">"
        +"<option>&#45;&#45;</option>"
        +"<option>A</option>"
        +"<option>A-</option>"
        +"<option>B+</option>"
        +"<option>B</option>"
        +"<option>B-</option>"
        +"<option>C+</option>"
        +"<option>C</option>"
        +"<option>D</option>"
        +"<option>F</option>"
      +"</select>"
    +"</div>"
  ggContainer.setAttribute("id","gg");
  ggContainer.innerHTML = msg.message;
  document.body.appendChild(ggContainer);
  //create row, set class info values, set credits attribute on .gg-class-info
  for(var index = 0; index < gg.courses.length; index++)
  {
    var row = document.createElement("div");
    row.setAttribute("class","gg-row");
    row.innerHTML = rowTemplate;
    ggContainer.firstElementChild.appendChild(row);
    
    var className = document.createElement("div");
    className.setAttribute("class","gg-class-name");
    className.innerHTML = gg.courses[index].name;
    
    var classCode = document.createElement("div");
    classCode.setAttribute("class","gg-class-code");
    classCode.innerHTML = gg.courses[index].courseCode;
    
    var classSem = document.createElement("div");
    classSem.setAttribute("class","gg-class-sem");
    classSem.innerHTML = gg.courses[index].semester;
    
    var classInfo = document.createElement("div");
    classInfo.setAttribute("class","gg-class-info");
    classInfo.appendChild(className);
    classInfo.appendChild(classCode);
    classInfo.appendChild(classSem);
    
    row.setAttribute("credits",gg.courses[index].credits);
    var divider = row.querySelector("div.gg-divider");
    row.insertBefore(classInfo,divider);
  }
});