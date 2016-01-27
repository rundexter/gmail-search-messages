var _ = require('lodash'),
    util = require('./util.js'),
    google = require('googleapis'),
    service = google.gmail('v1');

var pickInputs = {
        'userId': { key: 'userId', validate: { req: true } },
        'includeSpamTrash': { key: 'includeSpamTrash', type: 'boolean' },
        'q': { key: 'q' },
        'labelIds': 'labelIds',
        'maxResults': { key: 'maxResults', type: 'integer' },
        'pageToken': 'pageToken'
    },
    pickOutputs = {
        '-': {
            key: 'messages', fields: {
                id: 'id', 
                threadId: 'threadId'
            }
        }
        //'id': { key: 'messages', fields: ['id'] },
        //'threadId': { key: 'messages', fields: ['threadId'] }
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var OAuth2 = google.auth.OAuth2,
            oauth2Client = new OAuth2(),
            credentials = dexter.provider('google').credentials();
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (validateErrors)
            return this.fail(validateErrors);

        // set credential
        oauth2Client.setCredentials({
            access_token: _.get(credentials, 'access_token')
        });
        google.options({ auth: oauth2Client });
        service.users.messages.list(inputs, function (error, messages) {

            error? this.fail(error) : this.complete(util.pickOutputs(messages, pickOutputs));
        }.bind(this));

    }
};
