# ECE452: Software Engineering Assignment 4
#### Deshna Doshi, dd1035, 206009273
### Algorithm Design Description: 

**_Jasmine Test Cases Note: Running 'npm test' more than once in a row will cause the Jasmine test case outputs to be added to calendar.txt twice (they will NOT overwrite each other), thus the output may look a little unexpected. However, the test cases will all pass no matter how many times they are run._**

1. The program runs with a menu. After every iteration of a certain task is completed (schedule, lookup, or cancel), users will be prompted to choose what they would like to do next. 

2. Users will begin by inputting a range of dates in the form YYYY-MM-DD, between which they'd like to see 1-4 available dates. 

2. Dates in DTSTART and DTSTAMP must be in the form YYYY-MM-DD, considering the assumption that only one patient is admitted per day. 

3. The algorithm will only as the user to input/select ATTENDEE, DTSTART, METHOD, STATUS. DTSTAMP will be generated based on the timestamp during which the program was run. UID (Confirmation Code) will be generated randomly and will be unique. 

4. During time of scheduling, the user can only enter TENTATIVE or CONFIRMED for the STATUS value. It does not make sense to allow the user to enter CANCELLED when they are in the process of booking the appointment. 

5. The considered holidays include the following dates: "01-01", // New Year's Day, "07-04", // Independence Day, "12-25",  // Christmas Day, "02-19", // President's Day, "06-19", // Juneteenth, "11-11", // Veterans Day, "11-28" // Thanksgiving. 

6. The only acceptable value of METHOD is REQUEST.

7. The only acceptable value of ATTENDEE is an email or 10 digit phone number. 

8. Any entries made by the user that are invalid (dates, VEVENT properties) will display and error and will prompt the user to try again, until they have entered an acceptable value. 

10. The file "calendar.txt" serves as the sole records file in this program. This file is pre-loaded with 2 VEVENT records (for testing purposes). All new records will be added to this file. In other words, this file is dynamic and will continuously update as the user chooses to cancel or schedule appointments. 

11. When appointments are cancelled, the status is changed to CANCELLED in the file. 

12. The UID functions as the patient's identifier and the confirmation code. Lookup and cancellation happens based on the UID only. No other value can be used to cancel or lookup an appointment. 



