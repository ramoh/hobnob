import superagent from 'superagent';
import {When, Then} from 'cucumber';
import assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();

When(/^the client creates a POST request to \/users$/, function () {
    this.request = superagent('POST', process.env.SERVER_HOSTNAME + ':' + process.env.SERVER_PORT + '/users');
});

When(/^attaches a generic empty payload$/, function () {
    this.request.set('content-type', 'application/json');

});

When(/^sends the request$/, function (callback) {
    this.request

        .then((response) => {
            this.response = response.res;
            callback();
        })
        .catch((error) => {
            this.response = error.response;
            callback();
        });
});

Then(/^our API should respond with a 400 HTTP status code$/, function () {
    assert.strictEqual(this.response.statusCode, 400);
});
Then(/^our API should respond with 415 HTTP status code$/, function () {
    assert.strictEqual(this.response.statusCode, 415);
});

Then(/^the payload of the response should be a JSON object$/, function () {
    // Check Content-Type header
    const contentType = this.response.headers['Content-Type'] || this.response.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response not of Content-Type application/json');
    }

    // Check it is valid JSON
    try {
        this.responsePayload = JSON.parse(this.response.text);
    } catch (e) {
        throw new Error('Response not a valid JSON object');
    }
});


When(/^attaches a generic non-JSON payload$/, function () {
    this.request.send('<?xml version="1.0" encoding="UTF-8" ?><email>dan@danyll.com</email>');
    this.request.set('Content-Type', 'text/xml');
});

When(/^attaches a generic malformed payload$/, function () {
    this.request.send('{"email": "dan@moh.com", name: }');
    this.request.set('Content-Type', 'application/json');
});
When(/^attaches an? (.+) payload which is missing the ([a-zA-Z0-9, ]+) fields?$/, function (payloadType, missingFields) {
    const payload = {
        email: 'e@ma.il',
        password: 'password',
    };
    const fieldsToDelete = missingFields.split(',').map(s => s.trim()).filter(s => s !== '');
    fieldsToDelete.forEach(field => delete payload[field]);
    this.request
        .send(JSON.stringify(payload))
        .set('Content-Type', 'application/json');
});

//
// Then(/^contains a message property which says "Payload should be in JSON format"$/, function () {
//     assert.strictEqual(this.responsePayload.message, 'Payload should be in JSON format');
// });
// Then(/^contains a message property which says "Content type header should always be JSON"$/, function () {
//     assert.strictEqual(this.responsePayload.message, 'The "Content-Type" header must always be "application/json"');
// });
// Then(/^contains a message property which says "Payload should not be empty"$/, function () {
//     assert.strictEqual(this.responsePayload.message, 'Payload should not be empty');
// });


Then(/^contains a message property which says "([^"]*)"$/, function (arg1) {
    assert.strictEqual(this.responsePayload.message, arg1);
});

