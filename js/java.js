console.log("start")


let layer = document.querySelector(".fade-layer")
layer.addEventListener("click", goback)

let loginbutton = document.querySelector(".loginbutton")
loginbutton.addEventListener("click", openlogin)

function goback(){
    window.location.href = "index.html"
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
