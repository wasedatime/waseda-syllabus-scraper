hostName= db.hostInfo().system.hostname;

if (hostName.toString() === 'waseda-syllabus-scraper') {
    load('/home/deploy/waseda-syllabus-scraper/js/variables.js');
} else {
    load('/Users/oscar/PythonProjects/waseda-syllabus-scraper/js/variables.js');
}

// drop all aggregated collections
db[entireYearCoursesSciEng].drop();
db[entireYearCoursesSciEngSearch].drop();
db[coursesSciEng].drop();
db[coursesSciEngTimetable].drop();
db[classroomsSciEng].drop();
classroomsSciEngWeekdays.forEach(function(object) {
  collectionName = object.collection;
  db.getCollection(collectionName).drop()
});
db[buildingsSciEngUnsorted].drop();
db[buildingsSciEng].drop();