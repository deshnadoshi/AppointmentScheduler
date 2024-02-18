const { add_appointment } = require('../../scheduler');
const { find_record } = require('../../scheduler');
const { cancel_appointment } = require('../../scheduler');

describe ('Appointment Scheduler', () => {
    // Test Case 1: Should schedule an appointment with acceptable parameters. 
    it ('should schedule an appointment with acceptable parameters.', async () => {
        const result = await add_appointment("test1@gmail.com", new Date(2024, 5, 13), new Date(2024, 2, 18), "request", "confirmed", "fskj234"); 
        expect(result).toBe(true); 

    }); 

})

