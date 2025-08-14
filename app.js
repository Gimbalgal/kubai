
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/signup.html');
});

app.post('/', function(req, res) {
    let firstName = req.body.fName;
    let lastName = req.body.lName;
    let email = req.body.email;

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
    const url = `https://us10.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}`;
    const options = {
        method: "POST",
        auth: `victoria1:${process.env.MAILCHIMP_API_KEY}`
    };

    const mailchimpRequest = https.request(url, options, function(response) {
        response.on('data', function(data) {
            if (response.statusCode === 200) {
                res.sendFile(__dirname + '/success.html');
            } else {
                res.sendFile(__dirname + '/failure.html');
            }
            console.log(JSON.parse(data));
        });
    });

    mailchimpRequest.write(jsonData);
    mailchimpRequest.end();
});

app.post('/failure', function(req, res){
    res.redirect('/')
})

const port = process.env.PORT || 5000;
app.listen(5000, function() {
    console.log('Server is running on port 5000');
});