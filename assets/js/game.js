const divFlashcards = document.querySelector('#flashcards');

let frutas = [
    'abacaxi', 'pera', 'uva',
    'apple', 'cereja', 'abacate',
    'melancia', 'morango', 'laranja',
    'pessego', 'mirtilos', 'kiwi', 'banana'
];

frutas = [...frutas, ...frutas];

function desenhar_cartas() {
    divFlashcards.innerHTML += ``;
    frutas.forEach((fruta, i) => {
        divFlashcards.innerHTML += `
        <div class="flashcard">
            <div class="flashcard-inner" id="flashcard-${i}" onclick="escolher_flashcard(event)" >
                <div class="flashcard-front bg-primary" id="ff-${i}">
                    <!-- ${fruta} -->
                </div>
                <div class="flashcard-back bg-light" id="fb-${i}">
                    <img src="/assets/img/fruits/${fruta}.png" alt="${fruta}">
                </div>
            </div>
        </div>
        `;
    });
}
desenhar_cartas();

function escolher_flashcard(e) {}

