import random from './index.js';
const randomThings = Object.keys(random);
randomThings.forEach(thing => {
    let randomValue = random[thing]();
    console.log(`Random ${thing}: ${randomValue}`);
});