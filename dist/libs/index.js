import moment from "moment";
export function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
}
export function toDate(value) {
    return moment(value).format("DD/MM/YYYY");
}
export function toDateTime(value) {
    return moment(value).format("DD/MM/YYYY hh:mm:ss A");
}
export function toTime(value) {
    return moment(value).format("hh:mm:ss A");
}
export function getWeekDay(date) {
    switch (moment(date).weekday()) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
        default:
            return "";
    }
}
export function getMonth(date) {
    switch (moment(date).month()) {
        case 0:
            return "January";
        case 1:
            return "February";
        case 2:
            return "March";
        case 3:
            return "April";
        case 4:
            return "May";
        case 5:
            return "June";
        case 6:
            return "July";
        case 7:
            return "August";
        case 8:
            return "September";
        case 9:
            return "October";
        case 10:
            return "November";
        case 11:
            return "December";
        default:
            return "";
    }
}
export function getPaymaneDuration(plan) {
    switch (plan) {
        case "FREE":
            return 3;
        case "QUARTERLY":
            return 3;
        case "HALF YEARLY":
            return 6;
        case "YEARLY":
            return 12;
        default:
            return 0;
    }
}
