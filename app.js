require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/signup.html');
});

app.post('/', function (req, res) {
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    // Get data center from API key automatically
    const apiKey = process.env.MAILCHIMP_API_KEY;
    if (!apiKey) {
        console.error("Missing MAILCHIMP_API_KEY environment variable");
        return res.sendFile(__dirname + '/failure.html');
    }

    const dc = apiKey.split('-')[1]; // e.g., 'us10', 'us21'
    const listId = process.env.MAILCHIMP_LIST_ID;

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}`;

    const options = {
        method: "POST",
        auth: `anystring:${apiKey}`
    };

    const mailchimpRequest = https.request(url, options, function (response) {
        let responseData = '';
        response.on('data', function (chunk) {
            responseData += chunk;
        });

        response.on('end', function () {
            if (response.statusCode === 200) {
                res.sendFile(__dirname + '/success.html');
            } else {
                console.error("Mailchimp error:", responseData);
                res.sendFile(__dirname + '/failure.html');
            }
        });
    });

    mailchimpRequest.on('error', (err) => {
        console.error("Request error:", err);
        res.sendFile(__dirname + '/failure.html');
    });

    mailchimpRequest.write(jsonData);
    mailchimpRequest.end();
});

app.post('/failure', function (req, res) {
    res.redirect('/');
});

const port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});
