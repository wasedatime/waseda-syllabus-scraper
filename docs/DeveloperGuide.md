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

#### Export classrooms from courses

```JavaScript
db.courses_fund_eng_eng.aggregate( [
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
    { $out : "classrooms_fund_eng_eng" }
] )
```

#### Export buildings from classrooms

```JavaScript
db.classrooms_fund_eng_eng.aggregate( [
    { $group :
        { _id : "$building",
          classrooms: { $push: { id:"$_id", name:"$name" } }
        }
    },
    { $out : "buildings_fund_eng_eng" }
] )
```


### User Stories

Priority | As a... | I want to... | So that I can...
---|---|---|---
\*\*\* | user | check the classroom occupancy | select an empty classroom to study
\*\*\* | user | filter classrooms according to buildings | search more efficiently
\*\*\* | user | check the daily schedule of each classroom | know what classes are held
