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
    //courses based on semester will be stored here
    gg.semesters = {};
    //find all the tags that have been given a semester attribute
    var semesters = document.querySelectorAll("tr[gg-semester]");
    for(var index = 0; index < semesters.length; index++){
        //get the courses and fill the respective semester hash
        var currentSem = semesters[index];
        var sem = gg.semesters[currentSem.getAttribute("gg-semester")] = [];
        var courses = [];
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
                    course.semester = original.getAttribute("gg-semester");
                    sem.push(course);
                }
                curr = curr.nextElementSibling;
            }
        })(currentSem,sem)
        
    }
    console.log(gg.semesters);
});