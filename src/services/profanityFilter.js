const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const leetReplace = (char, leetMap) => {
  return leetMap[char] || char;
};

const replaceSpecialChars = (input, leetMap) => {
  return input.split('').map(char => leetReplace(char, leetMap)).join('');
};

const simplifyRepeatedChars = (input, maxRepetitions = 1) => {
  return input.replace(/(.)\1{2,}/g, (match, char) => char.repeat(maxRepetitions));
};

const removeSpacesAndSpecialChars = (input) => {
  return input.replace(/[\s*.]/g, '');
};

export const checkForProfanity = (input, badWordsList, leetMap) => {
  const lowerCaseInput = input.toLowerCase();
  const replacedInput = replaceSpecialChars(lowerCaseInput, leetMap);
  const simplifiedInput = simplifyRepeatedChars(replacedInput);
  const cleanedInput = removeSpacesAndSpecialChars(simplifiedInput);

  for (let i = 0; i < badWordsList.length; i++) {
    const badWord = badWordsList[i];
    const escapedWord = escapeRegExp(badWord);
    const regexString = escapedWord.split('').join('\\s*\\.*');

    try {
      const regex = new RegExp(regexString, 'i');
      if (regex.test(cleanedInput)) {
        return { found: true, word: badWord }; // Return true and the profane word if found
      }
    } catch (e) {
      console.error(`Invalid regex for word: ${badWord}`, e);
    }
  }

  return { found: false, word: '' }; // Return false if no profane words are found
};
