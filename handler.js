'use strict';
let fs = require('fs');
let AWS = require('aws-sdk');

let rekognition = new AWS.Rekognition();
let s3 = new AWS.S3();


const image_bucket_name = "secrethotdogbucket";

module.exports.home = (event, context, callback) => {

    fs.readFile(__dirname + '/index.html', 'utf8', function (err,data) {
        if (err) {
            console.log(err);
            callback(null, {
                statusCode: 500, body: 'It broke'
            })
        }

        callback(null, {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*'
            },
            body: data
        })
    });


};

module.exports.requestUploadURL = (event, context, callback) => {
    let params = JSON.parse(event.body);

    let uploadURL = s3.getSignedUrl('putObject', {
        Bucket: image_bucket_name,
        Key:  params.name,
        ContentType: params.type,
        ACL: 'public-read',
    });

    callback(null, {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ uploadURL: uploadURL }),
    })
};

module.exports.detectHotDog = (event, context, callback) => {

    console.log(event);


    let rekogParams = {
        Image: {
            S3Object: {
                Bucket: image_bucket_name,
                Name: filename
            }
        }
    };
    rekognition.detectLabels(rekogParams, function(err, data) {

        const response = {
            statusCode: 200,
            body: null,
        };

        if (err) {
            response.statusCode = 500;
        } else {
            console.log(data);
            response.body = JSON.stringify(data);
        }
        callback(null, response);

    });

};