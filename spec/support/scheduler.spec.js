const { add_appointment } = require('../../scheduler');
const { find_appointment } = require('../../scheduler');
const { cancel_appointment } = require('../../scheduler');
const { process_input } = require('../../scheduler');
const { create_appointment_check } = require('../../scheduler');


const fs = require('fs');
const path = require('path');


describe ('Appointment Scheduler', () => {
    // Test Case 1: Should schedule an appointment with acceptable parameters. 
    it ('should schedule an appointment with acceptable parameters.', async () => {
        await add_appointment("TEST1@GMAIL.COM", new Date(2024, 5, 13), new Date(2024, 2, 18), "REQUEST", "TENTATIVE", "fskj234"); 
        
        let result_record = "BEGIN:VEVENT\nATTENDEE:TEST1@GMAIL.COM\nDTSTART:2024-06-13\nDTSTAMP:2024-03-18\nMETHOD:REQUEST\nSTATUS:TENTATIVE\nUID:fskj234\nEND:VEVENT\n";

        const fileContent = fs.readFileSync("calendar.txt", 'utf-8');
        expect(fileContent).toContain(result_record);

    }); 

    // Test Case 2: Should not schedule an appointment that is scheduled on the same day as an exisitng appointment. 
    it ('should not schedule an appointment that is scheduled on the same day as an exisitng appointment.', async () => {
        const result = await create_appointment_check("TEST2@GMAIL.COM", new Date(2024, 1, 12), new Date(2024, 2, 18), "REQUEST", "CONFIRMED", "ds87lsk", "2024-02-10", "2024-02-20"); 
        
        expect(result).toBe(false);

    }); 

    // Test Case 3: Should not schedule an appointment that does not have an acceptable attendee value. 
    it ('should not schedule an appointment that does not have an acceptable attendee value.', async () => {
        const result = await create_appointment_check("deshna-doshi", new Date(2024, 11, 10), new Date(2024, 2, 18), "REQUEST", "CONFIRMED", "sdf12cnm", "2024-11-09", "2025-01-31"); 
        
        expect(result).toBe(false);

    }); 

    // Test Case 4: Should not schedule an appointment that does not have an acceptable method value. 
    it ('should not schedule an appointment that does not have an acceptable method value.', async () => {
        const result = await create_appointment_check("TEST4@EMAIL.COM", new Date(2024, 11, 10), new Date(2024, 2, 18), "place-order", "CONFIRMED", "sdf12cnm", "2024-11-09", "2025-01-31"); 
        
        expect(result).toBe(false);

    }); 

    // Test Case 5: Should not schedule an appointment that does not have an acceptable status value. 
    it ('should not schedule an appointment that does not have an acceptable status value.', async () => {
        const result = await create_appointment_check("TEST5@EMAIL.COM", new Date(2024, 11, 10), new Date(2024, 2, 18), "REQUEST", "not sure", "sdf12cnm", "2024-11-09", "2025-01-31"); 
        
        expect(result).toBe(false);

    }); 

    // Test Case 6: Should not schedule an appointment that does not have an acceptable range of dates. 
    it ('should not schedule an appointment that does not have an acceptable range of dates.', async () => {
        const result = await create_appointment_check("TEST6@EMAIL.COM", new Date(2024, 11, 10), new Date(2024, 2, 18), "REQUEST", "CONFIRMED", "sdf12cnm", "2025-11-09", "2024-01-31"); 
        
        expect(result).toBe(false);

    }); 

    // Test Case 7: Should not schedule an appointment that is on a weekend. 
    it ('should not schedule an appointment that does not have an acceptable range of dates.', async () => {
        const result = await create_appointment_check("TEST7@EMAIL.COM", new Date(2024, 1, 18), new Date(2024, 2, 18), "REQUEST", "CONFIRMED", "sdf12cnm", "2024-11-09", "2025-01-31"); 
        
        expect(result).toBe(false);

    }); 

    // Test Case 8: Should not schedule an appointment that is on a bank holiday. 
    it ('should not schedule an appointment that is on a bank holiday.', async () => {
        const result = await create_appointment_check("TEST8@EMAIL.COM", new Date(2024, 1, 1), new Date(2024, 2, 18), "REQUEST", "CONFIRMED", "sdf12cnm", "2024-11-09", "2025-01-31"); 
        
        expect(result).toBe(false);

    }); 

    // Test Case 9: Should not return true during lookup if the uid does not exist. 
    it ('should not return an appointment during lookup if the uid does not exist.', async () => {
        await add_appointment("TEST9@GMAIL.COM", new Date(2024, 12, 9), new Date(2024, 2, 18), "REQUEST", "TENTATIVE", "oer328nj"); 
        
        const result = await find_appointment("uid12932"); 
        expect(result).toBe(false);

    }); 

    // Test Case 10: Should return true during lookup if the uid exists. 
    it ('should return an appointment during lookup if the uid exists.', async () => {
        
        const result = await find_appointment("fhdr123"); 
        expect(result).toBe(true);

    }); 

    // Test Case 11: Should not return true during cancellation if the uid does not exist. 
    it ('should not return true during cancellation if the uid does not exist.', async () => {
        await add_appointment("TEST11@GMAIL.COM", new Date(2024, 9, 28), new Date(2024, 2, 18), "REQUEST", "TENTATIVE", "einr25dh4"); 
        
        const result = await cancel_appointment("uid12932"); 
        expect(result).toBe(false);

    }); 

    // Test Case 12: Should return true during cancellation if the uid exists. 
    it ('should return true during cancellation if the uid exists.', async () => {
        
        const result = await cancel_appointment("reio620"); 
        expect(result).toBe(true);

    }); 
})

