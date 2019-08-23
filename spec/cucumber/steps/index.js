import superagent from 'superagent';
import {When, Then} from 'cucumber';
import assert from 'assert';
import dotenv from 'dotenv';
import {getValidPayload, convertStringToArray} from './utils';
import elasticsearch from 'elasticsearch';

dotenv.config();
const client = new elasticsearch.Client({
    host: `${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
});



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
Then(/^our API should respond with a ([1-5]\d{2}) HTTP status code$/, function (statusCode) {
    assert.equal(this.response.statusCode, statusCode);
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


Then(/^contains a message property which says "([^"]*)"$/, function (arg1) {
    assert.strictEqual(this.responsePayload.message, arg1);
});


When(/^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are)(\s+not)? a ([a-zA-Z]+)$/, function (payloadType, fields, invert, type) {
    const payload = {
        email: 'e@ma.il',
        password: 'password',
    };
    const typeKey = type.toLowerCase();
    const invertKey = invert ? 'not' : 'is';
    const sampleValues = {
        string: {
            is: 'string',
            not: 10,
        },
    };
    const fieldsToModify = fields.split(',').map(s => s.trim()).filter(s => s !== '');
    fieldsToModify.forEach((field) => {
        payload[field] = sampleValues[typeKey][invertKey];
    });
    this.request
        .send(JSON.stringify(payload))
        .set('Content-Type', 'application/json');
});

When(/^attaches an? (.+) payload where the ([a-zA-Z0-9, ]+) fields? (?:is|are) exactly (.+)$/, function (payloadType, fields, value) {
    this.requestPayload = getValidPayload(payloadType);
    const fieldsToModify = convertStringToArray(fields);

    fieldsToModify.forEach((field) => {
        this.requestPayload[field] = value;
    });
    this.request
        .send(JSON.stringify(this.requestPayload))
        .set('Content-Type', 'application/json');
});

When(/^attaches a valid (.+) payload$/, function (payloadType) {
    this.requestPayload = getValidPayload(payloadType);
    this.request
        .send(JSON.stringify(this.requestPayload))
        .set('Content-Type', 'application/json');
});

Then(/^the payload of the response should be an? ([a-zA-Z0-9, ]+)$/, function (payloadType) {
    const contentType = this.response.headers['Content-Type'] || this.response.headers['content-type'];
    if (payloadType === 'JSON object') {
        // Check Content-Type header
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response not of Content-Type application/json');
        }

        // Check it is valid JSON
        try {
            this.responsePayload = JSON.parse(this.response.text);
        } catch (e) {
            throw new Error('Response not a valid JSON object');
        }
    } else if (payloadType === 'string') {
        // Check Content-Type header
        if (!contentType || !contentType.includes('text/plain')) {
            throw new Error('Response not of Content-Type text/plain');
        }

        // Check it is a string
        this.responsePayload = this.response.text;

        if (typeof this.responsePayload !== 'string') {
            throw new Error('Response not a string');
        }
    }
});

Then(/^the payload object should be added to the database, grouped under the "([a-zA-Z]+)" type$/, function (type, callback) {
    this.type = type;
    client.get({
        index: process.env.ELASTICSEARCH_INDEX,
        type: type,
        id: this.responsePayload,
    }).then((result) => {
        assert.deepEqual(result._source, this.requestPayload);
        callback();
    }).catch(callback);

});
Then(/^newly\-created user should be deleted$/, function (callback) {
    client.delete({
        index: process.env.ELASTICSEARCH_INDEX,
        type: this.type,
        id: this.responsePayload,
    }).then((res) => {
        assert.equal(res.result, 'deleted');
        callback();
    }).catch(callback);
});
