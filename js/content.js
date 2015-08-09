var gg = gg||{};
gg.parseTranscript()
.then(gg.setSemesters)
.then(gg.parseCourses)
.then(gg.loadPartial)
.then(gg.populateWithCourses)
.catch(function(err){
  console.log(err);
});
gg.minimized = true;