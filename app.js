var express = require('express');
var aws = require('aws-sdk');
const { Client } = require('pg');
const { createHash } = require('node:crypto');
var appSettings = require('./Appsettings.json');


var queueUrl = "http://localhost:4566/000000000000/login-queue";

var app = express();

// Use Images icon
app.use(express.static(__dirname + '/public'));

// Configuring Aws config with default details
aws.config.loadFromPath(__dirname + '/config.json');

//using ejs
app.set('view engine', 'ejs');

// Initializing SQS.
var sqs = new aws.SQS();


//Api Calls
app.get('/', async function (req, res) {
    var data = await ReadData();
    res.render('pages/index', {userData: data});
});


app.get('/userData', async function (req, res) {
    var data = await ReadUserData();
    res.render('pages/userIndex', { userData: data, liveUsers: 0, multipleDeviceUser:0 });
});


//Set express app properties
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'),async function () {
    console.log('Express AWS-SQS-PSql server up and running' + server.address().port);
    //Calling Aws sqs queue every 1min
    //setInterval(receiveMessages, 1000);
});


async function receiveMessages() {
    var params = {
        QueueUrl: queueUrl,
        VisibilityTimeout: 60
    };

    console.log("Checking For Messages");
    sqs.receiveMessage(params, async function (err, data) {
        if (err) {
            console.log("No message received");
        }
        else {
            
            data.Messages.forEach(async (msg) => {
                var record = JSON.parse(msg.Body);
                if (record.user_id && record.ip && record.device_id) { 
                    record.ip = sha256(record.ip);
                    record.device_id = sha256(record.device_id);
                    console.log("ip:: " + record.ip);
                    console.log("device_id:: " + record.device_id);
                    await InsertData(record);
                }
            });
            
        }
    });
} 


async function connectToPostgres() {
    try {
        const client = new Client({
            host: appSettings.host,
            port: appSettings.port,
            user: appSettings.user,
            password: appSettings.password,
            database: appSettings.database,
        });
        await client.connect();
        return client;
    }
    catch (err) {
        console.log("connectToPostgres failed");
        console.log(err);
        throw err;
    }
}

async function ReadData() {
    try {
        const client = await connectToPostgres();
        const entries = await client.query('SELECT * FROM user_logins;');
        await client.end();
        return entries.rowCount != 0 ? entries.rows : [];
    } catch (err) {
        console.log("ReadData failed");
        console.log(JSON.stringify(err));
        return [];
    }
}

async function ReadUserData() {
    try {
        const client = await connectToPostgres();
        const entries = await client.query('SELECT user_id,count(Distinct masked_ip) as number_of_unique_ips,count(Distinct masked_Device_id) as number_of_unique_devices, MAX(create_date) as latest_login_date FROM user_logins GROUP BY user_id;');
        await client.end();
        return entries.rowCount != 0 ? entries.rows : [];
    }
    catch (err) {
        console.log(JSON.stringify(err));
        return [];
    }
}

async function InsertData(data) {
    try {
        const client = await connectToPostgres();
        let insertRow = await client.query('INSERT INTO  user_logins (user_id, device_type, masked_ip, masked_device_id, locale, app_version, create_date) VALUES($1,$2,$3,$4,$5,$6,$7);',
            [data.user_id, data.device_type, data.ip, data.device_id, data.locale, parseInt(data.app_version), new Date()]);
        await client.end();
    }
    catch (err) {
        console.log("InsertData failed");
        console.log(JSON.stringify(err));
    }
}


function sha256(content) {
    return createHash('sha256').update(content).digest('hex');
}