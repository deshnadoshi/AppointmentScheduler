const { add_appointment } = require('../../scheduler');
const { find_record } = require('../../scheduler');
const { cancel_appointment } = require('../../scheduler');
const { process_input } = require('../../scheduler');


describe ('Appointment Scheduler', () => {
    // Test Case 1: Should schedule an appointment with acceptable parameters. 
    it ('should schedule an appointment with acceptable parameters.', async () => {
        const result = await add_appointment("test1@gmail.com", new Date(2024, 5, 13), new Date(2024, 2, 18), "REQUEST", "TENTATIVE", "fskj234"); 
        expect(result).toBe(true); 

    }); 

    // Test Case 2: Should not schedule an appointment that is scheduled on the same day as an exisitng appointment. 
    it ('should not schedule an appointment that is scheduled on the same day as an exisitng appointment.', async () => {
        const result = await process_input("test2@gmail.com", new Date(2024, 1, 12), new Date(2024, 2, 18), "REQUEST", "CONFIRMED", "ds87lsk"); 
        expect(result).toBe(false); 

    }); 

})

