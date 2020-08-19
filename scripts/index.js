const NUMBER_OF_DICE = 5;
const ROLLS_PER_TURN = 3;
const NUMBER_OF_CATEGORIES = 13;

const GAME_OVER_POPUP_DELAY = 1000;

const INITIAL_TEXT_TOTAL = document.querySelector('#total').innerText;
const INITIAL_TEXT_BONUS = document.querySelector('#bonus').innerText;
const MIN_MINOR_SCORE_FOR_BONUS = 63;
const BONUS_SCORE = 35;

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

// states
let rollsLeft = ROLLS_PER_TURN;

const resetAllScores = () => {
    document.querySelectorAll('.score:not(#bonus)').forEach(score => {
        score.classList.remove('confirmed');
        score.classList.remove('selected');
        score.dataset.score = null;
        score.innerText = '';
    });
};

const clearSuggestedScores = () => {
    const suggestedScores = document.querySelectorAll('.score:not(.confirmed):not(#bonus)');
    suggestedScores.forEach(score => {
        score.innerText = '';
        score.dataset.score = null;
        score.onclick = null;
    });
};

const resetBonus = () => {
    const bonus = document.querySelector('#bonus');
    bonus.classList.remove('confirmed');
    bonus.dataset.score = null;
    bonus.innerText = INITIAL_TEXT_BONUS;
};

const resetTotal = () => {
    const total = document.querySelector('#total');
    total.dataset.total = null;
    total.innerText = INITIAL_TEXT_TOTAL;
};

const clearDice = () => {
    const dice = document.querySelectorAll('.die');
    dice.forEach(die => {
        die.classList.remove('selected');
        die.querySelector('img').style.visibility = 'hidden';
        die.dataset.die = null;
        die.onclick = null;
    });
};

const reset = () => {
    resetAllScores();
    resetBonus();
    resetTotal();
    clearDice();

    rollsLeft = ROLLS_PER_TURN;
    updateRollButton(rollsLeft);
    updatePlayButton();

    addListenerToRollButton();
    addListenerToPlayButton();

    document.querySelector('main').style.display = 'block';
}

document.querySelector('#new-game-btn').onclick = reset;

const updateRollButton = rollsLeft => {
    const rollButton = document.querySelector('#roll-btn');
    rollButton.innerText = `Roll (${rollsLeft})`;
    rollButton.disabled = (rollsLeft === 0);
};

const updatePlayButton = () => {
    const playButton = document.querySelector('#play-btn');
    playButton.disabled = (document.querySelector('.score.selected') === null);
};

const onRemainingScoreClicked = selectedScore => {
    const previouslySelectedScore = document.querySelector('.score.selected');
    if (previouslySelectedScore && previouslySelectedScore !== selectedScore) {
        previouslySelectedScore.classList.remove('selected');
    }
    selectedScore.classList.toggle('selected');
    updatePlayButton();
};

const generatePossibleScores = dice => {
    scoreCheckers.forEach((scoreChecker, index) => {
        const scoreContainer = document.querySelector(`#score-${index + 1}`);
        if (!scoreContainer.classList.contains('confirmed')) {
            const score = scoreChecker(dice);
            scoreContainer.innerText = score;
            scoreContainer.dataset.score = score;
            scoreContainer.onclick = () => {
                onRemainingScoreClicked(scoreContainer);
            };
        }
    });
};

const getDiceAsArray = () => {
    const result = [];
    const dieElements = document.querySelectorAll('.die');
    dieElements.forEach(dieElement => {
        result.push(Number(dieElement.dataset.die));
    });
    return result;
};

const setDieImage = (dieImageContainer, valueForDie) => {
    const imageForDie = dieImageContainer.querySelector('img');
    imageForDie.src = `images/${valueForDie}.png`;
    imageForDie.alt = `Die facing ${valueForDie}`;
    imageForDie.style.visibility = 'visible';
};

const rollDice = () => {
    const remainingDice = document.querySelectorAll('.die:not(.selected)');
    remainingDice.forEach(die => {
        const valueForDie = Math.floor(Math.random() * 6) + 1;
        setDieImage(die, valueForDie);
        die.dataset.die = valueForDie;
        die.onclick = () => {
            die.classList.toggle('selected');
        }
    });
};

const deselectElements = querySelector => {
    const selectedElements = document.querySelectorAll(querySelector);
    if (selectedElements) {
        selectedElements.forEach(element => element.classList.remove('selected'));
    }
}

const addListenerToRollButton = () => {
    document.querySelector('#roll-btn').onclick = () => {
        deselectElements('.score.selected');
        rollDice();
        generatePossibleScores(getDiceAsArray());
        updateRollButton(--rollsLeft);
        updatePlayButton();
    }
};

const onGameOver = () => {
    // used setTimeout because the alert would come before the scores/total score have been updated on Chrome
    // reference: https://stackoverflow.com/questions/38960101/why-is-element-not-being-shown-before-alert
    setTimeout(() => {
        alert(`Game over! Score: ${document.querySelector('#total').dataset.total}`);
    }, GAME_OVER_POPUP_DELAY);
    const gameOverContainer = document.querySelector('#game-over');
    gameOverContainer.style.display = 'block';
    rollsLeft = 0;
    updateRollButton(rollsLeft);
    updatePlayButton();
};

const checkGameOver = () => {
    const turnsPlayed = document.querySelectorAll('.score.confirmed:not(#bonus)').length;
    if (turnsPlayed === NUMBER_OF_CATEGORIES) {
        onGameOver();
    }
};

const updateTotalScore = () => {
    let totalScore = 0;
    const confirmedScores = document.querySelectorAll('.score.confirmed');
    confirmedScores.forEach(confirmedScore => totalScore += Number(confirmedScore.dataset.score));
    const totalScoreContainer = document.querySelector('#total');
    totalScoreContainer.innerText = totalScore;
    totalScoreContainer.dataset.total = totalScore;
};

const updateBonus = () => {
    let bonusScore = 0;
    const minorScores = document.querySelectorAll('.score.minor.confirmed');
    minorScores.forEach(scoreElement => bonusScore += Number(scoreElement.dataset.score));
    const bonusContainer = document.querySelector('#bonus');
    bonusContainer.innerText = `${bonusScore}/${MIN_MINOR_SCORE_FOR_BONUS}`;
    if (bonusScore >= MIN_MINOR_SCORE_FOR_BONUS) {
        bonusContainer.classList.add('confirmed');
        bonusContainer.innerText += ' (+35 yaay!)'
        bonusContainer.dataset.score = BONUS_SCORE;
    }
};

const confirmSelectedScore = () => {
    const selectedScore = document.querySelector('.score.selected');
    selectedScore.classList.remove('selected');
    selectedScore.classList.add('confirmed');
    selectedScore.onclick = null;
};

const onTurnPlayed = () => {
    confirmSelectedScore();
    updateBonus();
    updateTotalScore();
    clearSuggestedScores();
    clearDice();
    rollsLeft = ROLLS_PER_TURN;
    updateRollButton(rollsLeft);
    updatePlayButton();
    checkGameOver();
};

const addListenerToPlayButton = () => {
    const playButton = document.querySelector('#play-btn');
    playButton.onclick = onTurnPlayed;
};