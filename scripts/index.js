const NUMBER_OF_DICE = 5;
const NUMBER_OF_ROLLS = 3;
const NUMBER_OF_CATEGORIES = 13;

const UNIQUE_DICE_COUNT_YATZI = 1;
const UNIQUE_DICE_COUNT_L_STRAIGHT = 5;
const UNIQUE_DICE_COUNT_S_STRAIGHT = 4;
const UNIQUE_DICE_COUNT_FULL_HOUSE = 2;

const DIFF_FOR_L_STRAIGHT = 4;
const DIFF_FOR_S_STRAIGHT = 3;

const REPEATED_DICE_COUNT_4_OF_A_KIND = 4;
const REPEATED_DICE_COUNT_3_OF_A_KIND = 3;
const REPEATED_DICE_COUNT_2_OF_A_KIND = 2;

const SCORE_FOR_YATZI = 50;
const SCORE_FOR_L_STRAIGHT = 40;
const SCORE_FOR_S_STRAIGHT = 30;
const SCORE_FOR_FULL_HOUSE = 25;

const yatziChecker = dice => {
    console.log('Checking', dice, 'for yatzi');
    const uniqueDice = [...new Set(dice)];
    if (uniqueDice.length === UNIQUE_DICE_COUNT_YATZI) {
        console.log('yatzi yaay!');
        return SCORE_FOR_YATZI;
    }
    console.log('no yatzi');
    return 0;
};

const nStraightChecker = n => {
    return dice => {
        console.log('Checking', dice, 'for', n, 'straight elements');
        const uniqueDice = [...new Set(dice)];
        if (uniqueDice.length < n) {
            console.log('no straight (not enough unique elements)');
            return 0;
        }
        const sortedDice = uniqueDice.sort((d1, d2) => d1 - d2);
        const diffForStraight = n - 1;
        for (let i = sortedDice.length - 1; i >= diffForStraight; i--) {
            if (sortedDice[i] - sortedDice[i - diffForStraight] === diffForStraight) {
                console.log('straight yaay!', sortedDice[i - diffForStraight], '-', sortedDice[i]);
                return n === UNIQUE_DICE_COUNT_S_STRAIGHT ? SCORE_FOR_S_STRAIGHT : SCORE_FOR_L_STRAIGHT;
            }
        }
        console.log('no straight (elements not in sequence)');
        return 0;
    }
};

const sStraightChecker = nStraightChecker(4);
const lStraightChecker = nStraightChecker(5);

const fullHouseChecker = dice => {
    console.log('Checking', dice, 'for full House');
    const uniqueDice = [...new Set(dice)];
    if (uniqueDice.length !== UNIQUE_DICE_COUNT_FULL_HOUSE) {
        console.log('no full house (unique dice count not 2)');
        return 0;
    }
    const firstElement = uniqueDice[0];
    const firstElementCount = dice.filter(element => element === firstElement).length;
    // if the first element came twice, the other should come three times and vice versa
    if (firstElementCount === REPEATED_DICE_COUNT_2_OF_A_KIND || firstElementCount === REPEATED_DICE_COUNT_3_OF_A_KIND) {
        console.log('full house yaay!');
        return SCORE_FOR_FULL_HOUSE;
    }
    console.log('no full house (elements don\'t make pair and 3 of a kind)');
    return 0;
};

const chanceChecker = dice => {
    console.log('Checking', dice, 'for chance');
    const sum = dice.reduce((sum, current) => sum + current, 0);
    console.log('Sum:', sum);
    return sum;
};

const nOfAKindChecker = n => {
    return dice => {
        console.log('Checking', dice, 'for elements repeating', n, 'times');
        const uniqueDice = [...new Set(dice)];
        for (let i = 0; i < uniqueDice.length; i++) {
            const currentDie = uniqueDice[i];
            const repeatCount = dice.filter(die => die === currentDie).length;
            if (repeatCount >= n) {
                console.log('found', n, 'dice with value', currentDie, 'yaay!');
                return chanceChecker(dice);
            }
        }
        console.log('no element occurred', n, 'times');
        return 0;
    }
};

const threeOfAKindChecker = nOfAKindChecker(3);
const fourOfAKindChecker = nOfAKindChecker(4);

const repeatChecker = die => {
    return dice => {
        console.log('Looking for', die, 'in', dice);
        const repeatCount = dice.filter(d => d === die).length;
        console.log(repeatCount, die, '(s) found');
        return repeatCount * die;
    }
};

const onesChecker = repeatChecker(1);
const twosChecker = repeatChecker(2);
const threesChecker = repeatChecker(3);
const foursChecker = repeatChecker(4);
const fivesChecker = repeatChecker(5);
const sixesChecker = repeatChecker(6);

const scoreCheckers = [
    onesChecker,
    twosChecker,
    threesChecker,
    foursChecker,
    fivesChecker,
    sixesChecker,
    threeOfAKindChecker,
    fourOfAKindChecker,
    fullHouseChecker,
    sStraightChecker,
    lStraightChecker,
    yatziChecker,
    chanceChecker,
];

const roll = numberOfDice => {
    const dice = [];
    for (let i = 0; i < numberOfDice; i++) {
        dice.push(Math.floor(Math.random() * 6) + 1);
    }
    return dice;
};

const updateRollButton = (rollButton, rollsLeft) => {
    rollButton.innerText = `Roll (${rollsLeft})`;
    if (rollsLeft === 0) {
        rollButton.disabled = true;
    }
}

// states
let rollsLeft = NUMBER_OF_ROLLS;
const scores = Array.from(new Array(NUMBER_OF_CATEGORIES)).map(_ => null);

const rollButton = document.querySelector('#roll-btn');
updateRollButton(rollButton, rollsLeft);
rollButton.onclick = () => {
    const dice = roll(NUMBER_OF_DICE);
    dice.forEach((die, index) => {
        const dieImg = document.querySelector(`#die-${index + 1} img`);
        dieImg.src = `images/${die}.png`;
        dieImg.alt = `Die facing ${die}`;
        dieImg.style.visibility = 'visible';
    });

    scoreCheckers.forEach((scoreChecker, index) => {
        if (scores[index] === null) {
            const scoreTd = document.querySelector(`#score-${index + 1}`);
            const score = scoreChecker(dice);
            // scores[index] = score;
            scoreTd.dataset.score = score;
            scoreTd.innerText = score;
        }
    });

    updateRollButton(rollButton, --rollsLeft);
}

const remainings = document.querySelectorAll('.remaining');
remainings.forEach(remaining => {
    remaining.onclick = () => {
        console.log('Clicked on something remaining');
        const previouslySelected = document.querySelector('.selected');
        if (previouslySelected && previouslySelected !== remaining) {
            previouslySelected.classList.remove('selected');
            previouslySelected.classList.add('remaining');
        }
        remaining.classList.remove('remaining');
        remaining.classList.add('selected');

        const playButton = document.querySelector('#play-btn');
        playButton.disabled = false;
        playButton.onclick = () => {
            console.log('Got', remaining.dataset.score, 'points');
            remaining.classList.remove('selected');
            remaining.classList.add('confirmed');
        };
    }
});
