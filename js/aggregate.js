/*
Important: _id of a course is determined by its pKey in the syllabus database.
When grouping courses, e.g., combining FSE, ASE, CSE schools together for a single course,
we select the first pKey (here the FSE pKey) as the _id for the new grouped course.
*/

hostName = db.hostInfo().system.hostname;
productionHostName = "WasedaTimeProduction";
stagingHostName = "WasedaTimeStaging";

// Load the correct academicCollections.js file.
if (
  hostName.toString() === productionHostName ||
  hostName.toString() === stagingHostName
) {
  load("/home/deploy/waseda-syllabus-scraper/js/academicCollections.js");
} else {
  load(
    "/Users/oscar/PythonProjects/waseda-syllabus-scraper/js/academicCollections.js"
  );
}

function getAcademicYear() {
  var currentDate = new Date();
  var academicYear = currentDate.getFullYear();

  // Minus one year if it January or February
  // Note that January is 0, February is 1
  if (currentDate.getMonth() === 0 || currentDate.getMonth() === 1) {
    academicYear -= 1;
  }
  return academicYear
}

var academicYear = getAcademicYear().toString();

var raw_entire_courses_SCI_ENG = "raw_entire_" + academicYear + "_courses_SCI_ENG";
var entire_courses_SCI_ENG = "entire_" + academicYear + "_courses_SCI_ENG";

var raw_entire_courses_SCI_ENG_collections = [
  "raw_entire_" + academicYear + "_courses_FSE",
  "raw_entire_" + academicYear + "_courses_ASE",
  "raw_entire_" + academicYear + "_courses_CSE"
];

var entire_courses_SCI_ENG_collections = [
  "entire_" + academicYear + "_courses_FSE",
  "entire_" + academicYear + "_courses_ASE",
  "entire_" + academicYear + "_courses_CSE"
];

function copyTo(origin, destination) {
    /**
     * Copies the origin collection to the destination collection.
     */
  db[origin].find().forEach(function(doc) {
    db[destination].insert(doc);
  });
}

function correctInvalidClassrooms(object, rawEntireYearCoursesAcademic) {
  /**
   * Corrects the invalid classroom names in collection rawEntireYearCoursesAcademic.
   */
  return db.getCollection(rawEntireYearCoursesAcademic).findAndModify({
    query: { "occurrences.classroom": object.invalidClassroom },
    update: {
      $set: {
        "occurrences.$.location": object.newLocation,
        "occurrences.$.building": object.newBuilding,
        "occurrences.$.classroom": object.newClassroom
      }
    }
  });
}

// These are the common invalid classroom names in courses
// useful regex for finding: [^a-zA-Z0-9\s\{\}\[\]\:\,\.\-';"\_\(\)\/\\]
var invalidClassroomsAndCorrections = [
  //Nishiwaseda campus
  {
    invalidClassroom: "61号館2階",
    newLocation: "61-2F",
    newBuilding: "61",
    newClassroom: "2F"
  },
  {
    invalidClassroom: "61号館BF",
    newLocation: "61-BF",
    newBuilding: "61",
    newClassroom: "BF"
  },
  {
    invalidClassroom: "Business Design & Management labo 61-2F",
    newLocation: "61-2F Business Design & Management lab",
    newBuilding: "61",
    newClassroom: "2F Business Design & Management lab"
  },
  {
    invalidClassroom: "foyer 50-301",
    newLocation: "50-301",
    newBuilding: "50",
    newClassroom: "301"
  },
  {
    invalidClassroom: "Seminar room 3 50-304",
    newLocation: "50-304",
    newBuilding: "50",
    newClassroom: "304"
  },
  {
    invalidClassroom: "255B教室",
    newLocation: "61-255B",
    newBuilding: "61",
    newClassroom: "255B"
  },
  {
    invalidClassroom: "711教室",
    newLocation: "51-711",
    newBuilding: "51",
    newClassroom: "711"
  },
  {
    invalidClassroom: "3F 社工演習室",
    newLocation: "58-3F",
    newBuilding: "58",
    newClassroom: "3F"
  },
  {
    invalidClassroom: "801教室",
    newLocation: "51-801",
    newBuilding: "51",
    newClassroom: "801"
  },
  //Main Campus
  {
    invalidClassroom:
      "201(Center for Teaching,Learning, and Technology Active Learning)",
    newLocation: "3-201",
    newBuilding: "3",
    newClassroom: "201"
  },
  {
    invalidClassroom:
      "202(Center for Teaching,Learning, and Technology Active Learning)",
    newLocation: "3-202",
    newBuilding: "3",
    newClassroom: "202"
  },
  {
    invalidClassroom:
      "203(Center for Teaching,Learning, and Technology Active Learning)",
    newLocation: "3-203",
    newBuilding: "3",
    newClassroom: "203"
  },
  {
    invalidClassroom: "806共同利用研究室7",
    newLocation: "14-806",
    newBuilding: "14",
    newClassroom: "806"
  },
  {
    invalidClassroom: "504(コンピュータ教室)科学技術計算",
    newLocation: "14-504",
    newBuilding: "14",
    newClassroom: "504"
  },
  {
    invalidClassroom: "408(コンピュータ教室)",
    newLocation: "16-408",
    newBuilding: "16",
    newClassroom: "408"
  }
];

//実習室
var trainingRooms = [
  "909",
  "910",
  "912",
  "913",
  "914",
  "915",
  "916",
  "917",
  "918",
  "1103",
  "1104",
  "1115",
  "1116"
];

var invalidTrainingRoomsAndCorrections = trainingRooms.map(function(room) {
  return {
    invalidClassroom: room.concat("実習室"),
    newLocation: "3-".concat(room),
    newBuilding: "3",
    newClassroom: room
  };
});

// Remove docs with incorrect field count
rawEntireYearCoursesAcademics.forEach(function(rawEntireYearCoursesAcademic) {
  db[rawEntireYearCoursesAcademic].find().forEach(function(doc) {
    var field_count = Object.keys(doc).length;
    if (field_count < 11) {
      var doc_title = doc.title;
      db[rawEntireYearCoursesAcademic].remove({"_id": doc._id});
      print(rawEntireYearCoursesAcademic + ": Remove " + doc_title + " because field count is " + field_count);
      print(Object.keys(doc));
      var vals = Object.keys(doc).map(function(key) {
        return doc[key];
      });
      print(vals);
    }
  });
});

// Get all invalid classroom and corrections.
invalidClassroomsAndCorrections = invalidClassroomsAndCorrections.concat(
  invalidTrainingRoomsAndCorrections
);

// Find and correct invalid classroom field embedded in
// an array of course documents for all collections
rawEntireYearCoursesAcademics.forEach(function(rawEntireYearCoursesAcademic) {
  invalidClassroomsAndCorrections.forEach(function(object) {
    var returnData = 1;
    while (returnData !== null) {
      returnData = correctInvalidClassrooms(
        object,
        rawEntireYearCoursesAcademic
      );
    }
  });
});

function groupMultipleSchools(
  rawEntireYearCoursesAcademic,
  entireYearCoursesAcademic
) {
  var tempCollection = 'temp';
  // Export distinct courses by grouping multiple schools in one array
  db[rawEntireYearCoursesAcademic].aggregate([
    {
      $group: {
        _id: {
          year: '$year',
          term: '$term',
          code: '$code',
          title: '$title',
          title_jp: '$title_jp',
          instructor: '$instructor',
          instructor_jp: '$instructor_jp',
          occurrences: '$occurrences',
          keywords: '$keywords',
          lang: '$lang'
        },
        keys: {
          $push: {
            school: '$school',
            key: '$_id'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        term: '$_id.term',
        code: '$_id.code',
        title: '$_id.title',
        title_jp: '$_id.title_jp',
        instructor: '$_id.instructor',
        instructor_jp: '$_id.instructor_jp',
        occurrences: '$_id.occurrences',
        keywords: '$_id.keywords',
        lang: '$_id.lang',
        keys: '$keys'
      }
    },
    { $out: tempCollection }
  ]);

  // Reassign _id value of every docs to first key (pKey in official syllabus) and insert to a new collection
  db[tempCollection].find().forEach(function(course) {
    // Taking the first key as _id
    course._id = course.keys[0].key.toString();
    db[entireYearCoursesAcademic].insert(course);
  });

  // Drop temporary collection
  db[tempCollection].drop();
}

// Copy FSE CSE ASE to SCI_ENG
rawEntireYearCoursesAcademics.forEach(function(
  rawEntireYearCoursesAcademic
) {
  if (raw_entire_courses_SCI_ENG_collections.includes(rawEntireYearCoursesAcademic)) {
    copyTo(rawEntireYearCoursesAcademic, raw_entire_courses_SCI_ENG)
  }
});


// Remove FSE CSE ASE collection names
var rawEntireYearCoursesAcademics = rawEntireYearCoursesAcademics.filter(function(rawEntireYearCoursesAcademic){
  return !raw_entire_courses_SCI_ENG_collections.includes(rawEntireYearCoursesAcademic)
});
var entireYearCoursesAcademics = entireYearCoursesAcademics.filter(function(entireYearCoursesAcademic){
  return !entire_courses_SCI_ENG_collections.includes(entireYearCoursesAcademic)
});

// Add SCI_ENG collection name
rawEntireYearCoursesAcademics.push(raw_entire_courses_SCI_ENG);
entireYearCoursesAcademics.push(entire_courses_SCI_ENG);

rawEntireYearCoursesAcademics.forEach(function(
  rawEntireYearCoursesAcademic,
  index
) {
  groupMultipleSchools(
    rawEntireYearCoursesAcademic,
    entireYearCoursesAcademics[index]
  );
});

function sortEntireYearCoursesAcademic(entireYearCoursesAcademic) {
  // Sort entireYearCoursesAcademic collection by title then instructor
  db[entireYearCoursesAcademic].aggregate([
    { $sort: { title: 1, instructor: 1 } },
    { $out: entireYearCoursesAcademic }
  ]);
}

var springSems = new Set(['springSem', 'springQuart', 'summerQuart', 'intensiveSpringSem', 'intensiveSpring', 'intensiveSummer', 'springSummer']);
var fallSems = new Set(['fallSem', 'fallQuart', 'winterQuart', 'intensiveFallSem', 'intensiveFall', 'intensiveWinter', 'fallWinter']);
var filterOut = "spring";
// Remove docs with unneeded term (semester)
// entireYearCoursesAcademics.forEach(function(entireYearCoursesAcademic) {
//   db[entireYearCoursesAcademic].find().forEach(function(doc) {
//     var doc_term = doc.term;
//     var doc_title = doc.title;
//     if (filterOut === "spring") {
//       if (springSems.has(doc_term)) {
//         db[entireYearCoursesAcademic].remove({"_id": doc._id});
//         print(entireYearCoursesAcademic + ": Remove " + doc_title + " because the term is spring")
//       }
//     } else {
//       if (fallSems.has(doc_term)) {
//         db[entireYearCoursesAcademic].remove({"_id": doc._id});
//         print(entireYearCoursesAcademic + ": Remove " + doc_title + " because the term is fall")
//       }
//     }
//   });
// });

// Sort aggregated collections
entireYearCoursesAcademics.forEach(function(entireYearCoursesAcademic) {
  sortEntireYearCoursesAcademic(entireYearCoursesAcademic);
});

function upsertAllTo(source, destination) {
  /**
   * For each document in source collection, replace the corresponding one
   * with the same _id in destination collection. If there are no document with same _id, insert the document.
   */
  var total_result = {
    totalCount: 0,
    matchedCount: 0,
    modifiedCount: 0,
    upsertedCount: 0
  };
  db[source].find().forEach(function(doc) {
    try {
      var result = db[destination].updateOne(
        { "_id" : doc._id },
        {$set: doc},
        {upsert : true}
      );
      total_result['totalCount'] += 1;
      total_result['matchedCount'] += result['matchedCount'];
      total_result['modifiedCount'] += result['modifiedCount'];
      if (result['upsertedCount'] !== undefined) {
        total_result['upsertedCount'] += result['upsertedCount'];
      }
    } catch (e) {
      print(e)
    }
  });
  return total_result
}

function removeIfNotExist(source, destination) {
  var total_result = {
    totalCount: 0,
    removedCount: 0
  };
  var source_docs = db[source].find().limit(1).toArray();
  var source_doc = source_docs[0];
  db[destination].find().forEach(function(doc) {
    var foundDoc = db[source].findOne({"_id": doc._id});
    if (foundDoc === null) {
      var result = db[destination].remove({"_id": doc._id});
      total_result['removedCount'] += result['nRemoved'];
    }
    total_result['totalCount'] += 1;
  });
  return total_result;
}

entireYearCoursesAcademics.forEach(function(entireYearCoursesAcademic) {
  var result = upsertAllTo(entireYearCoursesAcademic, entireYearCoursesAll);
  print("Upsert documents in " + entireYearCoursesAcademic + " to " + entireYearCoursesAll);
  printjson(result);
});

// entireYearCoursesAcademics.forEach(function(entireYearCoursesAcademic) {
//   var result = removeIfNotExist(entireYearCoursesAcademic, entireYearCoursesAll);
//   print("Remove documents in " + entireYearCoursesAll + " which does not exist in  " + entireYearCoursesAcademic)
//   printjson(result)
//
// });

sortEntireYearCoursesAcademic(entireYearCoursesAll);


function addHasEvalsKey(collection) {
  var total_result = {
    totalCount: 0,
    silsOrPseSeminarCount: 0,
    hasEvalsCount: 0
  };

  db[collection].find().forEach(function (course) {

    var course_id = course["_id"];
    var title = course["title"];
    var schools = course["keys"].map(function (obj) {
      return obj["school"]
    });

    var course_key_length = 10;
    var is_SILS_or_PSE = (schools.includes("SILS") || schools.includes("PSE"));
    title = title.toLowerCase();
    if (is_SILS_or_PSE && title.includes("seminar")) {
      // SILS and PSE seminars
      course_key_length = 12;
      total_result["silsOrPseSeminarCount"] += 1;
    }

    var course_key = course_id.slice(0, course_key_length);

    var course_evals = db.getSiblingDB("course_evals").getCollection("test").find({"course_key": course_key}).toArray();

    var has_evals = false;
    if (course_evals.length !== 0) {
      has_evals = true;
      print(entireYearCoursesAll + ": Course " + title + " has evaluations.");
      total_result["hasEvalsCount"] += 1;
    }

    try {
      db[collection].updateOne(
        {"_id": course_id},
        {$set: {"has_evals": has_evals}},
        {upsert: false}
      );
      total_result['totalCount'] += 1;
    } catch (e) {
      print(e)
    }
  });
  return total_result;
}

var addHasEvalsKeyResult = addHasEvalsKey(entireYearCoursesAll);
printjson(addHasEvalsKeyResult);


function minifyKeys(source, destination) {

  var total_result = {
    totalCount: 0,
    matchedCount: 0,
    modifiedCount: 0,
    upsertedCount: 0
  };

  db[source].find().forEach(function (doc) {
    try {
      var minDoc = {};

      minDoc['t'] = doc['title'];
      minDoc['tj'] = doc['title_jp'];
      minDoc['i'] = doc['instructor'];
      minDoc['ij'] = doc['instructor_jp'];
      minDoc['l'] = doc['lang'];
      minDoc['c'] = doc['code'];
      minDoc['tm'] = doc['term'];
      minDoc['y'] = doc['year'];
      minDoc['e'] = doc['has_evals'];

      if (doc.hasOwnProperty('keywords')) {
        minDoc['kws'] = doc['keywords']
      }

      minDoc['os'] = [];
      minDoc['ks'] = [];

      var os = doc['occurrences'];
      var ks = doc['keys'];

      for (var i=0; i < os.length; i++) {
        var minDocO = {};
        minDocO['d'] = os[i]['day'];
        minDocO['s'] = os[i]['start_period'];
        minDocO['e'] = os[i]['end_period'];
        minDocO['b'] = os[i]['building'];
        minDocO['c'] = os[i]['classroom'];
        minDocO['l'] = os[i]['location'];

        minDoc['os'][i] = minDocO;
      }

      for (i=0; i < ks.length; i++) {
        var minDocK = {};
        minDocK['s'] = ks[i]['school'];
        minDocK['k'] = ks[i]['key'];

        minDoc['ks'][i] = minDocK;
      }

      var result = db[destination].updateOne(
        { "_id" : doc._id },
        {$set: minDoc},
        {upsert : true}
      );

      total_result['totalCount'] += 1;
      total_result['matchedCount'] += result['matchedCount'];
      total_result['modifiedCount'] += result['modifiedCount'];
      if (result['upsertedCount'] !== undefined) {
        total_result['upsertedCount'] += result['upsertedCount'];
      }
    } catch (e) {
      print(e)
    }
  });

  return total_result;
}

var minifyResult = minifyKeys(entireYearCoursesAll, entireYearCoursesAllMin);
print("minify keys in documents in " + entireYearCoursesAll + " and store in " + entireYearCoursesAllMin);
printjson(minifyResult);

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
