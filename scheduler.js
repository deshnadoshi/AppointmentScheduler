const { time } = require('console');
const fs = require('fs');
const crypto = require('crypto');

let check_selection = false; 

const readline = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

function ask_question(question_string){   
    return new Promise((resolve) => {
        readline.question(question_string, (answer) => {
          resolve(answer);
        });
      });
    
}

async function process_input(attendee_info, book_this_date, generated_dtstamp, method_info, status_info, confirmation_code){

    let start_format_correct = true; 
    let end_format_correct = true; 
    let start_valid = true; 
    let end_valid = true; 
    let start_date = ""; 
    let end_date = ""; 
    let booked_dates = []; 

    do {
        start_date = await ask_question("Enter the start date in your range (format: YYYY-MM-DD):");
        if (start_date.toLowerCase() === 'q'){
            process.exit(); 
        }

        start_format_correct = check_date_format(start_date); 
        if (start_format_correct){
            start_valid = is_valid_date(start_date); 
            if (!start_valid)
                console.log("That is not a valid date. You will be prompted to try again."); 
        }

    } while (start_format_correct == false ||  start_valid == false); 


    
    do {
        end_date = await ask_question("Enter the end date in your range (format: YYYY-MM-DD):");
        if (end_date.toLowerCase() === 'q'){
            process.exit(); 
        }
    
        end_format_correct = check_date_format(end_date); 
        if (end_format_correct){
            end_valid = is_valid_date(end_date); 
            if (!end_valid)
                console.log("That is not a valid date. You will be prompted to try again."); 
        }

    } while (end_format_correct == false || end_valid == false); 

    return new Promise(async (resolve, reject) => {

    if (end_valid && start_valid){
        // code here for the next four available dates.
        let dates_available = [];
        dates_available = await find_N_dates(new Date(start_date), new Date(end_date)); 

        if (dates_available.length == 0){
            console.log("ERROR: There are no available dates in the chosen date range."); 
            run_scheduler(); 
            resolve(false); 
        } else {
            console.log("The available dates in the chosen date range are: "); 
            const selection_dates = {};

            for (let i = 0; i < dates_available.length; i++) {
                const key = "date" + (i + 1); 
                selection_dates[key] = dates_available[i];
            }
            console.log(selection_dates); 

            load_booked_dates(); 

            // console.log(selection_dates.includes(book_this_date)); // delete later
            if (!selection_dates.hasOwnProperty(book_this_date)){
                resolve(false); 
            }


            let valid_selection = true; 
            book_this_date = new Date(); 
            do {

                selected_date = await ask_question("Please enter the corresponding identifier of the date you would like to select (i.e. date1, date2, etc.): "); 
                if (selection_dates.hasOwnProperty(selected_date)){
                    console.log("You selected", selection_dates[selected_date]); 
                    book_this_date = selection_dates[selected_date]; 
                    valid_selection = true; 
                    check_selection = true; 
                } else {
                    console.log("The value you entered does not exist, please try again."); 
                    valid_selection = false; 
                    check_selection = false; 
                }

            } while (valid_selection == false); 


            console.log("\n\nYou will be prompted to schedule your appointment. Please enter the information when prompted."); 
            let valid_attendee = true; 
            const email_regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            const phone_regex = /^\d{3}-?\d{3}-?\d{4}$/;
            attendee_info = ""; 
        
            do {

                attendee = await ask_question("\nPlease enter the ATTENDEE (email or phone number): "); 
                if (email_regex.test(attendee) || phone_regex.test(attendee)){
                    valid_attendee = true; 
                    console.log("You entered", attendee); 
                    attendee_info = attendee; 
                } else {
                    console.log("That is not a valid attendee value. Please try again.");
                    valid_attendee = false; 
                }

            } while (valid_attendee == false); 


            let valid_method = true; 
            method_info = ""; 
            do {

                method = await ask_question("\nPlease enter the METHOD: "); 
                if (method.toLowerCase() === "request"){
                    valid_method = true; 
                    method_info = method; 
                } else {
                    console.log("That is not a valid METHOD value. Please try again. You must enter REQUEST.");
                    valid_method = false; 
                }

            } while (valid_method == false); 


            let valid_status = true; 
            status_info = ""; 
            do {

                status_val = await ask_question("\nPlease enter the STATUS: "); 
                if (status_val.toLowerCase() === "tentative" || status_val.toLowerCase() === "confirmed" ){
                    valid_status = true; 
                    status_info = status_val; 
                } else {
                    console.log("That is not a valid STATUS value. Please try again. You may enter TENTATIVE or CONFIRMED.");
                    valid_status = false; 
                }

            } while (valid_status == false); 

            generated_dtstamp = new Date();
            generated_dtstamp.setHours(0, 0, 0, 0);

            console.log("\nThe DTSTAMP value is today's date:", generated_dtstamp); 
            
            confirmation_code = generated_confirmation_code(); 
            console.log("\nThe confirmation code is", confirmation_code); 
           
            let successfully_added = false; 
            check_selection = true; 
            try {
                successfully_added = add_appointment(attendee_info, book_this_date, generated_dtstamp, method_info, status_info, confirmation_code); 
            } catch (error){
                console.log("Error booking the appointment."); 
            }

            
            if (successfully_added){
                console.log("\nYour appointment has been scheduled. Navigate to 'calendar.txt' to see the appointment."); 
                resolve(true); 

            } else {
                console.log("\nYour appointment has not been scheduled. "); 
                resolve(false); 
            }

            resolve(false); 
            run_scheduler(); 


           

        }


    }

    resolve(false); 

    });


}


function check_date_format(str){
    const date_regex = /^\d{4}-\d{2}-\d{2}$/;

    if (date_regex.test(str)){
        return true; 
    }

    return false; 
}


function is_valid_date(date_str) {
    let year = Number(date_str.split("-")[0]); 
    let month = Number(date_str.split("-")[1]) - 1; 
    let day = Number(date_str.split("-")[2]); 

    const date = new Date(year, month, day); 

    return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
    );
}

async function find_N_dates(start_date, end_date){
    let available_dates = []; 

    let current_date = start_date; 

    let unavailable_dates = await load_booked_dates();
    // console.log(unavailable_dates);


    while (current_date < end_date && available_dates.length < 4){
        current_date.setDate(current_date.getDate() + 1); // Move to the next day

        let check_overlap = compare_date_objects(current_date, unavailable_dates);
        
        if (!is_weekend(current_date) && !is_bank_holiday(current_date) && check_overlap == false){
            available_dates.push(new Date(current_date)); 
        }
    }


    return available_dates;

}

function is_bank_holiday(date_obj){


    const bank_holidays = [
        "01-01", // New Year's Day
        "07-04", // Independence Day
        "12-25",  // Christmas Day
        "02-19", // President's Day
        "06-19", // Juneteenth
        "11-11", // Veterans Day
        "11-28" // Thanksgiving
    ];

    if (bank_holidays.includes(date_obj.getMonth() + "-" + date_obj.getDate())){
        return true; 
    }

    return false; 

}

function is_weekend(date_obj){
    const is_weekend = (date_obj.getDay() === 5 || date_obj.getDay() === 6); 
    if (is_weekend){
        return true;  
    }

    return false; 

}

async function load_booked_dates() {
    return new Promise((resolve, reject) => {
        let booked_times = [];
        let booked_dates = [];

        fs.readFile("calendar.txt", 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file. Please re-run the program.');
                reject(err);
                return;
            }

            let file_data = data.toString();
            let end_calendar = false;
            let begin_calendar = false;
            let begin_vevent = false;
            let end_vevent = false;
            let status_array = []; 

            let current_record = "";
            let records = [];

            file_data.split(/\r?\n/).forEach(line => {
                if ((line.toLowerCase()).includes("begin:vcalendar")) {
                    begin_vevent = true;
                }

                if ((line.toLowerCase()).includes("end:vcalendar")) {
                    end_vevent = true;
                }

                if (end_vevent == false) {
                    if ((line.toLowerCase()).includes("begin:vevent")) {
                        begin_calendar = true;
                        end_calendar = false;
                    }

                    if ((begin_calendar == true) && (end_calendar == false)) {
                        current_record += (line + "\n");
                        if (line.toLowerCase().includes("status")){
                            status_array.push(line.split(":")[1]); 
                        }
                    }

                    if ((line.toLowerCase()).includes("end:vevent")) {
                        records.push(current_record);
                        end_calendar = true;
                        begin_calendar = false;
                        current_record = "";
                    }
                }
            });

            
            for (let i = 0; i < records.length; i++) {
                const match = records[i].match(/DTSTART:(\d{4}-\d{2}-\d{2})/);
            
                if (!status_array[i].toLowerCase().includes("cancelled")) {
                    booked_times.push(match ? match[1] : null);
                }
            }
            
            booked_dates = booked_times.map(dateString => new Date(dateString));

            resolve(booked_dates);
        });
    });
}


function compare_date_objects(date_obj, date_arr){

    for (let i = 0; i < date_arr.length; i++){
        if (date_arr[i].toString() === date_obj.toString()){
            return true;  // there are the same dates 
        }
    }

    return false; 
    

}


function generated_confirmation_code() {
    const timestamp = new Date().getTime().toString();
    const hash = crypto.createHash('sha256').update(timestamp).digest('hex');
    const code = hash.substring(0, 8); 
  
    return code;
  
}



async function add_appointment(attendee, dtstart, dtstamp, method, stat, uid){


    const dtstamp_date = dtstamp.toISOString().split('T')[0];
    const dtstart_date = dtstart.toISOString().split('T')[0];

    let new_appointment = `BEGIN:VEVENT
ATTENDEE:${attendee.toUpperCase()}
DTSTART:${dtstart_date}
DTSTAMP:${dtstamp_date}
METHOD:${method.toUpperCase()}
STATUS:${String(stat).toUpperCase()}
UID:${uid}
END:VEVENT`;

    try {
        let fileContent = await fs.promises.readFile('calendar.txt', 'utf-8');

        const lineIndex = fileContent.indexOf("VERSION:1.0");        

        if (lineIndex !== -1) {
            fileContent = fileContent.slice(0, lineIndex + "VERSION:1.0".length) + "\n" + new_appointment + fileContent.slice(lineIndex + "VERSION:1.0".length);
            await fs.promises.writeFile("calendar.txt", fileContent);
        }

        return true; 
    } catch (err) {
        console.error('Error reading or writing file:', err);
        return false; 
    }




}

function split_record(record){
    let record_contents = []; 

    record.split(/\r?\n/).forEach(line =>  {
        record_contents.push(line); 
    });

    record_contents.pop(); // Gets rid of the extra new line at the end of each record

    return record_contents; 
}

function find_appointment(uid){
    return new Promise((resolve, reject) => {
        fs.readFile("calendar.txt", 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file. Please re-run the program.');
            reject(err);
            return;
        }

        let file_data = data.toString();
        let end_calendar = false;
        let begin_calendar = false;
        let begin_vevent = false;
        let end_vevent = false;

        let current_record = "";
        let records = [];

        file_data.split(/\r?\n/).forEach(line => {
            if ((line.toLowerCase()).includes("begin:vcalendar")) {
                begin_vevent = true;
            }

            if ((line.toLowerCase()).includes("end:vcalendar")) {
                end_vevent = true;
            }

            if (end_vevent == false) {
                if ((line.toLowerCase()).includes("begin:vevent")) {
                    begin_calendar = true;
                    end_calendar = false;
                }

                if ((begin_calendar == true) && (end_calendar == false)) {
                    current_record += (line + "\n");
                }

                if ((line.toLowerCase()).includes("end:vevent")) {
                    records.push(current_record);
                    end_calendar = true;
                    begin_calendar = false;
                    current_record = "";
                }
            }
        });

        // records stores all of the records now 
        split_records_array = []; 
        for (let i = 0; i < records. length; i++){
            split_records_array.push(split_record(records[i])); 
        }

        
        const lookup_record = find_record(split_records_array, uid); 
        if (lookup_record != undefined){
            console.log("Below is the record you requested information about."); 
            console.log(lookup_record);
            run_scheduler(); 
            resolve(true); 
        } else {
            console.log("No such record exists."); 
            run_scheduler(); 
            resolve(false); 
        }
        
        
        

    });
});



}

function find_record(records, uidToFind) {
    return records.find(record => {
      const uidMatch = record.find(line => line.startsWith('UID:'));
      return uidMatch && uidMatch.split(':')[1] === uidToFind;
    });
}

async function create_appointment_check(attendee, dtstart, dtstamp, method, stat, uid, start_date, end_date){

    let dates_available = [];
    dates_available = await find_N_dates(new Date(start_date), new Date(end_date)); 
    const email_regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const phone_regex = /^\d{3}-?\d{3}-?\d{4}$/;

    if (dates_available.includes(dtstart) && method.toLowerCase() === "request" && (stat.toLowerCase() === "tentative" || stat.toLowerCase() === "confirmed") && (email_regex.test(attendee) || phone_regex.test(attendee)) && (end_date >= start_date)){
        console.log("here"); 
        return true; 
    }


    return false; 
}
  

function cancel_appointment(uid){
    return new Promise((resolve, reject) => {

    fs.readFile("calendar.txt", 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading the file. Please re-run the program.');
            reject(err);
            return;
        }

        let file_data = data.toString();
        let end_calendar = false;
        let begin_calendar = false;
        let begin_vevent = false;
        let end_vevent = false;

        let current_record = "";
        let records = [];

        file_data.split(/\r?\n/).forEach(line => {
            if ((line.toLowerCase()).includes("begin:vcalendar")) {
                begin_vevent = true;
            }

            if ((line.toLowerCase()).includes("end:vcalendar")) {
                end_vevent = true;
            }

            if (end_vevent == false) {
                if ((line.toLowerCase()).includes("begin:vevent")) {
                    begin_calendar = true;
                    end_calendar = false;
                }

                if ((begin_calendar == true) && (end_calendar == false)) {
                    current_record += (line + "\n");
                }

                if ((line.toLowerCase()).includes("end:vevent")) {
                    records.push(current_record);
                    end_calendar = true;
                    begin_calendar = false;
                    current_record = "";
                }
            }
        });

        // records stores all of the records now 
        split_records_array = []; 
        for (let i = 0; i < records.length; i++){
            split_records_array.push(split_record(records[i])); 
        }

        
        const lookup_record = find_record(split_records_array, uid); 

        if (lookup_record != undefined){
            console.log("The record below will be cancelled."); 
            let merged_record = lookup_record.join('\n') + "\n";
            console.log("\n", merged_record); 
            
            let updated_record = merged_record.replace(/(STATUS:).*?(?=\n)/, '$1CANCELLED');

            let file_content = data.toString();
            const index_to_replace = records.findIndex(record => record.includes(`UID:${uid}`));

            if (index_to_replace != -1){
                records[index_to_replace] = updated_record; 
                file_content = "BEGIN:VCALENDAR\nPRODID:object1\nVERSION:1.0\n" + records.join("") + "END:VCALENDAR";
                resolve(true); 

                fs.writeFile("calendar.txt", file_content, 'utf-8', (writeErr) => {
                    if (writeErr) {
                        console.error('Error writing to the file:', writeErr);
                        run_scheduler(); 
                        return;

                    } else {
                        console.log('The appointment has been cancelled.');
                        run_scheduler(); 
                        resolve(true);

                    }
                });
        
            }

        } else {
            console.log("No such record exists."); 
            run_scheduler(); 
            resolve(false); 
        }
        
    });

});

}



async function run_scheduler(attendee_info, book_this_date, generated_dtstamp, method_info, status_info, confirmation_code){
    const response =  await ask_question("\nPlease choose your next step: \n    1 - QUIT\n    2 - SCHEDULE APPOINTMENT\n    3 - LOOKUP APPOINTMENT\n    4 - CANCEL APPOINTMENT\n\n");
    if (parseInt(response) == 1){
        console.log("\nProgram terminated."); 
        process.exit(); 
    } else if (parseInt(response) == 2){
        console.log("\nYou have chosen to schedule an appointment."); 
        process_input(attendee_info, book_this_date, generated_dtstamp, method_info, status_info, confirmation_code); 
    } else if (parseInt(response) == 3){
        console.log("\nYou have chosen to lookup an appointment."); 
        const uid = await ask_question("\nPlease enter the appointment confirmation code or UID:"); 
        
        find_appointment(uid); 
    } else if (parseInt(response) == 4){
        console.log("\nYou have chosen to cancel an appointment."); 
        const uid = await ask_question("\nPlease enter the appointment confirmation code or UID:"); 

        cancel_appointment(uid); 

    } else {
        console.log("\nPlease enter a valid selection."); 
        run_scheduler(); 
    }

}

run_scheduler(); 
  

module.exports = {
    add_appointment,
    find_appointment,
    cancel_appointment,
    process_input,
    create_appointment_check,
};
