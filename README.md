# wajax for jQuery

Wajax is an extension to jQuery's ajax implementation. The extension relies completely on jQuery's underlying ajax implementation. The difference is that wajax makes it a lot easier to handle pages where you rely on several ajax requests to complete before doing stuff with the data you receive.

One example could be if you need to load data using one ajax request and fetching an html template using another request. In this case you have to make sure that both requests have completed before building your UI. Off course, this could be accomplished in other ways than using wajax but wajax does provide an easy-to-understand solution for this particular problem.

The task above could also be solved by using the jQuery built-in <em>ajaxStop</em> event. However, wajax offers a few more benefits over this:

* You can launch any number of ajax requests and no matter in which order they complete the callbacks will be executed <em>in the same order the requests were queued</em>
* You can have an additional callback invoked once each request's own callbacks have been executed (this is what you can accomplish using the <em>ajaxStop</em> event).
* You can group your requests and make sure that all requests in a group is complete before processing their callbacks. 
* You can have any number of request groups executing simultaneously. Example: You are dynamically initializing two widgets on a page. The first one requires data from two ajax requests and an html template from a third request. The second widget requires data from one ajax request and an html template loaded through another ajax request. Using wajax you can group these requests into two groups so *even if one of the data requests for the first widget takes a long time to complete the second widget is still initialized as soon as it's two requests have completed*.

Yes, read that last bullet again :-)

## How does it work?

In short you can use $.wajax anywhere you use the $.ajax method. The $.wajax takes the same parameters as the built-in $.ajax method (almost at least. Currently there is no support for jsonp). In fact it simply forwards everything to the built-in $.ajax method. Off course it also does other stuff as it adds all the glue and bookkeeping that goes into grouping requests and making sure callbacks are processed in the order the wajax requests have been queued.

Making a wajax request can be as simple as this:

	$.wajax({
	  url: "data/chapter1.html",
	  success: function (data) { console.log( data ); }
	});

<a href="https://gist.github.com/1031267">Example 1 Gist</a>

Doing the above will launch an ajax request for the <em>data/chapter1.html</em> file. The ajax will be executed immediately and will complete asynchronously as soon as the server can respond. However, the anonymous callback function is not executed. Yet.

To make sure the callback is invoked you will have to do this as well:

	$.wajax("go");

<a href="https://gist.github.com/1031273">Example 2 Gist</a>

When you call <em>$.wajax("go")</em> you tell wajax that you now are ready for your callbacks to be invoked. At the same time it groups all the wajax requests that have been made since the last <em>$.wajax("go")</em> command. Even though you have told wajax that you're ready to process the callbacks you can still be certain that your callbacks will *not* be invoked until all requests in the group has completed. You can also rely on your callbacks to be executed in the same order you made the requests - not in the order the requests complete.

If you don't care about the order of execution of the callbacks but just want to make sure that all requests have completed before proceeding you can do it like this:

	$.wajax("go", function() {
	  console.log("All grouped ajax requests have completed!");
	});

<a href="https://gist.github.com/1031286">Example 3 Gist</a>

## What makes it better than jQuery's ajaxStop event?

Suppose you have a page with two widgets that are created dynamically after page load. The first one relies on the result of two ajax requests for data and one request for a template. The other widget relies on one ajax request for data and one request for a template. Using wajax you could accomplish this task like this:

	/*
	* Widget 1
	*/
	// create two wajax request for the data for widget 1
	$.wajax( { url: "data/data-for-widget-1.json", success: function (data) { /* Store data */ } } );
	$.wajax( { url: "data/more-data-for-widget-1.json", success: function (data) { /* Store more data */ } } );

	// create a wajax request for the template
	$.wajax( { url: "templates/widget-1.tmpl", success: function (data) { /* Store the template */ } } );

	// call $.wajax("go") to instruct wajax to group the wajax request we just made and to tell it
	// we're ready for the callbacks to be invoked.
	$.wajax("go", function() { /* Build widget 1 using the template and the result from the data requests */ });

	/*
	* Widget 2
	*/
	// create a wajax request for the data for widget 2
	$.wajax( { url: "data/data-for-widget-2.json", success: function (data) { /* Store data */ } } );

	// create a wajax request for the template
	$.wajax( { url: "templates/widget-2.tmpl", success: function (data) { /* Store the template */ } } );

	// call $.wajax("go") to instruct wajax to group the wajax request we just made and to tell it
	// we're ready for the callbacks to be invoked.
	$.wajax("go", function() { /* Build widget 2 using the template and the result from the data request */ });

<a href="https://gist.github.com/1031322">Example 4 Gist</a>

The benefit of using the above method is that even if the request for "data/data-for-widget-1.json" turns out to be really slow widget 2 will still be built as soon as the requests for the widget 2 data and the widget 2 template have completed.

## Credits

Created by Thomas Hjorth Courtesy of Valtech Denmark.

## License: MIT

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



