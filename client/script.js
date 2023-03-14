import bot from './assets/bot.svg'
import user from './assets/user.svg'


const form = document.querySelector('form');
const chatContainer = document.getElementById('chat-container');

let loadInterval;


//Show three dots while text typing and relode dots every 300 msek
function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContext === '....') {
            element.textContent = '';
        }
    }, 300)
}

//Type robot answer letter by letter not the all at ones to increase the user experience

function typeText(element, text) {

    let index = 0;
    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        }
        else {
            clearInterval(interval)
        }
    }, 20)
}

// Create a unique Id for messeges
function generateUniqueId() {
    const timeStamp = Date.now();
    const randomNumber = Math.random();
    const hexaDecimalString = randomNumber.toString(16);

    return `id-${timeStamp}-${hexaDecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
    `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img
                        src=${isAi ? bot : user}
                        alt="${isAi ? 'bot' : 'user'}"
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e)=>{
    e.preventDefault();
    const data = new FormData(form);

    //user's chat stripe
    chatContainer.innerHTML +=chatStripe(false, data.get('prompt'));
    form.reset();
// bot's chat stripe

const uniqueId = generateUniqueId();
chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
chatContainer.scrollTop = chatContainer.scrollHeight;

const messageDiv = document.getElementById(uniqueId);
loader(messageDiv);

//fetch data from server

const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        prompt: data.get('prompt')
    })
})
clearInterval(loadInterval);
messageDiv.innerHTML = '';

if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData)
} else{
    const err = await response.text();
    messageDiv.innerHTML = 'Something went wrong';

    alert(err)
}

}

form.addEventListener('submit', handleSubmit);

form.addEventListener('keyup', (e)=>{
    if(e.keyCode === 13){
        handleSubmit(e)
    }
})