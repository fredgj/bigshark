var mplayer = $('#mplayer')[0];
var upload = $('#upload')[0];
var fileForm = $('#fileForm')[0];
var fileSelect = $('#fileSelect')[0];
var uploadBtn = $('#uploadBtn')[0];
var currentPlaying = -1;
var song_list = [];
var current = 0;
var currPlaylistId = -1;


function loadSong(song_id) {
    updateTitleClass(song_id);
    $("#mplayer").attr("src", "/music/song/id/"+song_id);
   
    $.get("/music/song/name/"+song_id, function(responseJSON, status) {
            
            loadTitle(responseJSON[0].name);
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
    if (currentPlaying > -1) {
        var cur = $("#title_"+currentPlaying)[0];
        cur.setAttribute("class", "label label-primary title");
    }
    var song = $("#title_"+songId)[0];
    song.setAttribute("class", "label label-danger title");
}


function setAutoPlay() {
    mplayer.setAttribute("autoplay", "");
}


function prevOnclick() {
    if (current < 0) {
        return;
    }
    else if (mplayer.currentTime > 1) {
        mplayer.currentTime = 0;
    } 
    else if (current > 0) {
        current--;
        setAutoPlay();
        var id = song_list[current];
        loadSong(id);
    }
}


function nextOnclick() {
    if (current < song_list.length-1) {
        current++;
        setAutoPlay();
        var id = song_list[current];
        loadSong(id);
    }
}


function onClickTitle(index, songId) {
    current = index;
    setAutoPlay();
    loadSong(songId);
}



function onInputSearch(id, val) {
    var songs = $("#"+id)[0].children;
    for (var i = 0; i < songs.length; i++) {
            var song = songs[i].children[0];
        if (songs[i].innerText.toLowerCase().indexOf(val) == -1) {
            songs[i].style.setProperty("display", "none");
        } else {
            songs[i].style.setProperty("display", "");
        }
    }
}


function onInputSearchModal() {
    var searchField = $("#searchfieldModal")[0];
    var val = searchField.value.toLowerCase();
    var id = "songlist-modal";
    onInputSearch(id, val);
}


function onInputSearchSongs() {
    var searchField = $("#searchfieldSongs")[0];
    var val = searchField.value.toLowerCase();
    var id = "songlist";
    onInputSearch(id, val);
}


function onInputSearchPlaylists() {
    var searchField = $("#searchfieldPlaylists")[0];
    var val = searchField.value.toLowerCase();
    var id = "playlists";
    onInputSearch(id, val);
}


mplayer.addEventListener("ended", function() {
    setTimeout(function () {      
        mplayer.play();
    }, 150);
    nextOnclick();
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
            update_latest_uploaded(numFiles);
        } else {
            alert('Error');
        }
    };

    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    xhr.send(formData);
    uploadBtn.disabled = true;
    document.getElementById("uploadname").value = "";

}

function update_latest_uploaded(numFiles) {
    if (currPlaylistId != -1) {
        // No need to add the uploaded song to the current playlist
        return;
    }    
     
    $.ajax({
        url: "/music/songs/last_"+numFiles,
        type: "GET",
        dataType: "json",
        success: function(responseJSON) {
             for (var i = 0; i < responseJSON.length; i++) {
                 var json = responseJSON[i];
                 song_list.push(json.id);
                 updatesongs('songlist', 'title', json);
                 updatesongs('songlist-modal', 'song', json);
             }
          }
    });
}


function updatesongs(listId, idPrefix, responseJSON) {
    var id = responseJSON.id;
    if (listId == 'songlist') {
       song_list.push(id);
    }
    var name = responseJSON.name;
    var songList = $('#'+listId)[0];
    var h4 = document.createElement("h4");
    var span = document.createElement("span");
    span.setAttribute("id", idPrefix+"_"+id);
    span.setAttribute("class", "label label-primary title");
    if (listId == 'songlist') {
        var index = songList.children.length;
        span.setAttribute("onclick", "onClickTitle("+index+","+id+")");
    } else {
        span.setAttribute("onclick", "onClickSongModal("+id+")");
    }
    span.setAttribute("style", "cursor: pointer;");
    var title = document.createTextNode(name);
    span.appendChild(title);
    h4.appendChild(span);
    songList.appendChild(h4);
}


fileSelect.onchange = function() {
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


function onClickSongModal(songId) {
    var song = $("#song_"+songId)[0];
    if (song.getAttribute("class").indexOf("label-danger") == -1) {
        song.setAttribute("class", "label label-danger title");
    } else {
        song.setAttribute("class", "label label-primary title");

    }
}


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


function onSavePlaylist() {
    var name = $("#playlistname")[0].value;
    name = name.replaceAll(" ", "_");
    if (!name) {
        alert("The playlist needs a name before being saved");
    } else {
        data = {"name": name, 
                "songs": [],
               }
        var songs = $("#songlist-modal")[0].children;
        for (var i = 0; i < songs.length; i++) {
            if (songs[i].children[0].getAttribute("class").indexOf("label-danger") != -1) {
            var songId = songs[i].children[0].id.split("_")[1];
                data.songs.push(songId);
            }
        }
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/music/playlist', true);

        // Set up a handler for when the request finishes.
        xhr.onload = function () {
            if (xhr.status === 200) {
                uploadBtn.innerHTML = 'Upload';
                $.ajax({
                    url: "/music/playlist/id/"+name,
                    type: "GET",
                    dataType: "json",
                    success: function(responseJSON) {
                        var id = responseJSON[0].id;
                        name = name.replaceAll("_", " ");
                        updatePlaylistList(name, id);
            }
        });
            } else {
                alert('Error');
            }
        };

        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        xhr.send(JSON.stringify(data));


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
}


function updatePlaylistClass(playlistId) {
    if (currPlaylistId > -1) {
        var cur = $("#playlist_"+currPlaylistId)[0];
        cur.setAttribute("class", "label label-primary title");
    }
    var song = $("#playlist_"+playlistId)[0];
    song.setAttribute("class", "label label-danger title");
}


function onClickPlaylist(playlistId) {
    updatePlaylistClass(playlistId);
    currPlaylistId = playlistId;
}


function onClickLoadPlaylist() {
    $.ajax({
        url: "/music/playlist/content/"+currPlaylistId,
        type: "GET",
        dataType: "json",
        success: function(responseJSON) {
            songs = $("#songlist")[0];
            while (songs.childNodes.length != 0) {
                songs.removeChild(songs.childNodes[0]);
            }
            song_list = []
            for (var i=0; i<responseJSON.length; i++) {
                var json = responseJSON[i];
                updatesongs('songlist', 'title', json); 
            }
            currentPlaying = -1;
            current = -1;
        }
    });
}



function onClickAllMusic() {
    if (currPlaylistId == -1) {
        return;
    }
    song_list = []
    songs = $("#songlist")[0];
    while (songs.childNodes.length != 0) {
        songs.removeChild(songs.childNodes[0]);
    }
    $.get("/music/songs/all", function(responseJSON, status) {
        for (var i=0; i<responseJSON.length; i++) {
            var json = responseJSON[i];
            updatesongs('songlist', 'title', json); 
        }
    });
    currPlaylistId = -1;
    current = -1; 
}


$(function(){
  $('#mplayer').mediaelementplayer({
    alwaysShowControls: true,
    features: ['playpause','progress','volume'],
    audioVolume: 'horizontal',
    audioWidth: 450,
    audioHeight: 70,
    iPadUseNativeControls: false,
    iPhoneUseNativeControls: false,
    AndroidUseNativeControls: false
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

        var songs = $("#songlist")[0].children;
        for (var i=0; i<songs.length; i++) {
            var id = songs[i].children[0].id.split("_")[1];
            song_list.push(id);
        }
    } catch(TypeError) {
    }
});


