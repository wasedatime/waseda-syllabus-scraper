// Currently MongoDB doesn't support executionStats for aggregation.
// Therefore, I relied on JavaScripts new Date() to help me
// calculate the execution time of each aggregation.

var conn = new Mongo('localhost:27017');
var db = conn.getDB('syllabus');

var year = '2017';
var term = 'F';
var yearTerm = year + term;
var raw = 'raw_';

var rawCoursesSciEng = raw + yearTerm + '_courses_sci_eng';

var coursesSciEng = yearTerm + '_courses_sci_eng';
var classroomsSciEng = yearTerm + '_classrooms_sci_eng_all';

var classroomsSciEngMon = yearTerm + '_classrooms_sci_eng_mon';
var classroomsSciEngTue = yearTerm + '_classrooms_sci_eng_tue';
var classroomsSciEngWed = yearTerm + '_classrooms_sci_eng_wed';
var classroomsSciEngThur = yearTerm + '_classrooms_sci_eng_thur';
var classroomsSciEngFri = yearTerm + '_classrooms_sci_eng_fri';

var weekdays = [1,2,3,4,5];

var periods = [1,2,3,4,5,6,7];

var nishiBuildings = [
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '60',
  '61',
  '62',
  '63'
];

var classroomsSciEngWeekdays = [
  classroomsSciEngMon,
  classroomsSciEngTue,
  classroomsSciEngWed,
  classroomsSciEngThur,
  classroomsSciEngFri,
];

// The getOccupiedClassrooms... function is an operation in WaseTime that
// takes in day, period, building as parameters and
// retrieves a list of classrooms that are occupied according to the course schedule.
// It also returns the course information of the occupied classrooms.

function getOccupiedClassroomsViaCoursesCollection(collection, day, period, building){
  db[collection].aggregate([
    { $unwind: '$occurrences' },
    { $match:
        {
        'occurrences.day': day,
        'occurrences.start_period': { $lte: period },
        'occurrences.end_period': { $gte: period },
        'occurrences.building': building,
        }
    },
    { $project: {_id: 1, name: 1,  title: 1 } }
  ]);
};

function getOccupiedClassroomsViaClassroomsCollection(collection, day, period, building){
  db[collection].aggregate([
    { $match: { building: building } },
    { $unwind: '$courses' },
    {
      $match: {
        'courses.occurrences.start_period': day,
        'courses.occurrences.start_period': { $lte: period },
        'courses.occurrences.end_period': { $gte: period }
      }
    },
    { $project: { name: 1, 'courses.id': 1, 'courses.title': 1 } }
  ]);
};

function getOccupiedClassroomsViaClassroomsWeekdaysCollection (collection, period, building) {
  db[collection].aggregate([
    { $match: { building: building } },
    { $unwind: '$courses' },
    {
      $match: {
        'courses.occurrences.start_period': { $lte: period },
        'courses.occurrences.end_period': { $gte: period }
      }
    },
    { $project: { name: 1, 'courses.id': 1, 'courses.title': 1 } }
  ]);
};

// The benchmark functions currently contain high amount of duplicated code, but
// that should not lead to biased results.

function getOccupiedClassroomsRawTotalBenchmark() {
  var before = new Date();
  for (var i = 0; i < weekdays.length ; i++) {
    for( var j =0; j < periods.length; j++ ) {
      for( var k = 0; k < nishiBuildings.length; k++ ) {
        getOccupiedClassroomsViaCoursesCollection(rawCoursesSciEng, weekdays[i], periods[j], nishiBuildings[k]);
      }
    }
  };
  var after = new Date();
  print(after - before);
};

function getOccupiedClassroomsAfterGroupingTotalBenchmark() {
  var before = new Date();
  for (var i = 0; i < weekdays.length ; i++) {
    for( var j =0; j < periods.length; j++ ) {
      for( var k = 0; k < nishiBuildings.length; k++ ) {
        getOccupiedClassroomsViaCoursesCollection(coursesSciEng, weekdays[i], periods[j], nishiBuildings[k]);
      }
    }
  };
  var after = new Date();
  print(after - before);
};

function getOccupiedClassroomsAfterClassroomExtractionTotalBenchmark() {
  var before = new Date();
  for (var i = 0; i < weekdays.length ; i++) {
    for( var j =0; j < periods.length; j++ ) {
      for( var k = 0; k < nishiBuildings.length; k++ ) {
        getOccupiedClassroomsViaClassroomsCollection(classroomsSciEng, weekdays[i], periods[j], nishiBuildings[k]);
      }
    }
  };
  var after = new Date();
  print(after - before);
};

function getOccupiedClassroomsAfterClassroomAndWeekdayExtractionTotalBenchmark() {
  var before = new Date();
  for (var i = 0; i < classroomsSciEngWeekdays.length ; i++) {
    for( var j =0; j < periods.length; j++ ) {
      for( var k = 0; k < nishiBuildings.length; k++ ) {
        getOccupiedClassroomsViaClassroomsWeekdaysCollection(classroomsSciEngWeekdays[i], periods[j], nishiBuildings[k]);
      }
    }
  };
  var after = new Date();
  print(after - before);
};

getOccupiedClassroomsRawTotalBenchmark();
// Takes around 5000 miliseconds
getOccupiedClassroomsAfterGroupingTotalBenchmark();
// Takes around 2800 miliseconds
getOccupiedClassroomsAfterClassroomExtractionTotalBenchmark();
// Takds around 350 miliseconds
getOccupiedClassroomsAfterClassroomAndWeekdayExtractionTotalBenchmark();
// Takes around 250 miliseconds
