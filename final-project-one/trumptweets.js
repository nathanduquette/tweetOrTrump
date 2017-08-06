$(document).on("ready", function(){
    var type = "";
    var tweets = [];
    var randomTrump;
    var fakeNames = ["Barack Obama", "Hillary Clinton", "Jeb Bush", "James Comey"];
    var subject = ["taxes" , "wall", "hillary", "clinton", "mexico", "mexican", "mexico,", "mexico!", "mexico.", "hispanics", "obama", "obama's", "barack", "women", "russia", "russian", "nuclear", "nukes" , "nuke", "comey", "fbi", "lied", "putin", "[putin]", "money", "ted cruz", "ted", "cruz", "jeb", "bush"];
    var keyMappings = {
        "obama's": "obama",
        "barack": "obama",
        "russian": "russia",
        "nuclear": "nukes",
        "comey": "fbi",
        "[putin]": "putin",
        "mexico,": "mexico",
        "mexico!": "mexico",
        "mexico.": "mexico",
        "hispanics": "mexico",
        "[obama" : "obama",
        "ted": "ted+cruz",
        "cruz": "ted+cruz",
        "jeb": "jeb+bush",
        "bush": "jeb+bush"
    };
    var hashtagMap = {
        "#CrookedHillary": "Crooked Hillary",
        "#DrainTheSwamp": "",
        "#TrumpPence16": "Trump Pence 16!",
        "#BigLeagueTruth": "",
        "#ObamaCare": "Obamacare"
    };

    var numCorrect = 0;
    var numWrong = 0;
    var percent = 0;
    var round = 0;
    var LAST_ROUND = 15;
    var time;
    var finishedLoading = false;
    var wrongGifsDir = "assets/images";
    
    var quotesUsed = [];
    var tweetsUsed = [];
    var gifsUsed = [];
    var lastWrongGifId = 99;
    var lastGifId = '';

    var searchTerm = ["Hillary", "Mexico", "Obama", "Money", "Immigrants"];

    for (var i = 0; i < searchTerm.length; i++) {
        $.ajax({
                url: "https://matchilling-tronald-dump-v1.p.mashape.com/search/quote?query=" + searchTerm[i] + "&page=The+page+number&size=25'",

                // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
                type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
                data: {}, // Additional parameters here
                dataType: 'json',
                success: function(data) {
                },
                error: function(err) { console.log("error", err); },
                beforeSend: function(xhr) {
                xhr.setRequestHeader("X-Mashape-Authorization", "Y3uBFDenHumshrBSTtJm0yC7jf9Sp1Ri5m2jsnCHgHAwZg3rgv"); // Enter here your Mashape key
                }
        })
        .done(function(data) {
            for (var  i = 0; i < data.count; i++ ) {
                var tweet = data._embedded.quotes[i].value;
                var filter = filterHttp(tweet);
                if (filter === true){
                    tweets.push(tweet);
                }

                function filterHttp(tweet) {
                    var str = tweet;
                    var h = str.indexOf("http");
                    if (h < 0) {    
                        return true;
                    } else {
                        return false;
                    }
                };
            }
            finishedLoading = true;
        });    
    }

    $("#quoteHere").text("Click Start Game To Begin!");

    var config = {
        apiKey: "AIzaSyD7S3pcQoFQN0hkiyCh5r-K9iJaeP4smBk",
        authDomain: "groupproject1-70b78.firebaseapp.com",
        databaseURL: "https://groupproject1-70b78.firebaseio.com",
        projectId: "groupproject1-70b78",
        storageBucket: "groupproject1-70b78.appspot.com",
        messagingSenderId: "449845405492"
      };
      firebase.initializeApp(config);

    var database = firebase.database();
    var playersRef = database.ref("/players"); 


    var user = {
        firstName: "",
        lastName: "",
        password: "",
        username: "",
        email: "",
        score: 0.00
    };
    var userNameValid;

    var playerInfoForFirebase = null;

    //timer stuff
    var intervalId;

    var countdown = {
         
        time: 15,

        reset: function() {

            countdown.time = 15;

            $("#time-left").html("00:15");
            $("#time-left").css({"color": "black", "font-weight": "none"});
            $("#correctAnswer").empty();

            whiteBackground();
        },

        start: function() {

            intervalId = setInterval(countdown.count, 1000);

        },

        stop: function() {

            clearInterval(intervalId);
        },

        count: function() {

            countdown.time--;

            if (countdown.time <= 3) {
                $("#time-left").css({"color": "red", "font-weight": "bold"});
            };

            if (countdown.time === 0) {
                countdown.stop();
                redBackground();
                numWrong++;
                var percentageDiv = $("#percentage");
                percentageDiv.html(percentage(numCorrect, numWrong))+"%";
                var gifDiv = $("<img src='assets/meme.jpg' alt='you're out of time>");
                $("#gif-container").prepend(gifDiv);
                countdown.wait();
            }

            var converted = countdown.timeConverter(countdown.time);

            $("#time-left").html(converted);
        },

        wait: function() {
            countdown.time = 15;
            clearInterval(intervalId);
            intervalId = setInterval(countdown.waitCount, 1000);
        },

        waitCount: function() {
            countdown.time--;
            if(countdown.time === 9) {
                round++;
                if(round <= LAST_ROUND){
                    clearInterval(intervalId);
                    switchQuote();
                    countdown.reset();
                } else {
                    countdown.stop();
                    $("#time-left").html("00:00");
                    $("#quoteBtn").attr("disabled", true);
                    $("#tweet").attr("disabled", true);
                    $("#fake").attr("disabled", true);
                    $("#quoteHere").text("Check the leaderboard to see your score!\n Refresh the page to play again.");
                    $("#loading").hide();
                    $("gif-div").hide();
                    $("#gif-container").hide();
                    whiteBackground();
                    if(user.username !== "") {
                        return playersRef.orderByChild("Username").equalTo(user.username).once("value").then(function(snapshot) {
                            var player = snapshot.val();
                            var key = Object.keys(snapshot.val())[0];
                            playersRef.child(key).update({ Score: user.score });
                        });
                    } else {
                        $('#newPlayerModal').modal('toggle');
                    }
                }
            }
        },

        timeConverter: function(t) {

            var minutes = Math.floor(t / 60);
            var seconds = t - (minutes * 60);

            if (seconds < 10) {
              seconds = "0" + seconds;
            }

            if (minutes === 0) {
              minutes = "00";
            }
            else if (minutes < 10) {
              minutes = "0" + minutes;
            }

            return minutes + ":" + seconds;
        }
    };

    function addUserAuthentication(){
        user.password = $("#newPassword").val().trim();
        user.username = $("#newUsername").val().trim();
        user.email = user.username+"@fakedomain.com";
        firebase.auth().createUserWithEmailAndPassword(user.email, user.password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
        });
    };

    function checkPassword(){
        user.password = $("#password").val().trim();
        user.username = $("#username").val().trim();
        user.email = user.username+"@fakedomain.com";
        firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(function() {
            //Success
            $("#signInModal").remove();
            $("#welcomePlayer").html("Welcome " + user.username);
        })
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                alert('Wrong password.');
            } else {
                alert(errorMessage);
            }
            user.password = "";
            user.username = "";
            user.email = "";
        });
    };

    $(function userSignIn() {
       $("#signIn").click(function(){
            event.preventDefault();
            checkPassword();
       });
    });


    $("#closeBtn").on("click", function(){
        $("#tblGrid tbody").empty();
    });

    $("#openBtn").on("click", function(){
        return playersRef.orderByChild("Score").limitToLast(10).once("value").then(function(snapshot) {
            snapshot.forEach(function(player) {
                var newRowContent = "<tr><td>" + player.val().Username + "</td><td>" + player.val().Score + "</td></tr>";
                $("#tblGrid tbody").prepend(newRowContent);
            });
        });
    });

    $(function addNewUser() {
        $("#newPlayerSignUp").click(function(){
            event.preventDefault();
            setNewUser();
            addUserAuthentication();
        });
    });

    function validateUser() {
        userNameValid = true;
        return firebase.database().ref('/players').once('value').then(function(snapshot) {
            var players = snapshot.val();
            for(var p in players) {
                if(players[p]["Username"] === user.username) {
                    userNameValid = false;
                    break;
                }
            }

            if(userNameValid) {
                if(user.password.length >= 6) {
                    playerInfoForFirebase = {
                        FirstName: user.firstName,
                        LastName: user.lastName,
                        Username: user.username,
                        Password: user.password,
                        Score: user.score,
                        Email: user.username+"@fakedomain.com"
                    };

                    database.ref().child("players").push(playerInfoForFirebase);

                    $("#signInModal").remove();
                    $('#newPlayerModal').modal('toggle');
                    $("#welcomePlayer").html("Welcome " + user.username);
                } else {
                    $("#invalidUser").text("Please enter a password with at least 6 characters.");
                    $("#newPassword").val("");
                }
            } else {
                $("#invalidUser").text("Username is already taken. Please choose a new name.");
                $("#newUsername").val("");
            }

        });
    };

    function setNewUser(){
        user.firstName = $("#newFirstName").val().trim();
        user.lastName = $("#newLastName").val().trim();
        user.password = $("#newPassword").val().trim();
        user.username = $("#newUsername").val().trim();
        user.email = user.username+"@fakedomain.com";
        validateUser();
    };

    $("#goToGamePage").on("click", function() {
        $('#gamePage').animate({"left":"0"}, "slow").removeClass("hidden");
        $("#introPage").animate({"right":"100%"}, "slow");
    });

    function ranNumber(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    function fakeQuotes() {
        $("#quoteHere").empty();
        var ranIndex = ranNumber(0,fakeNames.length);
        var q = fakeNames[ranIndex];
        var fakeUrl = "https://api.whatdoestrumpthink.com/api/v1/quotes/personalized?q=" + q; 
        //preforming an AJAX request with the QueryURL
        $.ajax({
            url: fakeUrl,
            method: "GET"
        })
        //after data comes back from the request
        .done(function(response){
            if(checkIfRepetitive(getWords(response.message), quotesUsed)) {
                fakeQuotes();
            } else {
                quotesUsed.push(getWords(response.message));
                type = "fake";
                $("#quoteHere").html(response.message);
                countdown.start();
            }
        });   
    };

    function quotes() {
        $("#quoteHere").empty();
              
        //setting up the queryURL for the ajax request
        var quoteUrl =  "https://api.whatdoestrumpthink.com/api/v1/quotes/random";
              
        //preforming an AJAX request with the QueryURL
        $.ajax({
                url: quoteUrl,
                method: "GET"
        })
        //after data comes back from the request
        .done(function(response){
            if(checkIfRepetitive(getWords(response.message), quotesUsed)) {
                quotes();
            } else {
                quotesUsed.push(getWords(response.message))
                type = "quote";
                $("#quoteHere").html(response.message);
                countdown.start();
            }
        });
    };

    function checkIfRepetitive(item, arr) {
        var repeat = false;
        var i = 0;
        while(!repeat && i < arr.length) {
            if(item === arr[i]) {
                repeat = true;
            }
            i++;
        }
        return repeat;
    };

    function getWords(str) {
        return str.split(/\s+/).slice(0,5).join(" ");
    }


    var createRequest = function(keyword) {
        var query = "https://api.giphy.com/v1/gifs/search?q=trump";
        var api_key = "dc6zaTOxFJmzC";
        var limit;
        if(keyword != ""){
            keyword = "+" + keyword;
            limit = 4;
        } else {
            limit = 20;
        }
        var request = query + keyword + "&api_key=" + api_key + "&limit="+limit;
        return request;
    };

    function findKeyword() {
        var phrase = $("#quoteHere").html();
        var key = "";
        var words = phrase.split(" ");
        var keywords = [];
        for(var i=0;i<words.length;i++){
            var word = words[i].toLowerCase();
            for(var j=0;j<subject.length;j++) {
                var sub = subject[j];
                if(word == sub) {
                    keywords.push(word);
                }
            }
        }
        if(keywords.length > 0){
            var ranIndex = ranNumber(0,keywords.length);
            key = keywords[ranIndex];
        }
        return key;
    };

    function keyMapping(key) {
        if(keyMappings.hasOwnProperty(key)) {
            key = keyMappings[key];
        }
        return key;
    };

    function chooseDifferentGif(index, arr) {
        if(index == 3) {
            index--;
        } else {
            index++;
        }
        return arr[index];
    }

    function requestGif() {
        var key = findKeyword();
        key = keyMapping(key);
        var request = createRequest(key);
        $.ajax({"url":request, "method":"GET"})
        .done(function(response) {
            var ranIndex = ranNumber(0,response.data.length);
            var result = response.data[ranIndex];
            if(result.id == lastGifId) {
                result = chooseDifferentGif(ranIndex, response.data);
            }
            lastGifId = result.id;    
            var gifDiv = $("<div class=\"gif-div\">");
            $(gifDiv).css("height", result.images.fixed_height.height);
            $(gifDiv).css("width", result.images.fixed_height.width);
            $(gifDiv).css("background-image", "url("+result.images.fixed_height.url+")");
            $(gifDiv).css("display", "inline-block");
            $("#gif-container").prepend(gifDiv);
        });
    };

    function showWrongGif() {
        var ranIndex = ranNumber(1,10);
        if(ranIndex == lastWrongGifId) {
            showWrongGif();
        } else {
            lastWrongGifId = ranIndex;
            var gif = "giphy_"+ranIndex+".gif";
            var gifDiv = $("<img src='gif/"+gif+"'>");
            $("#gif-container").prepend(gifDiv);
        }
    };

    function filterTweet(quote) {
        var str = quote;
        var n = str.indexOf("#");
        while(n !== -1) {
            var hash = "";
            for(var key in hashtagMap) {
                var index = str.indexOf(key);
                if(index !== -1) {
                    hash = key;
                }
            }
            str = str.replace(hash, hashtagMap[hash]);
            n = str.indexOf("#");
        }
        return str;
    };    

    function tweet() {
        $("#quoteHere").empty();
        type = "tweet";
        var ranIndex = ranNumber(0,tweets.length);
        if(checkIfRepetitive(ranIndex, tweetsUsed)) {
            tweet();
        } else {
            tweetsUsed.push(ranIndex);
            var rand = tweets[ranIndex];
            $("#quoteHere").html(filterTweet(rand));
            countdown.start();
        }  
    };



    $("#generate").on("click", function(event) {
        event.preventDefault();
        round++;
        if(finishedLoading) {
            switchQuote();
            $(".hiddenBtn").removeClass("hiddenBtn");
            $(".hiddenText").removeClass("hiddenText");
            $("#generate").remove();
        } else {
            alert("Please allow game to finish loading...")
        }
    });

    function switchQuote() {
        $("#gif-container").empty();
        randomTrump = ranNumber(0,3);

        if (randomTrump === 0){
            fakeQuotes(); 
        } 
        else if (randomTrump === 1) {
            quotes(); 
        }
        else {
            tweet();
        };
        $("#quoteBtn").attr("disabled", false);
        $("#tweet").attr("disabled", false);
        $("#fake").attr("disabled", false);
    }

    $("#tweet").on("click", function(event) {
        event.preventDefault();
        $("#quoteBtn").attr("disabled", true);
        $("#tweet").attr("disabled", true);
        $("#fake").attr("disabled", true);

        if(type == "tweet") {
            greenBackground();
            requestGif();
            numCorrect++;
            var percentageDiv = $("#percentage");
            percentageDiv.html(percentage(numCorrect, numWrong))+"%";
            $("#loadingDiv").append("<img src='assets/load.gif' id='loading'>");
        } else {
            redBackground();
            showWrongGif();
            numWrong++;
            var percentageDiv = $("#percentage");
            percentageDiv.html(percentage(numCorrect, numWrong))+"%";

            if (type == "quote") {
                $("#correctAnswer").html("<h3>QUOTE</h3>");
                $("#loadingDiv").append("<img src='assets/load.gif' id='loading'>");
            }
            if (type == "fake") {
                $("#correctAnswer").html("<h3>FAKE NEWS</h3>");
                $("#loadingDiv").append("<img src='assets/load.gif' id='loading'>");
            }
        }
        user.score = percentage(numCorrect, numWrong);
        countdown.wait();
    });

    $("#quoteBtn").on("click", function(event) {
        event.preventDefault();
        $("#quoteBtn").attr("disabled", true);
        $("#tweet").attr("disabled", true);
        $("#fake").attr("disabled", true);

        if(type == "quote") {
            greenBackground();
            requestGif();
            numCorrect++;
            var percentageDiv = $("#percentage");
            percentageDiv.html(percentage(numCorrect, numWrong))+"%";
            $("#loadingDiv").append("<img src='assets/load.gif' id='loading'>");
        } else {
            redBackground();
            showWrongGif();
            numWrong++;
            var percentageDiv = $("#percentage");
            percentageDiv.html(percentage(numCorrect, numWrong))+"%";

            if (type == "tweet") {
                $("#correctAnswer").html("<h3>TWEET</h3>");
                $("#loadingDiv").append("<img src='assets/load.gif' id='loading'>");

           }
            if (type == "fake") {
                $("#correctAnswer").html("<h3>FAKE NEWS</h3>");
                $("#loadingDiv").append("<img src='assets/load.gif' id='loading'>");

           }
        }
        user.score = percentage(numCorrect, numWrong);
        countdown.wait();
    });

    $("#fake").on("click", function(event) {
        event.preventDefault();
        $("#quoteBtn").attr("disabled", true);
        $("#tweet").attr("disabled", true);
        $("#fake").attr("disabled", true);

        if(type == "fake") {
            greenBackground();
            requestGif();
            numCorrect++;
            var percentageDiv = $("#percentage");
            percentageDiv.html(percentage(numCorrect, numWrong))+"%";
            $("#loadingDiv").append("<img src='assets/load.gif' id='loading'>");
        } else {
            redBackground();
            showWrongGif();
            numWrong++;
            var percentageDiv = $("#percentage");
            percentageDiv.html(percentage(numCorrect, numWrong))+"%";

            if (type == "tweet") {
                $("#correctAnswer").html("<h3>TWEET</h3>");
                $("#loadingDiv").append("<img src='assets/load.gif' id='loading'>");
            }
            if (type == "quote") {
                $("#correctAnswer").html("<h3>QUOTE</h3>");
                $("#loadingDiv").append("<img src='assets/load.gif' id='loading'>");

           }
        }
        user.score = percentage(numCorrect, numWrong);
        countdown.wait();
    });

    function percentage(correct, wrong){
        if (correct === 0){
            return 0.00;
        }
        else{
            var total = correct + wrong;
            var percent= ((correct/total)*100).toFixed(2);
            return percent; 
        }
    };

    function whiteBackground() {
        $("#colorBox").css("background-color", "white");
        $("#loadingDiv").empty();
    }

    function greenBackground() {
        $("#colorBox").css("background-color", "lightgreen");
    }

    function redBackground() {
        $("#colorBox").css("background-color", "#f25a5a ");
    }


});


            

