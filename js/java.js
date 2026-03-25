console.log("start")


let layer = document.querySelector(".fade-layer")
layer.addEventListener("click", goback)

let loginbutton = document.querySelector(".loginbutton")
loginbutton.addEventListener("click", openlogin)

function goback(){
    window.location.href = "upcoming.html"
    layer.classList.toggle("visible")
}

let burgerbutton = document.querySelector(".hamburger")
let menu = document.querySelector("aside.menu")
burgerbutton.addEventListener("click", openmenu)

function openmenu(){
    console.log("tryckte!")
    menu.classList.toggle("open")
    layer.classList.toggle("visible")
}
function openlogin(){
    console.log("tryckte!")
    window.location.href = "login.html"
    
}
let predictbutton = document.querySelector(".predictbutton")
let predictionmenu = document.querySelector(".predictionmenu")
predictbutton.addEventListener("click", openpredictions)

function openpredictions(){
    predictionmenu.classList.toggle("open")
    layer.classList.toggle("visible")
}