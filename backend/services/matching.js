const validator = require('validator')
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const geolib = require('geolib');


let weights = {
    accessibility: 1,
    balcony: 1,
    cleanliness: 1,
    flatmates: 1,
    food: 1,
    internet: 1,
    quietness: 1,
    washer: 1,
    flatSize: 1,
    roomSize: 1,
    genderPreference: 1,
    distance: 1,
    budget: 1
};

exports.matching = async (request, response, User,searcherPreferences,providerPreferences) =>{
    const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret).data.id;
    const user = await User.findOne({ id: userId });
    const matchAmount = request.body.matchAmount;
    const preferences = await searcherPreferences.findOne({ id: userId });
    const providers = await providerPreferences.findAll({
        where:{
            id: {[Op.notIn]: preferences.seenProviders}
        }
    })
    console.log(preferences)
    if (!user || !preferences) {
        return res.status(404).send('User not found');
    }

    var idsToFilter = request.body.currentId;

    const filteredProviders = providers.filter(provider => !idsToFilter.includes(provider.id));

    if (filteredProviders.length === 0) {
        //return res.status(404).send('No more providers');
    }


    const distances = filteredProviders.map(provider => {
        return geolib.getDistance(
            { latitude: preferences.preferredLat, longitude: preferences.preferredLon },
            { latitude: provider.latitude, longitude: provider.longitude }
        );
    });

    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);
    // Calculate scores for all providers
    const scoredProviders = filteredProviders.map((provider, index) => ({
        provider,
        score: calculateScore(preferences, provider, minDistance, maxDistance)
    }));
    // Sort providers by score in descending order
    scoredProviders.sort((a, b) => b.score.score - a.score.score);

    // Return the provider with the highest score
    const bestProvider = scoredProviders;
    response.json({success: true, providers: bestProvider.slice(0, matchAmount)});
}

const parseRange = (range) => {
    var [min, max] = range.split('-').map(Number);
      if(range.includes("+")) [min, max] = [range.split('+')[0], 999]
    return { min, max: max || Infinity };
  };
  
  
  const normalizeDistanceScore = (distance, minDistance, maxDistance) => {
      if (minDistance === maxDistance) return 10;  // Handle edge case where all distances are the same
      return 10 - 9 * ((distance - minDistance) / (maxDistance - minDistance));
    };
  
  
  const calculateScore = (userPreferences, provider, minDistance, maxDistance) => {
    let score = 0;
    let maxScore = 0;
    if(provider.id == "7b0a8dad-7ba6-4b94-adf5-a566f2d1565e") console.log(provider.id)
  
    // Function to calculate inverse difference score (higher score for closer values)
    const inverseDifference = (a, b) => 10 - Math.abs(a - b);
  
    // Accessibility score
    if ('accessibility' in userPreferences && 'accessibility' in provider) {
        score += weights.accessibility* inverseDifference(userPreferences.accessibility, provider.accessibility);
        maxScore += weights.accessibility*  10;
    }
  
  
    // Balcony
    if ('balcony' in userPreferences && 'balcony' in provider) {
      score += weights.balcony* (provider.balcony ? userPreferences.balcony : 0);
      maxScore += weights.balcony* 10;
  }
  
    // Cleanliness score
    if ('cleanliness' in userPreferences && 'cleanliness' in provider) {
        score += weights.cleanliness* inverseDifference(userPreferences.cleanliness, provider.cleanliness);
        maxScore += weights.cleanliness* 10;
      }
  
    // Flatmates score
    if ('flatmates' in userPreferences && 'flatmates' in provider) {
        score += weights.flatmates* inverseDifference(userPreferences.flatmates, provider.flatmates);
        maxScore += weights.flatmates* 10;
    }
  
    // Food preference
    if ('food' in userPreferences && 'food' in provider) {
        score += weights.food* ((userPreferences.food === provider.food) ? 10 : 0);
        maxScore += weights.food* 10;
    }
  
    // Internet preference (1-10 for searcher, true/false for provider)
    if ('internet' in userPreferences && 'internet' in provider) {
        score += weights.internet* (provider.internet ? userPreferences.internet : 0);
        maxScore += weights.internet* 10;
      }
  
    // Quietness score
    if ('quietness' in userPreferences && 'quietness' in provider) {
        score +=weights.quietness*  inverseDifference(userPreferences.quietness, provider.quietness);
        maxScore += weights.quietness* 10;
      }
  
    // Washer preference (1-10 for searcher, true/false for provider)
    if ('washer' in userPreferences && 'washer' in provider) {
        score +=weights.washer* ( provider.washer ? userPreferences.washer : 0);
        maxScore += weights.washer* 10;
      }
  
    // FlatSize preference
    if ('flatSize' in userPreferences && 'flatSize' in provider) {
        const { min, max } = parseRange(userPreferences.flatSize);
  
        score += weights.flatSize* (provider.flatSize >= min && provider.flatSize <= max) ? 10 : 0;
        maxScore += weights.flatSize* 10;
    }
  
    // RoomSize preference
    if ('roomSize' in userPreferences && 'roomSize' in provider) {
  
        const { min, max } = parseRange(userPreferences.roomSize);
        score += weights.roomSize* ((provider.roomSize >= min && provider.roomSize <= max) ? 10 : 0);
        maxScore += weights.roomSize* 10;
    }
  
    // Gender preference
    if ('genderPreference' in userPreferences && 'genderPreference' in provider) {
        score += weights.genderPreference* ((userPreferences.genderPreference === provider.genderPreference) ? 10 : 0);
        maxScore += weights.genderPreference* 10;

    }
  
   // Calculate distance score if preferred latitude and longitude are available
   if ('preferredLat' in userPreferences && 'preferredLon' in userPreferences && 'latitude' in provider && 'longitude' in provider) {
      const distance = geolib.getDistance(
          { latitude: userPreferences.preferredLat, longitude: userPreferences.preferredLon },
          { latitude: provider.latitude, longitude: provider.longitude }
      );
      const distanceScore = normalizeDistanceScore(distance, minDistance, maxDistance);

      score += weights.distance* distanceScore;
      maxScore += weights.distance* 10;
  }
  
  
  
    // Budget check
    if ('budget' in userPreferences && 'price' in provider) {
        if (userPreferences.budget >= provider.price) {
            score += weights.budget* 10; // Add points if within budget
            maxScore += weights.budget* 10;
        } else {
            score -= weights.budget* ((provider.price - userPreferences.budget) / 100);
            maxScore += weights.budget* 10;
        }
    }


    return {
        score: Math.max(score, 0),  // Ensure the score is not negative
        maxScore: maxScore,
        matchPercent: Math.round(Math.max(score, 0)/maxScore*100),
  
    };
  };