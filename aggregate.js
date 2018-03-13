// TODO Consider using pKeys as id instead of mongo object id?
// TODO Remove start time and end time. Use periods instead?
// TODO title=>t year=>y term=>m instructor=>i school=>s links=>ks occurences=>os
// TODO DELETE MLAB collection before importing!! They don't overwrite but accumulate!
// bc you created a new id every time you aggregate... solve it with the first TODO?
// TODO Filter courses => IPSE, PSE, SILS check box? select one at a time.
// TODO Do you have to store start_time? Maybe use start_period alone would be okay?

/*
Important: _id of a course is determined by its pKey in the syllabus database.
When grouping courses, e.g., combining fund, adv, cre schools together for a single course,
we select the first pKey (here the fund pKey) as the _id for the new grouped course.
*/

var full_year = 'full year';
var spring_fall_intensive =  'an intensive course(spring and fall)';

var spring_semester = 'spring semester';
var spring_quarter = 'spring quarter';
var summer_quarter = 'summer quarter';
var spring_intensive = 'an intensive course(spring)';

var fall_semester = 'fall semester';
var fall_quarter = 'fall quarter';
var winter_quarter = 'winter quarter';
var fall_intensive = 'an intensive course(fall)';

// had to hardcode the data since array.push does not work :'(
var spr_first_half_terms = [full_year, spring_semester, spring_intensive, spring_fall_intensive, spring_quarter];
var spr_second_half_terms = [full_year, spring_semester, spring_intensive, spring_fall_intensive, summer_quarter];
var fall_first_half_terms =  [full_year, fall_semester, fall_intensive, spring_fall_intensive, fall_quarter];
var fall_second_half_terms = [full_year, fall_semester, fall_intensive, spring_fall_intensive, winter_quarter];

// change this variable to filter the relevant courses according to the current semester
var current_terms = spr_first_half_terms;

var sci_eng_schools = ['Schl of Fund Sci/Eng', 'Schl Cre Sci/Eng', 'Schl Adv Sci/Eng'];

var year = '2018';
var entireYear = 'entire_' + year;
var term = 'spr_first_half_';
var termYear = term + year;
var raw = 'raw_';

// rawCoursesALL is the name of the initial collection containing the scraped courses info
// for the entire year
var rawEntireYearCoursesAll = raw + entireYear + '_courses_all';
var rawEntireYearCoursesSciEng = raw + entireYear + '_courses_sci_eng';

// temp collection for grouping courses according to schools.
// the doc _id field in this collection is not pKey.
var entireYearCoursesSciEngTemp =  entireYear + '_courses_sci_eng' + '_temp';
// the doc _id field in this collection is the first pKey if multiple schools exist.
var entireYearCoursesSciEng =  entireYear + '_courses_sci_eng';
// a simplified version used for syllabus searching
var entireYearCoursesSciEngSearch = entireYearCoursesSciEng + '_search';

var coursesSciEng = termYear + '_courses_sci_eng';
// a simplified version used for searching courses in the timetable section
var coursesSciEngTimetable = coursesSciEng + '_timetable';

var classroomsSciEngTemp = termYear + '_classrooms_sci_eng_all' + '_temp';
var classroomsSciEng = termYear + '_classrooms_sci_eng_all';

var buildingsSciEngUnsorted = termYear + '_buildings_sci_eng_unsorted';
var buildingsSciEngTemp = termYear + '_buildings_sci_eng' + '_temp';
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

// drop all collections except raw
db[entireYearCoursesSciEng].drop();
db[entireYearCoursesSciEngSearch].drop();
db[coursesSciEng].drop();
db[coursesSciEngTimetable].drop();
db[classroomsSciEng].drop();
classroomsSciEngWeekdays.forEach(function(object) {
  collectionName = object.collection
  db.getCollection(collectionName).drop()
});
db[buildingsSciEngUnsorted].drop();
db[buildingsSciEng].drop();

// Export courses in Nishiwaseda campus (for entire year)
// (School of Fundamental, Creative, and Advanced Science Engineering)
db[rawEntireYearCoursesAll].aggregate([
  {
    $match: {
      school: {
        // Change the school names here to extract courses that belong to specific schools.
        $in: sci_eng_schools
      }
    }
  },
  { $out: rawEntireYearCoursesSciEng}
]);

function correctInvalidClassrooms(object) {
  return db.getCollection(rawEntireYearCoursesSciEng).findAndModify({
    query: { 'occurrences.classroom': object.invalidClassroom },
    update: {
      $set: {
        'occurrences.$.location': object.newLocation,
        'occurrences.$.building': object.newBuilding,
        'occurrences.$.classroom': object.newClassroom
      }
    }
  });
}

// These are the common invalid classroom names in courses
// belonging to Nishiwaseda campus.
// You can define your own ones if necessary.
var commonInvalidClassroomsAndCorrections = [
  {
    invalidClassroom: '61号館2階',
    newLocation: '61-2F',
    newBuilding: '61',
    newClassroom: '2F'
  },
  {
    invalidClassroom: '61号館BF',
    newLocation: '61-BF',
    newBuilding: '61',
    newClassroom: 'BF'
  },
  {
    invalidClassroom: 'Business Design & Management labo 61-2F',
    newLocation: '61-2F Business Design & Management lab',
    newBuilding: '61',
    newClassroom: '2F Business Design & Management lab'
  },
  {
    invalidClassroom: 'foyer 50-301',
    newLocation: '50-301',
    newBuilding: '50',
    newClassroom: '301'
  },
  {
    invalidClassroom: 'Seminar room 3 50-304',
    newLocation: '50-304',
    newBuilding: '50',
    newClassroom: '304'
  }
];

// Find and correct invalid classroom field embedded in
// an array of course documents.
// Disable this function if your data contains
// no invalid classroom names.
commonInvalidClassroomsAndCorrections.forEach(function(object) {
  var returnData = 1;
  while (returnData !== null) {
    returnData = correctInvalidClassrooms(object);
  }
});

// Export distinct courses by grouping multiple schools in one array
db[rawEntireYearCoursesSciEng].aggregate([
  {
    $group: {
      _id: { year: '$year', term: '$term', title: '$title',
        instructor: '$instructor', occurrences: '$occurrences', code: '$code'
      },
      schools: { $push: '$school' },
      links: {
        $push: {
          school: '$school',
          link: '$_id'
        }
      }
    }
  },
  { $project: { _id: 0, year: '$_id.year', term: '$_id.term', title: '$_id.title',
      instructor: '$_id.instructor', occurrences: '$_id.occurrences',
      code: '$_id.code', schools: '$schools', links: '$links'
    }
  },
  { $out: entireYearCoursesSciEngTemp }
]);

// Reassign _id value of every docs to first link(pKey) and insert to a new collection
db[entireYearCoursesSciEngTemp].find().forEach(function(course){
  // Taking the first link as _id
  course._id = course.links[0].link.toString();
  db[entireYearCoursesSciEng].insert(course)
})

// Drop temporary collection
db[entireYearCoursesSciEngTemp].drop();

// Export simplified courses for syllabus searching, keeping the original _id
db[entireYearCoursesSciEng].aggregate([
  { $project: {
      title: '$title', year: '$year', term: '$term', instructor: '$instructor', schools: '$schools'
    }
  },
  { $out: entireYearCoursesSciEngSearch}
]);

// Export courses belonging to the current term/semester
db[entireYearCoursesSciEng].aggregate([
  {
    $match: {
      term: {
        $in: current_terms
      }
    }
  },
  { $out: coursesSciEng}
]);

// Export simplified courses for searching in timetable section, keeping the original _id
db[coursesSciEng].aggregate([
  { $project: {
      title: '$title', instructor: '$instructor'
    }
  },
  { $out: coursesSciEngTimetable}
]);


// Export classrooms from courses and sort by building number and name
db[coursesSciEng].aggregate([
  { $unwind: '$occurrences' },
  {
    $group: {
      _id: '$occurrences.location',
      name: { $first: '$occurrences.classroom' },
      building: { $first: '$occurrences.building' },
      courses: {
        $push: {
          id: '$_id',
          title: '$title',
          occurrences: '$occurrences'
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      'courses.occurrences.location': 0,
      'courses.occurrences.classroom': 0,
      'courses.occurrences.building': 0
    }
  },
  { $sort: { building: 1, name: 1 } },
  { $out: classroomsSciEngTemp }
]);

db[classroomsSciEngTemp].find().forEach(function(classroom) {
  // Taking 'building-classroom_name' as _id
  classroom._id = classroom.building.toString() + '-' + classroom.name.toString();
  db[classroomsSciEng].insert(classroom);
});

db[classroomsSciEngTemp].drop();

// Export buildings from classrooms
db[classroomsSciEng].aggregate([
  {
    $group: {
      _id: '$building',
      classrooms: { $push: { id: '$_id', name: '$name' } }
    }
  },
  { $project: { _id: 0, name: '$_id', classrooms: 1 } },
  { $out: buildingsSciEngUnsorted }
]);


// Sort buildings by name and sort all classrooms inside by name
db[buildingsSciEngUnsorted].aggregate([
  { $unwind: '$classrooms' },
  { $sort: { name: 1, 'classrooms.name': 1 } },
  {
    $group: {
      _id: '$name',
      classrooms: { $push: { id: '$classrooms.id', name: '$classrooms.name' } }
    }
  },
  { $sort: { _id: 1 } },
  { $project: { _id: 0, name: '$_id', classrooms: 1 } },
  { $out: buildingsSciEngTemp }
]);

// Drop unsorted buildings collection
db[buildingsSciEngUnsorted].drop();

db[buildingsSciEngTemp].find().forEach(function(building) {
  // Taking name as _id
  building._id = building.name.toString();
  db[buildingsSciEng].insert(building);
});

db[buildingsSciEngTemp].drop();

// Create index 'name' for buildings collection
db[buildingsSciEng].createIndex({ name: 1 });

// Group and export classroom schedules by weekdays
// and sort by building number and name
classroomsSciEngWeekdays.forEach(function(object) {
  db.getCollection(classroomsSciEng).aggregate([
    { $unwind: '$courses' },
    { $match: { 'courses.occurrences.day': object.day } },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        building: { $first: '$building' },
        courses: { $push: '$courses' }
      }
    },
    { $sort: { building: 1, name: 1 } },
    { $out: object.collection }
  ]);
});

// Create index 'building' for classrooms collection
db[classroomsSciEng].createIndex({ building: 1 });

// Create index 'building' for weekday classrooms collection
classroomsSciEngWeekdays.forEach(function(object) {
  db[object.collection].createIndex({ building: 1 });
});
