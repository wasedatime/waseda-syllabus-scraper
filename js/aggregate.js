// TODO Filter courses => IPSE, PSE, SILS check box? select one at a time.

/*
Important: _id of a course is determined by its pKey in the syllabus database.
When grouping courses, e.g., combining fund, adv, cre schools together for a single course,
we select the first pKey (here the fund pKey) as the _id for the new grouped course.
*/

hostName= db.hostInfo().system.hostname;

if (hostName.toString() === 'WaseTime') {
    load('/home/deploy/waseda-syllabus-scraper/js/variables.js');
} else {
    load('/Users/oscar/PythonProjects/waseda-syllabus-scraper/js/variables.js');
}

function copyTo(origin, destination) {
  db[origin].find().forEach(function(doc){
    db[destination].insert(doc);
  });
}

function correctInvalidClassrooms(object, rawEntireYearCourses) {
  return db.getCollection(rawEntireYearCourses).findAndModify({
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
// belonging to science engineering campus.
// useful regex for finding: [^a-zA-Z0-9\s\{\}\[\]\:\,\.\-';"\_\(\)\/\\]
var sciEngInvalidClassroomsAndCorrections = [
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
  },
  {
    invalidClassroom: '255B教室',
    newLocation: '61-255B',
    newBuilding: '61',
    newClassroom: '255B'
  },
  {
    invalidClassroom: '711教室',
    newLocation: '51-711',
    newBuilding: '51',
    newClassroom: '711'
  },
  {
    invalidClassroom: '3F 社工演習室',
    newLocation: '58-3F',
    newBuilding: '58',
    newClassroom: '3F'
  },
  {
    invalidClassroom: '801教室',
    newLocation: '51-801',
    newBuilding: '51',
    newClassroom: '801'
  }
];

var silsPseCjlInvalidClassroomsAndCorrections = [
  {
    invalidClassroom: '201(Center for Teaching,Learning, and Technology Active Learning)',
    newLocation: '3-201',
    newBuilding: '3',
    newClassroom: '201'
  },
  {
    invalidClassroom: '202(Center for Teaching,Learning, and Technology Active Learning)',
    newLocation: '3-202',
    newBuilding: '3',
    newClassroom: '202'
  },
  {
    invalidClassroom: '203(Center for Teaching,Learning, and Technology Active Learning)',
    newLocation: '3-203',
    newBuilding: '3',
    newClassroom: '203'
  }
];

var silsInvalidClassroomsAndCorrections = [
  {
    invalidClassroom: '806共同利用研究室7',
    newLocation: '14-806',
    newBuilding: '14',
    newClassroom: '806'
  }
];

silsInvalidClassroomsAndCorrections = silsInvalidClassroomsAndCorrections.concat(silsPseCjlInvalidClassroomsAndCorrections);

//実習室
var pseTrainingRooms = ['909', '910', '912', '913', '914', '915', '916', '917', '918', '1103', '1104', '1115', '1116'];

var pseInvalidClassroomsAndCorrections = pseTrainingRooms.map(function(room) {
  return {
    invalidClassroom: room.concat('実習室'),
    newLocation: '3-'.concat(room),
    newBuilding: '3',
    newClassroom: room
  };
});

pseInvalidClassroomsAndCorrections = pseInvalidClassroomsAndCorrections.concat(silsPseCjlInvalidClassroomsAndCorrections);

var cjlInvalidClassroomsAndCorrections = [
  {
    invalidClassroom: '504(コンピュータ教室)科学技術計算',
    newLocation: '14-504',
    newBuilding: '14',
    newClassroom: '504'
  },
  {
    invalidClassroom: '408(コンピュータ教室)',
    newLocation: '16-408',
    newBuilding: '16',
    newClassroom: '408'
  }
];

cjlInvalidClassroomsAndCorrections = cjlInvalidClassroomsAndCorrections.concat(silsPseCjlInvalidClassroomsAndCorrections);

// Find and correct invalid classroom field embedded in
// an array of course documents.
// No need to use this function if your data contains
// no invalid classroom names.
sciEngInvalidClassroomsAndCorrections.forEach(function(object) {
  var returnData = 1;
  while (returnData !== null) {
    returnData = correctInvalidClassrooms(object, rawEntireYearCoursesSciEng);
  }
});

silsInvalidClassroomsAndCorrections.forEach(function(object) {
  var returnData = 1;
  while (returnData !== null) {
    returnData = correctInvalidClassrooms(object, rawEntireYearCoursesSils);
  }
});

pseInvalidClassroomsAndCorrections.forEach(function(object) {
  var returnData = 1;
  while (returnData !== null) {
    returnData = correctInvalidClassrooms(object, rawEntireYearCoursesPse);
  }
});

cjlInvalidClassroomsAndCorrections.forEach(function(object) {
  var returnData = 1;
  while (returnData !== null) {
    returnData = correctInvalidClassrooms(object, rawEntireYearCoursesCjl);
  }
});

function groupMultipleSchools(rawEntireYearCourses, entireYearCourses) {
  var tempCollection = 'temp';
  // Export distinct courses by grouping multiple schools in one array
  db[rawEntireYearCourses].aggregate([
    {
      $group: {
        _id: { year: '$year', term: '$term', title: '$title', instructor: '$instructor', occurrences: '$occurrences',
            keywords: '$keywords', lang: '$lang', code: '$code'
        },
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
        keywords: '$_id.keywords', lang: '$_id.lang', links: '$links'
      }
    },
    { $out: tempCollection }
  ]);

  // Reassign _id value of every docs to first link(pKey) and insert to a new collection
  db[tempCollection].find().forEach(function(course){
    // Taking the first link as _id
    course._id = course.links[0].link.toString();
    db[entireYearCourses].insert(course)
  });

  // Drop temporary collection
  db[tempCollection].drop();
}

groupMultipleSchools(rawEntireYearCoursesSciEng, entireYearCoursesSciEng);

// Need to transform school:String field to schools:Array
groupMultipleSchools(rawEntireYearCoursesPse, entireYearCoursesPse);
groupMultipleSchools(rawEntireYearCoursesSils, entireYearCoursesSils);
groupMultipleSchools(rawEntireYearCoursesSss, entireYearCoursesSss);
groupMultipleSchools(rawEntireYearCoursesCjl, entireYearCoursesCjl);

copyTo(entireYearCoursesSciEng, entireYearCoursesAll);
copyTo(entireYearCoursesPse, entireYearCoursesAll);
copyTo(entireYearCoursesSils, entireYearCoursesAll);
copyTo(entireYearCoursesSss, entireYearCoursesAll);
copyTo(entireYearCoursesCjl, entireYearCoursesAll);

function sortEntireYearCourses(entireYearCourses) {
  // Sort entireYearCourses collection by title then instructor
  db[entireYearCourses].aggregate([
      {$sort: {title: 1, instructor: 1}},
      {$out: entireYearCourses}
  ]);
}

sortEntireYearCourses(entireYearCoursesAll);
sortEntireYearCourses(entireYearCoursesSciEng);
sortEntireYearCourses(entireYearCoursesPse);
sortEntireYearCourses(entireYearCoursesSils);
sortEntireYearCourses(entireYearCoursesSss);
sortEntireYearCourses(entireYearCoursesCjl);

function aggregateEntireYearCoursesSearch(entireYearCourses) {
  // a simplified version used for syllabus searching
  var entireYearCoursesSearch = entireYearCourses + suffixSyllabus;
  // Export simplified courses for syllabus searching, keeping the original _id
  db[entireYearCourses].aggregate([
    { $project: {
        title: '$title', year: '$year', term: '$term', instructor: '$instructor', schools: '$schools'
      }
    },
    { $sort: { title: 1, instructor: 1 } },
    { $out: entireYearCoursesSearch}
  ]);
}

aggregateEntireYearCoursesSearch(entireYearCoursesAll);
aggregateEntireYearCoursesSearch(entireYearCoursesSciEng);
aggregateEntireYearCoursesSearch(entireYearCoursesPse);
aggregateEntireYearCoursesSearch(entireYearCoursesSils);
aggregateEntireYearCoursesSearch(entireYearCoursesSss);
aggregateEntireYearCoursesSearch(entireYearCoursesCjl);

function aggregateTermYearCourses(entireYearCourses, termYearCourses) {
  // Export courses belonging to the current term/semester
  db[entireYearCourses].aggregate([
    {
      $match: {
        term: {
          $in: current_terms
        }
      }
    },
    { $out: termYearCourses}
  ]);
}

aggregateTermYearCourses(entireYearCoursesAll, termYearCoursesAll);
aggregateTermYearCourses(entireYearCoursesSciEng, termYearCoursesSciEng);
aggregateTermYearCourses(entireYearCoursesPse, termYearCoursesPse);
aggregateTermYearCourses(entireYearCoursesSils, termYearCoursesSils);
aggregateTermYearCourses(entireYearCoursesSss, termYearCoursesSss);
aggregateTermYearCourses(entireYearCoursesCjl, termYearCoursesCjl);

function aggregateTermYearCoursesTimetable(termYearCourses) {
  // a simplified version used for searching courses in the timetable section
  var termYearCoursesTimetable = termYearCourses + suffixTimetable;
  // Export simplified courses for searching in timetable section, keeping the original _id
  db[termYearCourses].aggregate([
    { $project: {
        title: '$title', instructor: '$instructor'
      }
    },
    { $sort: { title: 1, instructor: 1 } },
    { $out: termYearCoursesTimetable}
  ]);
}

aggregateTermYearCoursesTimetable(termYearCoursesAll);
aggregateTermYearCoursesTimetable(termYearCoursesSciEng);
aggregateTermYearCoursesTimetable(termYearCoursesPse);
aggregateTermYearCoursesTimetable(termYearCoursesSils);
aggregateTermYearCoursesTimetable(termYearCoursesSss);
aggregateTermYearCoursesTimetable(termYearCoursesCjl);

// // Export classrooms from courses and sort by building number and name
// db[coursesSciEng].aggregate([
//   { $unwind: '$occurrences' },
//   {
//     $group: {
//       _id: '$occurrences.location',
//       name: { $first: '$occurrences.classroom' },
//       building: { $first: '$occurrences.building' },
//       courses: {
//         $push: {
//           id: '$_id',
//           title: '$title',
//           occurrences: '$occurrences'
//         }
//       }
//     }
//   },
//   {
//     $project: {
//       _id: 0,
//       'courses.occurrences.location': 0,
//       'courses.occurrences.classroom': 0,
//       'courses.occurrences.building': 0
//     }
//   },
//   { $sort: { building: 1, name: 1 } },
//   { $out: classroomsSciEngTemp }
// ]);
//
// db[classroomsSciEngTemp].find().forEach(function(classroom) {
//   // Taking 'building-classroom_name' as _id
//   classroom._id = classroom.building.toString() + '-' + classroom.name.toString();
//   db[classroomsSciEng].insert(classroom);
// });
//
// db[classroomsSciEngTemp].drop();
//
// // Export buildings from classrooms
// db[classroomsSciEng].aggregate([
//   {
//     $group: {
//       _id: '$building',
//       classrooms: { $push: { id: '$_id', name: '$name' } }
//     }
//   },
//   { $project: { _id: 0, name: '$_id', classrooms: 1 } },
//   { $out: buildingsSciEngUnsorted }
// ]);
//
//
// // Sort buildings by name and sort all classrooms inside by name
// db[buildingsSciEngUnsorted].aggregate([
//   { $unwind: '$classrooms' },
//   { $sort: { name: 1, 'classrooms.name': 1 } },
//   {
//     $group: {
//       _id: '$name',
//       classrooms: { $push: { id: '$classrooms.id', name: '$classrooms.name' } }
//     }
//   },
//   { $sort: { _id: 1 } },
//   { $project: { _id: 0, name: '$_id', classrooms: 1 } },
//   { $out: buildingsSciEngTemp }
// ]);
//
// // Drop unsorted buildings collection
// db[buildingsSciEngUnsorted].drop();
//
// db[buildingsSciEngTemp].find().forEach(function(building) {
//   // Taking name as _id
//   building._id = building.name.toString();
//   db[buildingsSciEng].insert(building);
// });
//
// db[buildingsSciEngTemp].drop();
//
// // Create index 'name' for buildings collection
// db[buildingsSciEng].createIndex({ name: 1 });
//
// // Group and export classroom schedules by weekdays
// // and sort by building number and name
// classroomsSciEngWeekdays.forEach(function(object) {
//   db.getCollection(classroomsSciEng).aggregate([
//     { $unwind: '$courses' },
//     { $match: { 'courses.occurrences.day': object.day } },
//     {
//       $group: {
//         _id: '$_id',
//         name: { $first: '$name' },
//         building: { $first: '$building' },
//         courses: { $push: '$courses' }
//       }
//     },
//     { $sort: { building: 1, name: 1 } },
//     { $out: object.collection }
//   ]);
// });
//
// // Create index 'building' for classrooms collection
// db[classroomsSciEng].createIndex({ building: 1 });
//
// // Create index 'building' for weekday classrooms collection
// classroomsSciEngWeekdays.forEach(function(object) {
//   db[object.collection].createIndex({ building: 1 });
// });
