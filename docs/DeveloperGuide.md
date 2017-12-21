### MongoDB Aggregation Framework

#### Export aggregation result to a new collection

```
db.<collection>.aggregate( [
     { <operation> },
     { <operation> },
     ...,
     { $out : "<output-collection>" }
] )
```

#### Export courses with a particular school

```JavaScript
db["2017_fall_courses_raw"].aggregate( [
     { $match: { school: { $in: ['Schl of Fund Sci/Eng', 'Schl Cre Sci/Eng', 'Schl Adv Sci/Eng'] } } },
     { $out : "2017F_courses_sci_eng_raw" }
] )
```

#### Export distinct courses by grouping schools

```JavaScript
db["2017F_courses_sci_eng_raw"].aggregate( [
    { $group :
        { _id : "$hash",
          year: { $first: "$year" },
          term: { $first: "$term" },
          code: { $first: "$code" },
          title: { $first: "$title" },
          instructor: { $first: "$instructor" },
          occurrences: { $first: "$occurrences" },
          schools: { $push: "$school" },
          links: { $push: {
                   school: "$school",
                   link: "$link"
                   }         
                 }
        }
    },
    { $project: { _id: 0 } },
    { $out : "2017F_courses_sci_eng" }
] )
```

#### Export classrooms from courses

```JavaScript
db["2017F_courses_sci_eng"].aggregate( [
    { $unwind : "$occurrences" },
    { $group :
        { _id : "$occurrences.location",
          name: { $first: "$occurrences.classroom" },
          building: { $first: "$occurrences.building" },
          courses:
              { $push: {
                id: "$_id",
                title: "$title",
                occurrences: "$occurrences"
              }
          }
        }
    },
    { $project : { _id: 0, "courses.occurrences.location": 0, "courses.occurrences.classroom": 0, "courses.occurrences.building": 0} },
    { $out : "2017F_classrooms_sci_eng" }
] )
```

#### Export buildings from classrooms with id being building number 

```JavaScript
db["2017F_classrooms_sci_eng"].aggregate( [
    { $group :
        { _id : "$building",
          classrooms: { $push: { id:"$_id", name:"$name" } }
        }
    },
    { $out : "2017F_buildings_sci_eng" }
] )
```


#### Export buildings from classrooms with id being ObjectId

```JavaScript
db.classrooms_fund_eng_eng.aggregate( [
    { $group :
        { _id : "$building",
          classrooms: { $push: { id:"$_id", name:"$name" } }
        }
    },
    { $project: { _id: 0, "name": "$_id", "classrooms": 1 }},
    { $out : "buildings_fund_eng_eng_new" }
] )
```

### Find and modify field embedded in an array of documents ONE BY ONE

Concatenate the array with the embedded field use dot sign
$ sign only matches the FIRST array element

```JavaScript
db.getCollection('2017F_courses_sci_eng').findAndModify({
    query: { 'occurrences.$.classroom': "Seminar room 3 50-304" },
    update: { $set: { 
        'occurrences.$.location': "50-304 Seminar room 3",
        'occurrences.$.building': "50",
        'occurrences.$.classroom': "304 Seminar room 3"
    } }
})
```


### User Stories

Priority | As a... | I want to... | So that I can...
---|---|---|---
\*\*\* | user | check the classroom occupancy | select an empty classroom to study
\*\*\* | user | filter classrooms according to buildings | search more efficiently
\*\*\* | user | check the daily schedule of each classroom | know what classes are held
