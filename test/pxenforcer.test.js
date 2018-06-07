'use strict';

const should = require('should');
const sinon = require('sinon');
const rewire = require("rewire");
const request = require('../lib/request');
const pxhttpc = require('../lib/pxhttpc');
const PxClient = rewire('../lib/pxclient');
const PxEnforcer = require('../lib/pxenforcer');

describe('PX Enforcer - pxenforcer.js', () => {
    let params, enforcer, req, stub;

    beforeEach(() => {
        params = {
            pxAppId: 'PX_APP_ID',
            cookieSecretKey: 'kabum',
            authToken: 'PX_AUTH_TOKEN',
            sendPageActivities: true,
            blockingScore: 60,
            debugMode: true,
            ipHeader: 'x-px-true-ip',
            maxBufferLength: 1,
            enableModule: true,
        };

        req = {};
        req.headers = {};
        req.cookies = {};

        req.originalUrl = "/";
        req.path = req.originalUrl.substring(req.originalUrl.lastIndexOf('/'));
        req.protocol = 'http';
        req.ip = '1.2.3.4';
        req.hostname = 'example.com';
        req.get = (key) => {
            return req.headers[key] || '';
        };
    });

    afterEach(() => {
        stub.restore();
    });

    it('enforces a call in a disabled module', (done) => {
        stub = sinon.stub(pxhttpc, 'callServer').callsFake((data, headers, uri, callType, ignore, callback) => {
            return callback ? callback(null, data) : '';
        });
        params.enableModule = false;
        enforcer = new PxEnforcer(params, new PxClient());
        enforcer.enforce(req, null, (response) => {

            (response === undefined).should.equal(true);
            done();
        });
    });

    it('enforces a call in an enabled module', (done) => {
        stub = sinon.stub(pxhttpc, 'callServer').callsFake((data, headers, uri, callType, ignore, callback) => {
            return callback ? callback(null, data) : '';
        });
        enforcer = new PxEnforcer(params, new PxClient());
        enforcer.enforce(req, null, (response) => {

            (response === undefined).should.equal(true);
            done();
        });
    });

    it('uses first party to get client', (done) => {
        stub = sinon.stub(pxhttpc, 'callServer').callsFake((data, headers, uri, callType, ignore, callback) => {
            return callback ? callback(null, data) : '';
        });
        let reqStub = sinon.stub(request, 'get').callsFake((data, callback) => {
            callback(null, {headers: {'x-px-johnny': '1'}}, "hello buddy");
        });
        req.originalUrl = "/_APP_ID/init.js";
        enforcer = new PxEnforcer(params, new PxClient());
        enforcer.enforce(req, null, (error, response) => {
            (response === undefined).should.equal(false);
            response.body.should.equal("hello buddy");
            response.headers['x-px-johnny'].should.equal('1');
            reqStub.restore();
            done();
        });
    });

    it('uses first party for xhr post request', (done) => {
        stub = sinon.stub(pxhttpc, 'callServer').callsFake((data, headers, uri, callType, ignore, callback) => {
            return callback ? callback(null, data) : '';
        });
        let reqStub = sinon.stub(request, 'post').callsFake((data, callback) => {
            callback(null, {headers: {'x-px-johnny': '1'}}, "hello buddy");
        });
        req.originalUrl = "/_APP_ID/xhr/something";
        req.method = "POST";
        req.body = "test";
        enforcer = new PxEnforcer(params, new PxClient());
        enforcer.enforce(req, null, (error, response) => {
            (response === undefined).should.equal(false);
            response.body.should.equal("hello buddy");
            response.headers['x-px-johnny'].should.equal('1');
            reqStub.restore();
            done();
        });
    });

    it('uses first party for xhr get request', (done) => {
        stub = sinon.stub(pxhttpc, 'callServer').callsFake((data, headers, uri, callType, ignore, callback) => {
            return callback ? callback(null, data) : '';
        });
        let reqStub = sinon.stub(request, 'get').callsFake((data, callback) => {
            callback(null, {headers: {'x-px-johnny': '1'}}, "hello buddy");
        });
        req.originalUrl = "/_APP_ID/xhr/something";
        req.method = "GET";
        req.body = "test";
        enforcer = new PxEnforcer(params, new PxClient());
        enforcer.enforce(req, null, (error, response) => {
            (response === undefined).should.equal(false);
            response.body.should.equal("hello buddy");
            response.headers['x-px-johnny'].should.equal('1');
            reqStub.restore();
            done();
        });
    });

    it('uses first party with pxvid cookie', (done) => {
        stub = sinon.stub(pxhttpc, 'callServer').callsFake((data, headers, uri, callType, ignore, callback) => {
            return callback ? callback(null, data) : '';
        });
        let reqStub = sinon.stub(request, 'post').callsFake((data, callback) => {
            callback(null, {headers: {'x-px-johnny': '1'}}, "hello buddy");
        });
        req.originalUrl = "/_APP_ID/xhr/something";
        req.method = "POST";
        req.cookies['_pxvid'] = "abab-123";
        req.body = "test";
        enforcer = new PxEnforcer(params, new PxClient());
        enforcer.enforce(req, null, (error, response) => {
            (response === undefined).should.equal(false);
            response.body.should.equal("hello buddy");
            response.headers['x-px-johnny'].should.equal('1');
            reqStub.restore();
            done();
        });
    });

    it('uses first party for xhr and passed trough bodyParser', (done) => {
        stub = sinon.stub(pxhttpc, 'callServer').callsFake((data, headers, uri, callType, ignore, callback) => {
            return callback ? callback(null, data) : '';
        });
        let reqStub = sinon.stub(request, 'post').callsFake((data, callback) => {
            callback(null, {headers: {'x-px-johnny': '1'}}, "hello buddy");
        });
        req.originalUrl = "/_APP_ID/xhr/something";
        req.method = "POST";
        req.body = {key: 'value', anotherKey: 'anotherValue'};
        enforcer = new PxEnforcer(params, new PxClient());
        enforcer.enforce(req, null, (error, response) => {
            (response === undefined).should.equal(false);
            response.body.should.equal("hello buddy");
            response.headers['x-px-johnny'].should.equal('1');
            reqStub.restore();
            done();
        });
    });

    it('uses upper case for xhr', (done) => {
        stub = sinon.stub(pxhttpc, 'callServer').callsFake((data, headers, uri, callType, ignore, callback) => {
            return callback ? callback(null, data) : '';
        });
        let reqStub = sinon.stub(request, 'post').callsFake((data, callback) => {
            callback(null, {headers: {'x-px-johnny': '1'}}, "hello buddy");
        });
        req.originalUrl = "/_APP_ID/XHR/something";
        req.method = "POST";
        req.body = {key: 'value', anotherKey: 'anotherValue'};
        enforcer = new PxEnforcer(params, new PxClient());
        enforcer.enforce(req, null, (error, response) => {
            (response === undefined).should.equal(false);
            response.body.should.equal("hello buddy");
            response.headers['x-px-johnny'].should.equal('1');
            reqStub.restore();
            done();
        });
    });

    it('should not use first party paths if originated from mobile', (done) => {
        stub = sinon.stub(pxhttpc, 'callServer').callsFake((data, headers, uri, callType, ignore, callback) => {
            data.score = 100;
            data.action = 'b';
            return callback ? callback(null, data) : '';
        });
        const curParams = Object.assign({
            moduleMode: 1,
            firstPartyEnabled: true
        }, params);
        let reqStub = sinon.stub(request, 'post').callsFake((data, callback) => {
            callback(null, {headers: {'x-px-johnny': '1'}}, "hello buddy");
        });
        req.headers = {'x-px-authorization': '3:some-fake-cookie'};
        req.method = "POST";
        req.body = {key: 'value', anotherKey: 'anotherValue'};
        enforcer = new PxEnforcer(curParams, new PxClient());
        enforcer.enforce(req, null, (error, response) => {
            (response === undefined).should.equal(false);
            response.body.action.should.equal("b");
            reqStub.restore();
            done();
        });
    });

});


