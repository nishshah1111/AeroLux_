require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const connectToDatabase = require('./lib/mongodb');
const Aircraft = require('./models/aircraft');
const User = require('./models/user');
const Inquiry = require('./models/inquiry');

const setupAircraftDatabase = async () => {
    try {
        console.log('Clearing existing aircraft data...');
        await Aircraft.deleteMany({});
        
        console.log('Importing aircraft data from CSV...');
        const stream = fs.createReadStream('aircraft_data.csv').pipe(csv());
        let count = 0;
        
        for await (const row of stream) {
            // Parse numeric fields
            const aircraftData = {
                id: parseInt(row.id),
                manufacturer: row.manufacturer,
                model: row.model,
                year: parseInt(row.year),
                price: parseInt(row.price),
                ttaf: parseInt(row.ttaf),
                location: row.location,
                image_url: row.image_url,
                description: row.description,
                serial_number: row.serial_number,
                engine_model: row.engine_model,
                avionics_suite: row.avionics_suite,
                interior_desc: row.interior_desc
            };
            
            await Aircraft.create(aircraftData);
            count++;
        }
        
        console.log(`Aircraft data imported successfully. ${count} records added.`);
    } catch (err) {
        console.error('Error setting up aircraft database:', err);
    }
};

const setupCollections = async () => {
    try {
        console.log('Setting up MongoDB collections...');
        
        // Create indexes for better query performance
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await Aircraft.collection.createIndex({ id: 1 }, { unique: true });
        
        console.log('Collections and indexes created successfully.');
    } catch (err) {
        console.error('Error setting up collections:', err);
    }
};

const runAllSetups = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectToDatabase();
        console.log('Connected to MongoDB successfully.');
        
        await setupCollections();
        await setupAircraftDatabase();
        
        console.log('All database setups complete.');
        process.exit(0);
    } catch (err) {
        console.error('Setup failed:', err);
        process.exit(1);
    }
};

runAllSetups();