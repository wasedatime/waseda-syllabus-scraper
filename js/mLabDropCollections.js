//TODO Try importing variables.js in here. load('/path/to/js') doesn't work.

var year = '2018';
var entireYear = 'entire_' + year;
var term = 'spr_first_half_';
var termYear = term + year;

var entireYearCoursesSciEng =  entireYear + '_courses_sci_eng';
var entireYearCoursesSciEngSearch = entireYearCoursesSciEng + '_search';

var coursesSciEng = termYear + '_courses_sci_eng';
var coursesSciEngTimetable = coursesSciEng + '_timetable';

var classroomsSciEng = termYear + '_classrooms_sci_eng_all';

var buildingsSciEng = termYear + '_buildings_sci_eng';

var classroomsSciEngMon = termYear + '_classrooms_sci_eng_mon';
var classroomsSciEngTue = termYear + '_classrooms_sci_eng_tue';
var classroomsSciEngWed = termYear + '_classrooms_sci_eng_wed';
var classroomsSciEngThur = termYear + '_classrooms_sci_eng_thur';
var classroomsSciEngFri = termYear + '_classrooms_sci_eng_fri';

var classroomsSciEngWeekdays = [
  { collection: classroomsSciEngMon, day: 1 },
  { collection: classroomsSciEngTue, day: 2 },
  { collection: classroomsSciEngWed, day: 3 },
  { collection: classroomsSciEngThur, day: 4 },
  { collection: classroomsSciEngFri, day: 5 }
];

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
db[buildingsSciEng].drop();
db['stats'].drop();