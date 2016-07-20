var mplayer = $('#mplayer')[0];
var upload = $('#upload')[0];
var searchField = $('#searchfield')[0];
var fileForm = $('#fileForm')[0];
var fileSelect = $('#fileSelect')[0];
var uploadBtn = $('#uploadBtn')[0];
var currentPlaying = -1;
var song_list = {};


function getFragment() {
    var vars = [], hash;
    var fragment = window.location.href.slice(window.location.href.indexOf('?') - 1)
    return fragment
}


function loadSong(song_id) {
    $("#mplayer").attr("src", "/music/"+song_id);
    
    $.ajax({
        url: "/music/title_"+song_id,
        type: "GET",
        success: function(responseJSON) {
            loadTitle(responseJSON[0].title);
        },
        error: function (e) {
            console.log("error :(")
        },
    });
    currentPlaying = parseInt(song_id);
}

function loadTitle(title) {
    titleField = $("#mplayer-title")[0];
    if (title.length > 30) {
        title = title.substring(0,30)+"...";
    }
    titleField.innerText = title;
}

function updateTitleClass(songId) {
    console.log(songId); 
    if (currentPlaying > -1) {
        var cur = $("#title_"+currentPlaying)[0];
        cur.setAttribute("class", "label label-primary title");
    }
    var song = $("#title_"+songId)[0];
    song.setAttribute("class", "label label-danger title");
}

function setAutoPlay() {
    var audio_player = $("#mplayer")[0];
    audio_player.setAttribute("autoplay", "");
}

function prevOnclick() {
    setAutoPlay();
    var prev = currentPlaying-1;
    try {
        updateTitleClass(prev);
        currentPlaying--;
        loadSong(currentPlaying);
    } catch(TypeError) {
        updateTitleClass(prev+1);
    }
}


function nextOnclick() {
    setAutoPlay();
    var next = currentPlaying+1;
    try {
        updateTitleClass(next);
        currentPlaying++;
        loadSong(currentPlaying);
    } catch(TypeError) {
        updateTitleClass(next-1);
    }
}


function onClickTitle(songId) {
    setAutoPlay();
    updateTitleClass(songId);
    loadSong(songId);
}

searchField.addEventListener("input", function() {
    var val = searchField.value.toLowerCase();
    var songs = $(".title");
    for (var i = 0; i < songs.length; i++) {
        if (songs[i].innerHTML.toLowerCase().indexOf(val) == -1) {
            songs[i].style.setProperty("display", "none");
        } else {
            songs[i].style.setProperty("display", "list-item");
        }
    }
});

mplayer.addEventListener("ended", function() {
    var a = $("#mplayer")[0];
    setTimeout(function () {      
        a.play();
    }, 150);
    setAutoPlay();
    var next = currentPlaying+1;
    updateTitleClass(next); 
    currentPlaying++;
    loadSong(currentPlaying);
});


$(function() {
    var oldPlay = mplayer.play;
    mplayer.play = function() {
        oldPlay.apply(this, arguments);
       updateTitleClass(currentPlaying);
    }
});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


fileForm.onsubmit = function(event) {
    event.preventDefault();
    uploadBtn.innerHTML = "Uploading...";
    var files = fileSelect.files;
    var formData = new FormData();
    var numFiles = 0;

    for (var i = 0; i < files.length; i++) {
        file = files[i];
        if (file.type.startsWith("audio/")) {
            formData.append("song_"+i, file, file.name);
            numFiles++;
        } else {
            alert(file.name + " is not an audio file");
        }
    }
    if (numFiles == 0) {
        return;
    }
    var xhr = new XMLHttpRequest();
    // Open the connection.
    xhr.open('POST', '/music/', true);

    // Set up a handler for when the request finishes.
    xhr.onload = function () {
        if (xhr.status === 200) {
        uploadBtn.innerHTML = 'Upload';
        } else {
            alert('Error');
        }
    };

    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    xhr.send(formData);
   
    $.ajax({
        url: "/music/last_"+numFiles,
        type: "GET",
        dataType: "json",
        success: function(responseJSON) {
             for (var i = 0; i < responseJSON.length; i++) {
                 updateSongList(responseJSON[i]);
             }
          }
    });

    uploadBtn.disabled = true;
    document.getElementById("uploadname").value = "";
}

function updateSongList(responseJSON) {
    var id = responseJSON.id;
    var name = responseJSON.name;
    var songList = $('#songlist')[0];
    var h4 = document.createElement("h4");
    var span = document.createElement("span");
    span.setAttribute("id", "title_"+id);
    span.setAttribute("class", "label label-primary title");
    span.setAttribute("onclick", "onClickTitle("+id+")");
    span.setAttribute("style", "cursor: pointer;");
    var title = document.createTextNode(name);
    span.appendChild(title);
    h4.appendChild(span);
    songlist.appendChild(h4);
}

fileSelect.onchange = function() {
    console.log("change");
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
}

fileSelect.onfileselect = function(event, numFiles, label) {
    var input = $(this).parents('.input-group').find(':text'),
        log = numFiles > 1 ? numFiles + ' files selected' : label;

    input.val(log);
    uploadBtn.disabled = false;
}



function onClickSongNewPlaylist(songId) {
    var song = $("#song_"+songId)[0];
    if (song.getAttribute("class").indexOf("label-danger") == -1) {
        song.setAttribute("class", "label label-danger title");
    } else {
        song.setAttribute("class", "label label-primary title");

    }
}

function onSavePlaylist() {
    var name = $("#playlistname")[0].value;
    if (!name) {
        alert("The playlist needs a name before being saved");
    } else {
        data = {"name": name, 
                "songs": [],
               }
        var songs = $("#allsongs")[0].children;
        for (var i = 0; i < songs.length; i++) {
            if (songs[i].children[0].getAttribute("class").indexOf("label-danger") != -1) {
            var songId = songs[i].children[0].id.split("_")[1];
                data.songs.push(songId);
            }
        }
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/music/playlist', true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        xhr.send(JSON.stringify(data));

        console.log("name: " + name)
        $.ajax({
            url: "/music/playlist/id/"+name,
            type: "GET",
            dataType: "json",
            success: function(responseJSON) {
                var id = responseJSON[0].id;
                updatePlaylistList(name, id);
            }
        });
    }
}

function updatePlaylistList(name, id) {
    var playlists = $('#playlists')[0];
    var h4 = document.createElement("h4");
    var span = document.createElement("span");
    span.setAttribute("id", "playlist_"+id);
    span.setAttribute("class", "label label-primary title");
    span.setAttribute("onclick", "onClickPlaylist("+id+")");
    span.setAttribute("style", "cursor: pointer;");
    var title = document.createTextNode(name);
    span.appendChild(title);
    h4.appendChild(span);
    playlists.appendChild(h4);
    console.log("done");
}

var currPlaylistId = -1;

function onClickPlaylist(playlistId) {
    console.log("getting " + playlistId);
    currPlaylistId = playlistId;
}


function onClickLoadPlayList() {
    $.ajax({
        url: "/music/playlist/"+currPlaylistId,
        type: "GET",
        dataType: "json",
        success: function(responseJSON) {
            console.log("setting song list");
            songs = $("#songlist")[0];
            console.log(songs);
            while (songs.childNodes.length != 0) {
                songs.removeChild(songs.childNodes[0]);
            }
            for (var i=0; i<responseJSON.length; i++) {
                updateSongList(responseJSON[i]);
            }
        }
    });    
}



function onClickAllMusic() {
    $.get("/music/all", function(data, status) {
        for (var i=0; i<data.length; i++) {
            song_list[data[i].id] =  data[i].name;
        }
    });
    
    // update songlist in html here
}




$(function(){
  $('#mplayer').mediaelementplayer({
    alwaysShowControls: true,
    features: ['playpause','progress','volume'],
    audioVolume: 'horizontal',
    audioWidth: 450,
    audioHeight: 70,
    iPadUseNativeControls: true,
    iPhoneUseNativeControls: true,
    AndroidUseNativeControls: true
  });
});


$(function() {
    try {
        var first = $("#songlist")[0].children[0].children[0];
        var firstId = first.id;
        var firstTitle = first.innerText;
        firstId = firstId.split("_")[1];
        loadTitle(firstTitle);
        currentPlaying = parseInt(firstId);
    } catch(TypeError) {
    }
});







