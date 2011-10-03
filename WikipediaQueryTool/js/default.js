

//Use a self-executing anonymous function (helps prevent polluting the global namespace).
(function () {

    'use strict';
    // Uncomment the following line to enable first chance exceptions.
    Debug.enableFirstChanceException(true);

    WinJS.Application.onmainwindowactivated = function (e) {
        if (e.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            $("#btnSearch").click(function (){ search(); });
            $(".wikipediaLink").click(function () {
                var thisUrl = $(this).find(':first-child').next().val();
                showWikipediaPage(thisUrl);
            });

            resultsContainer.addEventListener("iteminvoked", wikiLinkItemInvoked);
            //resultsContainer.removeEventListener("iteminvoked", wikiLinkItemInvoked);
            //process all the declarative data controls (like our binding template).
            WinJS.UI.processAll();
        }
    }

    //Initialize the application
    WinJS.Application.start();

    function search() {
        var term = encodeURI($("#txtSearchTerm").val());
        // Call the Wikipedia REST-ful service.
        searchStatus.innerText = "Searching Wikipedia...";
        //"xhr" wraps the old familiar XmlHttpRequest object.
        WinJS.xhr({ url: "http://en.wikipedia.org/w/api.php?action=opensearch&search=" + term + "&limit=15" })
        //Call immediately returns "promise" object
        .then(processResults, handleXhrError);
    }
   
    var wikiItems = [];

    function notConnected() {

        var template = WinJS.UI.getControl(document.getElementById("itemTemplate"));
        var hiddenInputHTML = "<span >Not Connected</span><input type='hidden' value='notConnected.html'/>";
        //Create name value pairs corresponding to the template div.
        var wikiEntry = {
            link: toStaticHTML(hiddenInputHTML)//toStaticHTML strips out dhtml elements,
        //otherwise you'll encounter JS access violations when you try to append.
        };

        $("#exactMatchLink").show();
        $("#exactMatchLink").html("Page Exists: " + hiddenInputHTML);
        var thisUrl = "test.html"

        template.render(wikiEntry).then(
                function (element) {
            resultsContainer.appendChild(element);
            //$("#resultsContainer").html("<div class='wikipediaLink'><span>Not Connected</span><input type='hidden' value='http://www.wikipedia.org/wiki/darth_vader' />");
            //$("#resultsContainer").html("<div class='wikipediaLink'>ResultsContainer : " + hiddenInputHTML + "</div>");
        });
        $("#resultsContainer").show();
    }

    function processResults(request) {
        $("#exactMatchLink").text("");
        var results = JSON.parse(request.response);
        if (results.length > 1) {
			wikiItems = [];
            var links = results[1];
            searchStatus.innerText = "results found: " + links.length;
            var template = WinJS.UI.getControl(document.getElementById("itemTemplate"));
            for (var counter = 0; counter < links.length; counter++) {
                var item = links[counter];
                var itemURLString = convertToWikipediaPath(item);
                var hiddenInputHTML = "<span >" + item + "</span><input type='hidden' value='http://www.wikipedia.org/wiki/" + itemURLString + "'/>";
                //Create name value pairs corresponding to the template div.
                var wikiEntry = {
                    link: toStaticHTML(hiddenInputHTML)//toStaticHTML strips out dhtml elements,
                        //otherwise you'll encounter JS access violations when you try to append.
                };

                //If the search term is matched exactly, the first result will be identical.
                if (counter == 0 && exactMatch(results)) {
                    $("#exactMatchLink").show();
                    $("#exactMatchLink").html("Page Exists: " + hiddenInputHTML);
                    //$("#test").html(toStaticHTML("<div onclick='showWasClicked()' class='wikipediaLink'>test: " + hiddenInputHTML + "</div>"));
                }
                else {
					//Use the binding template div to render an element.
                    //template.render(wikiEntry).then(
                    //Then append the resulting element it to our display div.
                    //function (element) {
                        //resultsContainer.appendChild(element);
						wikiItems.push(wikiEntry);      
					//}   );         
                }
                $("#resultsContainer").show();
            }
            resultsContainer.winControl.dataSource = wikiItems;
            return;
        }
        searchStatus.innerText = "no results found: ";
    }


    function processHtmlResults(request) {
        var pageHtml = request.response;
        //msWWA.execUnsafeLocalFunction(function (){ $("#wikiPageHTML").html(pageHtml); });
        msWWA.execUnsafeLocalFunction(function (){ wikiPageHTML.innerHTML = pageHtml; });
    }


    function showWikipediaPage(url) {
        //"xhr" wraps the old familiar XmlHttpRequest object.
        WinJS.xhr({ url: url })
        //Call immediately returns "promise" object
        .then(processHtmlResults, handleXhrError);
    }
    
    function wikiLinkItemInvoked(e) {
        //if (pageLayout === Windows.UI.ViewManagement.ApplicationLayoutState.snapped) {
        //var group = pageData.groups[e.detail.itemIndex];
        //WinJS.Navigation.navigate('/html/collectionPage.html', { group: group });
        //} else {
        //var item = pageData.items[e.detail.itemIndex];
        //switch (e.detail.itemIndex) {
        //    case 0:
         //   case 1:
        //        checkCert(e.detail.itemIndex, item);
        //        break;
        //    default:
        //        goError("Unknown scenario!!!");
		showWasClicked();
        //}

        //}
    }

	function showWasClicked(){
		searchStatus.innerText = "wikilinkiteminvoked";
	}

    function handleXhrError() {
        searchStatus.innerText = "error";
        //notConnected();
    }

    function convertToWikipediaPath(pageTitle) {
        return pageTitle.replace(" ", "_").replace("'", "%27");
    }

    function exactMatch(twoDArray) {
        return twoDArray[0].toUpperCase() == twoDArray[1][0].toUpperCase();
    }

})();