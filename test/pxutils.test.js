'use strict';

const should = require('should');
const rewire = require("rewire");
const pxutil = require('../lib/pxutil');
const PxClient = rewire('../lib/pxclient');

describe('PX Utils - pxutils.js', () => {
    let pxconfig;
    let params;

    beforeEach(() => {
        params = {
            pxAppId: 'PX_APP_ID',
            cookieSecretKey: 'PX_COOKIE_SECRET',
            authToken: 'PX_AUTH_TOKEN',
            sendPageActivities: true,
            blockingScore: 60,
            debugMode: true,
            ipHeader: 'x-px-true-ip',
            maxBufferLength: 1
        };

        pxconfig = require('../lib/pxconfig');
        pxconfig.init(params, new PxClient());
    });

    it('should generate headers array from headers object', (done) => {
        const formattedHeaders = pxutil.formatHeaders({K: 'v'});
        (Object.prototype.toString.call(formattedHeaders)).should.be.exactly('[object Array]');
        formattedHeaders[0]['name'].should.be.exactly('K');
        formattedHeaders[0]['value'].should.be.exactly('v');
        return done();
    });
});