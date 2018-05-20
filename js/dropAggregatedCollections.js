hostName= db.hostInfo().system.hostname;

if (hostName.toString() === 'waseda-syllabus-scraper') {
    load('/home/deploy/waseda-syllabus-scraper/js/variables.js');
} else {
    load('/Users/oscar/PythonProjects/waseda-syllabus-scraper/js/variables.js');
}

// drop all aggregated collections
function dropAggregatedCollections(entireYearCourses, termYearCourses) {
    db[entireYearCourses].drop();
    db[entireYearCourses + suffixSyllabus].drop();
    db[termYearCourses].drop();
    db[termYearCourses + suffixTimetable].drop();
}

dropAggregatedCollections(entireYearCoursesAll, termYearCoursesAll);
dropAggregatedCollections(entireYearCoursesSciEng, termYearCoursesSciEng);
dropAggregatedCollections(entireYearCoursesPse, termYearCoursesPse);
dropAggregatedCollections(entireYearCoursesSils, termYearCoursesSils);
dropAggregatedCollections(entireYearCoursesCjl, termYearCoursesCjl);

// db[classroomsSciEng].drop();
// classroomsSciEngWeekdays.forEach(function(object) {
//   collectionName = object.collection;
//   db.getCollection(collectionName).drop()
// });
// db[buildingsSciEngUnsorted].drop();
// db[buildingsSciEng].drop();
