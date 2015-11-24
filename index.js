var _ = require('lodash'),
  google = require('googleapis'),
  OAuth2 = google.auth.OAuth2;

var requireParams = [
    'userId',
    'includeSpamTrash',
    'q'
];
var pickReqAttr = [
    'id',
    'threadId',
    'labelIds',
    'snippet',
    'historyId',
    'internalDate',
    'payload',
    'body',
    'parts'
];

module.exports = {
    checkAuthOptions: function (step, dexter) {
        _.map(requireParams, function (reqParam) {
            if(_.isUndefined(step.input(reqParam, undefined).first())) {

                this.fail('A ' + reqParam +' input variable is required for this module');
            }
        }, this);

        if(!dexter.environment('access_token')) {

            this.fail('A access_token environment variable is required for this module');
        }
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        this.checkAuthOptions(step, dexter);

        var oauth2Client = new OAuth2();
        oauth2Client.setCredentials({access_token: dexter.environment('access_token'), refresh_token: dexter.environment('refresh_token')});

        google.options({ auth: oauth2Client });
        google.gmail('v1').users.messages.list(_.merge({auth: oauth2Client}, step.inputs()), function (err, message) {

            err? this.fail(err) : this.complete(_.map(message.messages, function (data) {

                return _.pick(data, pickReqAttr);
            }));
        }.bind(this));

    }
};
