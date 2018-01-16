var conn = new Mongo('localhost:27017');
var db = conn.getDB('syllabus');

var year = '2017';
var term = 'F';
var yearTerm = year.concat(term);
var raw = 'raw_';

//rawCourseAll is the name of the initial collection containing the scraped courses information.
//Change it to the name of your own collection.
var rawCoursesAll = raw + yearTerm + '_courses';
var rawCoursesSciEng = raw + yearTerm + '_courses_sci_eng';


var coursesSciEng = yearTerm + '_courses_sci_eng';
var classroomsSciEng = yearTerm + '_classrooms_sci_eng_all';
var buildingsSciEngUnsorted = yearTerm + '_buildings_sci_eng_unsorted';
var buildingsSciEng = yearTerm + '_buildings_sci_eng';

var classroomsSciEngMon = yearTerm + '_classrooms_sci_eng_mon';
var classroomsSciEngTue = yearTerm + '_classrooms_sci_eng_tue';
var classroomsSciEngWed = yearTerm + '_classrooms_sci_eng_wed';
var classroomsSciEngThur = yearTerm + '_classrooms_sci_eng_thur';
var classroomsSciEngFri = yearTerm + '_classrooms_sci_eng_fri';

var classroomsSciEngWeekdays = [
  { collection: classroomsSciEngMon, day: 1 },
  { collection: classroomsSciEngTue, day: 2 },
  { collection: classroomsSciEngWed, day: 3 },
  { collection: classroomsSciEngThur, day: 4 },
  { collection: classroomsSciEngFri, day: 5 }
];

//Export courses in Nishiwaseda campus
//(School of Fundamental, Creative, and Advanced Science Engineering)
db[rawCoursesAll].aggregate([
  {
    $match: {
      school: {
        //Change the school names here to extract courses that belong to specific schools.
        $in: ['Schl of Fund Sci/Eng', 'Schl Cre Sci/Eng', 'Schl Adv Sci/Eng']
      }
    }
  },
  { $out: rawCoursesSciEng }
]);

quit();

function correctInvalidClassrooms(object) {
  return db.getCollection(rawCoursesSciEng).findAndModify({
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

//These are the common invalid classroom names in courses
//belonging to Nishiwaseda campus.
//You can define your own ones if necessary.
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

//Find and correct invalid classroom field embedded in
//an array of course documents.
//Disable this function if your data contains
//no invalid classroom names.
commonInvalidClassroomsAndCorrections.forEach(function(object) {
  var returnData = 1;
  while (returnData !== null) {
    returnData = correctInvalidClassrooms(object);
  }
});

//Export distinct courses by grouping multiple schools in one array
db[rawCoursesSciEng].aggregate([
  {
    $group: {
      _id: '$hash',
      year: { $first: '$year' },
      term: { $first: '$term' },
      code: { $first: '$code' },
      title: { $first: '$title' },
      instructor: { $first: '$instructor' },
      occurrences: { $first: '$occurrences' },
      schools: { $push: '$school' },
      links: {
        $push: {
          school: '$school',
          link: '$link'
        }
      }
    }
  },
  { $project: { _id: 0 } },
  { $out: coursesSciEng }
]);

//Export classrooms from courses and sort by building number and name
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
  { $out: classroomsSciEng }
]);

//Export buildings from classrooms
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

//Sort buildings by name and sort all classrooms inside by name
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
  { $out: buildingsSciEng }
]);

//Create index 'name' for buildings collection
db.getCollection(buildingsSciEng).createIndex({ name: 1 });

//Group and export classroom schedules by weekdays
//and sort by building number and name
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

//Create index 'building' for classrooms collection
db.getCollection(classroomsSciEng).createIndex({ building: 1 });

//Create index 'building' for weekday classrooms collection
classroomsSciEngWeekdays.forEach(function(object) {
  db.getCollection(object.collection).createIndex({ building: 1 });
});
