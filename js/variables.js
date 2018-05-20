// TODO Include term 'others'?
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

var suffixTemp = '_temp';
var suffixSyllabus = '_syllabus';
var suffixTimetable = '_timetable';
var suffixCoursesAll = '_courses_all';
var suffixCoursesSciEng = '_courses_sci_eng';
var suffixCoursesPse = '_courses_pse';
var suffixCoursesSils = '_courses_sils';

// rawCoursesALL is the name of the initial collection containing the scraped courses info
// for the entire year
var rawEntireYearCoursesAll = raw + entireYear + suffixCoursesAll;
var rawEntireYearCoursesSciEng = raw + entireYear + suffixCoursesSciEng;
var rawEntireYearCoursesPse = raw + entireYear + suffixCoursesPse;
var rawEntireYearCoursesSils = raw + entireYear + suffixCoursesSils;

// the doc _id field in this collection is the first pKey if multiple schools exist.
var entireYearCoursesSciEng =  entireYear + suffixCoursesSciEng;
var entireYearCoursesPse = entireYear + suffixCoursesPse;
var entireYearCoursesSils = entireYear + suffixCoursesSils;

// a simplified version used for syllabus searching
var entireYearCoursesSciEngSearch = entireYearCoursesSciEng + suffixSyllabus;
var entireYearCoursesPseSearch = entireYearCoursesPse + suffixSyllabus;
var entireYearCoursesSilsSearch = entireYearCoursesSils + suffixSyllabus;

var termYearCoursesSciEng = termYear + suffixCoursesSciEng;
var termYearCoursesPse = termYear + suffixCoursesPse;
var termYearCoursesSils = termYear + suffixCoursesSils;
// a simplified version used for searching courses in the timetable section
var termYearCoursesSciEngTimetable = termYearCoursesSciEng + suffixTimetable;
var termYearCoursesPseTimetable = termYearCoursesPse + suffixTimetable;
var termYearCoursesSilsTimetable = termYearCoursesSils + suffixTimetable;

// var classroomsSciEngTemp = termYear + '_classrooms_sci_eng_all' + suffixTemp;
// var classroomsSciEng = termYear + '_classrooms_sci_eng_all';
//
// var buildingsSciEngUnsorted = termYear + '_buildings_sci_eng_unsorted';
// var buildingsSciEngTemp = termYear + '_buildings_sci_eng' + suffixTemp;
// var buildingsSciEng = termYear + '_buildings_sci_eng';

// var classroomsSciEngMon = termYear + '_classrooms_sci_eng_mon';
// var classroomsSciEngTue = termYear + '_classrooms_sci_eng_tue';
// var classroomsSciEngWed = termYear + '_classrooms_sci_eng_wed';
// var classroomsSciEngThur = termYear + '_classrooms_sci_eng_thur';
// var classroomsSciEngFri = termYear + '_classrooms_sci_eng_fri';
//
// var classroomsSciEngWeekdays = [
//   { collection: classroomsSciEngMon, day: 1 },
//   { collection: classroomsSciEngTue, day: 2 },
//   { collection: classroomsSciEngWed, day: 3 },
//   { collection: classroomsSciEngThur, day: 4 },
//   { collection: classroomsSciEngFri, day: 5 }
// ];
