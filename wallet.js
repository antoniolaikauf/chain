let random_number = () => {
    return  Math.floor(Math.random() * 6) + 1
}

let numbers='';

for (let i = 0; i < 10; i++) {
    let number='';
    for (let y = 0; y < 6; y++) {
        number += random_number();        
    }
    numbers+=number
}

console.log(numbers);
