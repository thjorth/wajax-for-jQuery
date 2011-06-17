/*
wajax for jQuery
For instructions go to the project home at https://github.com/thjorth/wajax-for-jQuery
Created by Thomas Hjorth courtesy of Valtech Denmark (http://www.valtech.dk)
Contact: thomas.hjorth@valtech.dk or thjorth74@gmail.com
github username: thjorth
Version: 1.0
Updated: June 17, 2011
License: MIT

Copyright (C) 2011 by Thomas Hjorth

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*/
jQuery.extend({

    wajax: function () {
        var self = arguments.callee;
        if (!self.methods) {
            self.methods = {
                go: function (callback) {
                    var job = jQuery.wajax.methods.getOpenJob();
                    if (job != null) {
                        job.goAhead = true;
                        job.open = false;
                        job.allCompleteCallback = callback;
                        jQuery.wajax.methods.checkReadyStates(job);
                    }
                },
                checkReadyStates: function (job) {
                    if (!job) return;

                    var pending = job.pendingRequests;

                    if (!job.goAhead)
                        return;
                    // go was called so let's check to see if all calls have completed
                    for (var i = 0, ix = pending.length; i < ix; i++) {
                        if (!pending[i].completed)
                            return;
                    }

                    var error = false;
                    // if we have gotten so far it's time to call all the individual callbacks and finally the allCompleteCallback
                    for (var i = 0, ix = pending.length; i < ix; i++) {
                        var p = pending[i];
                        if (p.errorHappened) {
                            // call the error handler
                            p.error.call(p.context, p.xmlHttpRequest, p.textStatus, p.errorThrown);
                            error = true;
                        } else {
                            // call the success handler
                            p.success.call(p.context, p.data, p.textStatus, p.xmlHttpRequest);
                        }
                    }

                    // now call the allCompleteCallback if supplied to the go function and give it a success boolean as parameter describing whether all request succeeded or not
                    if (job.allCompleteCallback && typeof (job.allCompleteCallback) == "function") {
                        job.allCompleteCallback(!error);
                    }

                    // now clean up everything
                    var jobs = jQuery.wajax.jobs;
                    var liveJobs = [];
                    for (var i = 0, ix = jobs.length; i < ix; i++) {
                        if (jobs[i].open) {
                            liveJobs.push(jobs[i]);
                        }
                    }
                    jQuery.wajax.jobs = liveJobs;
                    //job.pendingRequests = [];
                },
                getOpenJob: function () {
                    var job = null;
                    // now see if there's already a job that's open. If there is then use that - otherwise create a new one
                    for (var i = 0, ix = jQuery.wajax.jobs.length; i < ix; i++) {
                        if (jQuery.wajax.jobs[i].open) {
                            job = jQuery.wajax.jobs[i];
                            break;
                        }
                    }
                    return job;
                }
            }
        }

        // make sure that there is a job queue
        if (!self.jobs) {
            self.jobs = [];
        }
        // get the currently open job (if any)
        var job = self.methods.getOpenJob();
        // if none were available create a new one.
        if (job == null) {
            job = {
                open: true,
                pendingRequests: [],
                goAhead: false,
                allCompleteCallback: null
            }
            self.jobs.push(job);
        }

        // first see if it's one of the contained methods that needs to be called
        var args = Array.prototype.slice.call(arguments);
        if (args.length > 0 && typeof (args[0]) == "string" && self.methods[args[0]]) {
            return self.methods[args[0]].apply(this, Array.prototype.slice.call(args, 1));
        }

        // if not then we'll invoke the normal jQuery ajax functionality but replace the callbacks with our own
        if (typeof (args[0]) != "object") {
            // except if an object for settings wasn't supplied
            return;
        }

        // now create an object for holding the original callbacks and the status of the request
        var settings = args[0];
        var state = {
            completed: false,
            errorHappened: false,
            errorThrown: "",
            success: settings.success,
            error: settings.error,
            data: null,
            textStatus: null,
            xmlHttpRequest: null,
            context: null,
            owningJob: job
        }
        // store this object for later
        job.pendingRequests.push(state);

        // now modify the settings object and replace the success and error handlers to use our own
        settings.success = function (data, textStatus, xmlHttpRequest) {
            // use the state closure to update the saved info about the pending request
            var job = state.owningJob;
            state.completed = true;
            state.data = data;
            state.textStatus = textStatus;
            state.xmlHttpRequest = xmlHttpRequest;
            state.context = this;
            // now call the checkReadyStates function
            jQuery.wajax.methods.checkReadyStates(job);
        }
        settings.error = function (xmlHttpRequest, textStatus, errorThrown) {
            // use the state closure to update the saved info about the pending request
            var job = state.owningJob;
            state.completed = true;
            state.errorHappened = true;
            state.errorThrown = errorThrown;
            state.textStatus = textStatus;
            state.xmlHttpRequest = xmlHttpRequest;
            state.context = this;
            // now call the checkReadyStates function
            jQuery.wajax.methods.checkReadyStates(job);
        }

        $.ajax.call(this, settings);
    }

});