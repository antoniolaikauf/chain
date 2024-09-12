let random_number = () => {
    return  Math.floor(Math.random() * 6) + 1
}

let numbers='';

for (let i = 0; i < 16; i++) {
    let number='';
    for (let y = 0; y < 4; y++) {
        number += random_number().toString('2').padStart(4,0);        
    }
    numbers+=number
}
console.log(numbers);