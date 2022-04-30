const moment = require('moment');

module.exports.getHour = function () {
    let date = new Date().toLocaleDateString('fr') + ' at ';
    let hour;
    if (moment().format('h:mm:ss a').includes('pm')) {
        let cut;
        for (let i = 0; i < moment().format('h:mm:ss a').length; i++) {
            if (moment().format('h:mm:ss a')[i] === ':') {
                cut = i;
                i = moment().format('h:mm:ss a').length;
            }
        }
        hour = (Number(moment().format('h:mm:ss a').slice(0, cut)) + 12)
            .toString() + moment().format('h:mm:ss a')
            .slice(cut, moment().format('h:mm:ss a').length - 6);
        if(hour[0]==='2' && hour[1]==='4'){
            hour = '12' + hour.slice(2,hour.length);
        }
    } else {
        hour = moment().format('h:mm:ss a').slice(0, moment().format('h:mm:ss a').length - 6);
        if(hour[0]==='1' && hour[1]==='2'){
            hour = '00' + hour.slice(2,hour.length);
        }
    }
    return date + hour;
}