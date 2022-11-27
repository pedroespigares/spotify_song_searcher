window.onload = () => {
    input = document.getElementById("title");

    search_btn = document.getElementById("search");
    search_btn.addEventListener('click', () => throwPetition(true));

    clear_btn = document.getElementById("clear");
    clear_btn.addEventListener('click', clearResults);
}

window.addEventListener('scroll',()=>{
    if(window.scrollY + window.innerHeight >= 
    document.documentElement.scrollHeight){
        throwPetition(false);
    }
})


// Con este código se obtiene el token de acceso a la API de Spotify y se guarda en la variable access_token para poder 
// usarla en las peticiones y no tener que pedirla cada vez que se haga una petición.

const client_id = "3a05bf07db6844a5a7e244e5cd6ca6a0";
const client_secret = "34eee371f8f74fc3ae4dfb6c34787e21";
var access_token = "";

var authParameters = {
    method:"POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&client_id=" + client_id + "&client_secret=" + client_secret
};

fetch('https://accounts.spotify.com/api/token', authParameters)
    .then(response => response.json())
    .then(data => access_token = data.access_token);

var request;
var offset = 0;



function throwPetition(firstTime){
    if(firstTime){
        offset = 0;
        // Diferenciamos entre la primera petición y las siguientes para que no se repitan los resultados
        // Ademas de que la primera petición se hace con el offset a 0 y las siguientes con el offset a 20, 40, 60...

        request = new XMLHttpRequest();
        if (input.value != "")
            petition = 'https://api.spotify.com/v1/search?q=' + input.value + '&type=track&offset=' + offset;
        else
            input.setAttribute("placeholder","Please, write something");
        request.open('GET', petition, true);
        request.setRequestHeader('Accept','application/json');
        request.setRequestHeader('Content-Type','application/json');
        request.setRequestHeader('Authorization','Bearer ' + access_token);
        
        request.onreadystatechange = () => responseTreatment(true);

        request.send();

        offset += 20;
    } else {
        request = new XMLHttpRequest();
        if (input.value != "")
            petition = 'https://api.spotify.com/v1/search?q=' + input.value + '&type=track&offset=' + offset;
        else
            input.setAttribute("placeholder","Please, write something");
        request.open('GET', petition, true);
        request.setRequestHeader('Accept','application/json');
        request.setRequestHeader('Content-Type','application/json');
        request.setRequestHeader('Authorization','Bearer ' + access_token);
        
        request.onreadystatechange = () => responseTreatment(false);

        request.send();

        offset += 20;
    }
}


function responseTreatment(firstTime){
    if(firstTime){
        document.getElementById("results").innerHTML = "";
    }
    if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
        var response = JSON.parse(request.responseText);
        var tracks = response.tracks.items;
        for (var i = 0; i < tracks.length; i++) {
            printResult(tracks, i);
        }

        var songs = document.getElementsByClassName("song");
        for (var i = 0; i < songs.length; i++) {
            var play = songs[i].getElementsByClassName("play")[0];
            var stop = songs[i].getElementsByClassName("stop")[0];

            play.addEventListener('click', (e) => {
                var audio = e.target.parentElement.parentElement.getElementsByTagName("audio")[0];
                audio.volume = 0.2;
                audio.play();
            });

            stop.addEventListener('click', (e) => {
                var audio = e.target.parentElement.parentElement.getElementsByTagName("audio")[0];
                audio.pause();
            });
        }
        } else {
          alert("There was a problem with the request.");
        }
    }
}

function printResult(tracks, i){
    document.getElementById("results").innerHTML += 
    `<div class="song">
        <img src="${tracks[i].album.images[1].url}" alt="album cover">
        <div class="song--info">
            <h3>${tracks[i].name}</h3>
            <p>Artist: <span>${tracks[i].artists[0].name}</span></p>
            <p>Album: <span>${tracks[i].album.name}</span></p>
            <p>Release: <span>${tracks[i].album.release_date}</span></p>
            <a href="${tracks[i].external_urls.spotify}" target="_blank">Open in Spotify</a>
        </div>
        <div class="song--actions">
            <button class="play"><i class="fa-solid fa-play"></i></button>
            <button class="stop"><i class="fa-solid fa-pause"></i></button>
            <audio>
                <source src="${tracks[i].preview_url}" type="audio/mpeg">
            </audio>
        </div>
    </div>`;
}

function clearResults(){
    document.getElementById("results").innerHTML = "";
    input.value = "";
}