var gg = gg||{};

gg.parseTranscript()
.then(gg.setSemesters)
.then(gg.parseCourses)
.then(gg.loadPartial)
.then(gg.populateWithCourses)

gg.minimized = true;