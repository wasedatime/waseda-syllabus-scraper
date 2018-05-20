hostName= db.hostInfo().system.hostname;

if (hostName.toString() === 'waseda-syllabus-scraper') {
    load('/home/deploy/waseda-syllabus-scraper/js/variables.js');
} else {
    load('/Users/oscar/PythonProjects/waseda-syllabus-scraper/js/variables.js');
}

// drop all aggregated collections
db[entireYearCoursesSciEng].drop();
db[entireYearCoursesPse].drop();
db[entireYearCoursesSils].drop();

db[entireYearCoursesSciEngSearch].drop();
db[entireYearCoursesPseSearch].drop();
db[entireYearCoursesSilsSearch].drop();

db[termYearCoursesSciEng].drop();
db[termYearCoursesPse].drop();
db[termYearCoursesSils].drop();

db[termYearCoursesSciEngTimetable].drop();
db[termYearCoursesPseTimetable].drop();
db[termYearCoursesSilsTimetable].drop();

// db[classroomsSciEng].drop();
// classroomsSciEngWeekdays.forEach(function(object) {
//   collectionName = object.collection;
//   db.getCollection(collectionName).drop()
// });
// db[buildingsSciEngUnsorted].drop();
// db[buildingsSciEng].drop();
