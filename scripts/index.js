import {
    INITIAL_TEXT_BONUS,
    INITIAL_TEXT_TOTAL,
    ROLLS_PER_TURN,
    PROMPT_MESSAGE,
    PROMPT_CONFIRM_KEYWORD,
    GAME_OVER_POPUP_DELAY,
    NUMBER_OF_CATEGORIES,
    MIN_MINOR_SCORE_FOR_BONUS,
    BONUS_SCORE,
    NUMBER_OF_CATEGORIES,
} from './constants';
import scoreCheckers from './score-checkers';

const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const load = key => JSON.parse(localStorage.getItem(key));
const remove = key => localStorage.removeItem(key);

const resetAllScores = () => {
    document.querySelectorAll('.score:not(#bonus)').forEach(score => {
        score.classList.remove('confirmed');
        score.classList.remove('selected');
        score.dataset.score = null;
        score.innerText = '';
        score.onclick = null;
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

const clearLastGameData = () => {
    remove('dice');
    remove('scores');
    save('rollsLeft', ROLLS_PER_TURN);
};

const reset = () => {
    if (isGameInProgress() && prompt(PROMPT_MESSAGE) === PROMPT_CONFIRM_KEYWORD) {
        clearLastGameData();
        resetAllScores();
        resetBonus();
        resetTotal();
        clearDice();
        updateRollButton();
        updatePlayButton();
    }
}

document.querySelector('#new-game-btn').onclick = reset;

const updateRollButton = () => {
    const rollsLeft = load('rollsLeft');
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
};

const addListenerToRollButton = () => {
    document.querySelector('#roll-btn').onclick = () => {
        deselectElements('.score.selected');
        rollDice();
        const dice = getDiceAsArray();
        generatePossibleScores(dice);
        save('dice', dice);
        save('rollsLeft', load('rollsLeft') - 1);
        updateRollButton();
        updatePlayButton();
    }
};

const getTotalScore = () => Number(document.querySelector('#total').dataset.total);

const onGameOver = () => {
    const totalScore = getTotalScore();
    // used setTimeout because the alert would come before the scores/total score have been updated on Chrome
    // reference: https://stackoverflow.com/questions/38960101/why-is-element-not-being-shown-before-alert
    setTimeout(() => {
        alert(`Game over! Score: ${totalScore}`);
    }, GAME_OVER_POPUP_DELAY);
    save('rollsLeft', 0);
    updateRollButton(); // this would be called from onTurnPlayed anyway
};

const checkGameOver = () => {
    const turnsPlayed = document.querySelectorAll('.score.confirmed:not(#bonus)').length;
    if (turnsPlayed === NUMBER_OF_CATEGORIES) {
        onGameOver();
    }
};

const updateHighScore = () => {
    const highScore = load('highScore');
    document.querySelector('#high-score').innerText = highScore;
};

const onHighScore = score => {
    save('highScore', score);
    updateHighScore();
};

const isHighScore = score => score > highScore;

const checkHighScore = currentScore => {
    if (isHighScore(currentScore)) {
        onHighScore(currentScore);
    }
}

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

const getScoresAsArray = () => {
    const result = Array.from(new Array(NUMBER_OF_CATEGORIES)).map(_ => null);
    const confirmedScores = document.querySelectorAll('.score.confirmed:not(#bonus)');
    confirmedScores.forEach(score => {
        const scoreIndex = Number(score.id.split('-').reverse()[0] - 1); // score index 0-based
        result[scoreIndex] = Number(score.dataset.score);
    });
    result.push(Number(document.querySelector('#bonus').dataset.score) || 0);
    return result;
};

const onTurnPlayed = () => {
    confirmSelectedScore();
    updateBonus();
    updateTotalScore();
    clearSuggestedScores();
    clearDice();
    save('scores', getScoresAsArray());
    remove('dice');
    save('rollsLeft', ROLLS_PER_TURN);
    checkHighScore(getTotalScore());
    checkGameOver();
    updateRollButton();
    updatePlayButton();
};

const addListenerToPlayButton = () => {
    const playButton = document.querySelector('#play-btn');
    playButton.onclick = onTurnPlayed;
};

const populateDice = dice => {
    dice.forEach((die, index) => {
        const dieContainer = document.querySelector(`#die-${index + 1}`);
        setDieImage(dieContainer, die);
        dieContainer.dataset.die = die;
        dieContainer.onclick = () => {
            dieContainer.classList.toggle('selected');
        }
    });
};

const populateConfirmedScores = scores => {
    scores.pop(); // bonus will be handled separately
    scores.forEach((score, index) => {
        if (score !== null) {
            const scoreContainer = document.querySelector(`#score-${index + 1}`);
            scoreContainer.classList.add('confirmed');
            scoreContainer.innerText = score;
            scoreContainer.dataset.score = score;
        }
    });
};

const loadGameInProgress = () => {
    const dice = load('dice');
    const scores = load('scores');
    populateConfirmedScores(scores);
    if (dice !== null) {
        populateDice(dice);
        generatePossibleScores(dice);
    }
    updateBonus();
    updateTotalScore();
};

const isGameInProgress = () => load('scores') !== null;

const highScore = load('highScore');
if (highScore === null) {
    save('highScore', 0);
}
updateHighScore();

const rollsLeft = load('rollsLeft');
if (rollsLeft === null) {
    save('rollsLeft', ROLLS_PER_TURN);
}
updateRollButton();

if (isGameInProgress()) {
    loadGameInProgress();
} else {
    clearLastGameData();
}

addListenerToRollButton();
addListenerToPlayButton();
