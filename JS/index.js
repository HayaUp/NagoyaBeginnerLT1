"use strict";

//
const COLUMN_TIMESTAMP  = 0;
const COLUMN_TASK_NAME  = 1;

const TIMESTAMP_YEAR    = 0;
const TIMESTAMP_MONTH   = 1;
const TIMESTAMP_DAY     = 2;
const TIMESTAMP_TIME    = 3;

//
const csv_rows = GoogleSheetLog();

let task_data   = [];
let task_names  = [];
let task_times  = [];

csv_rows.forEach(element => {

    const csv_columns = RemoveExtraString(element).split(",");

    // Logの時間を加工する
    let timestamp_parts = SortParts(csv_columns[COLUMN_TIMESTAMP]).split(" ");

    timestamp_parts[TIMESTAMP_MONTH]    = ConvertMonthNameToMonthNumber(timestamp_parts[TIMESTAMP_MONTH]);
    timestamp_parts[TIMESTAMP_MONTH]    = Change1DigitNumberTo2DigitString(timestamp_parts[TIMESTAMP_MONTH]);
    timestamp_parts[TIMESTAMP_DAY]      = Change1DigitNumberTo2DigitString(timestamp_parts[TIMESTAMP_DAY]);
    timestamp_parts[TIMESTAMP_TIME]     = ConvertHMWToHMS(timestamp_parts[TIMESTAMP_TIME]);

    const timestamp = `${timestamp_parts[TIMESTAMP_YEAR]}-${timestamp_parts[TIMESTAMP_MONTH]}-${timestamp_parts[TIMESTAMP_DAY]} ${timestamp_parts[TIMESTAMP_TIME]}`;

    // タスクごとに開始時間と終了時間を分ける
    // task_data["睡眠"]
    if(!task_data[csv_columns[COLUMN_TASK_NAME]])
        task_data[csv_columns[COLUMN_TASK_NAME]] = [];

    // task_data["睡眠"][0] = "2019-10-11 01:28:53";
    task_data[csv_columns[COLUMN_TASK_NAME]][task_data[csv_columns[COLUMN_TASK_NAME]].length] = timestamp;
});

// タスクの消化時間を求める
Object.keys(task_data).forEach((v, i) => {

    if(task_data[v].length < 2)
        return;

    const task_time = moment(task_data[v][1]).diff(task_data[v][0], "minutes");

    task_names.push(v);
    task_times.push(task_time);
});

//
const my_chart = new Chart(
    document.getElementById("my_chart").getContext("2d")
    , {
        type    : "horizontalBar"
        , data  : {
            labels      : task_names
            , datasets  : [{
                label               : 'タスク'
                , data              : task_times
                , backgroundColor   : "rgba(10,100,200,0.5)"
            }]
        }
        , options : {
            title : {
                display : true
                , text  : "タスク別消化時間"
            }
            , scales : {
                yAxes : [{
                    ticks : {
                        suggestedMin    : 0
                        , suggestedMax  : 100
                        , stepSize      : 10
                        , callback      : function(value, index, values) {
                            return value;
                        }
                    }}
                ]
            }
        }
    }
);

/*
    "October 2, 2019 at 10:17PM",実験
    ↓
    October 2 2019 10:17PM,実験
*/
function RemoveExtraString(ifttt_string)
{
    if(ifttt_string == null)
        return "";

    return ifttt_string
            .replace(/\"/g, "")
            .replace(", ", " ")
            .replace("at ", "");
}

/*
    October 2 2019 10:17PM
    ↓
    2019 October 2 10:17PM
*/
function SortParts(ifttt_timestamp)
{
    if(ifttt_timestamp == null)
        return "";

    const timestamp_parts = ifttt_timestamp.split(" ");

    return `${timestamp_parts[2]} ${timestamp_parts[0]} ${timestamp_parts[1]} ${timestamp_parts[3]}`;
}

/*
    January
    ↓
    1
*/
function ConvertMonthNameToMonthNumber(month_name)
{
    let month_number = 0;

    if(month_name == null)
        return month_number;

    if(month_name === "January")
        month_number = 1;
    else if(month_name === "February")
        month_number = 2;
    else if(month_name === "March")
        month_number = 3;
    else if(month_name === "April")
        month_number = 4;
    else if(month_name === "May")
        month_number = 5;
    else if(month_name === "June")
        month_number = 6;
    else if(month_name === "July")
        month_number = 7;
    else if(month_name === "August")
        month_number = 8;
    else if(month_name === "September")
        month_number = 9;
    else if(month_name === "October")
        month_number = 10;
    else if(month_name === "November")
        month_number = 11;
    else if(month_name === "December")
        month_number = 12;

    return month_number;
}

/*
*/
function Change1DigitNumberTo2DigitString(number)
{
    if(number < 0)
        return String(number);

    return number < 10 ? `0${String(number)}` : String(number);
}

/*
    11:22PN
    ↓
    23:22:00

    HMW...Hour Minute Word
*/
function ConvertHMWToHMS(timestamp_parts_time)
{
    if(timestamp_parts_time == null)
        return "";

    let hms_parts = timestamp_parts_time.split(":");

    if(/PM/.test(timestamp_parts_time))
        hms_parts[0] = String(Number(hms_parts[0]) + 12);

    hms_parts[1] = hms_parts[1].substring(0, hms_parts[1].length - 2);

    return `${hms_parts[0]}:${hms_parts[1]}:00`;
}
