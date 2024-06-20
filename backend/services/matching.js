const validator = require('validator')
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const geolib = require('geolib');




exports.matching = async (request, response, User,searcherPreferences,providerPreferences) =>{
    const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret).data.id;
    const user = await User.findOne({ id: userId });
    const preferences = await searcherPreferences.findOne({ id: userId });
    const providers = await providerPreferences.findAll({
        where:{
            id: {[Op.notIn]: preferences.seenProviders}
        }
    })
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
    response.json(bestProvider[0]);
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
  
    // Function to calculate inverse difference score (higher score for closer values)
    const inverseDifference = (a, b) => 10 - Math.abs(a - b);
  
    // Accessibility score
    if ('accessibility' in userPreferences && 'accessibility' in provider) {
        score += inverseDifference(userPreferences.accessibility, provider.accessibility);
        maxScore += 10;
    }
  
  
    // Balcony
    if ('balcony' in userPreferences && 'balcony' in provider) {
      score += provider.balcony ? userPreferences.balcony : 0;
      maxScore += 10;
  }
  
    // Cleanliness score
    if ('cleanliness' in userPreferences && 'cleanliness' in provider) {
        score += inverseDifference(userPreferences.cleanliness, provider.cleanliness);
        maxScore += 10;
      }
  
    // Flatmates score
    if ('flatmates' in userPreferences && 'flatmates' in provider) {
        score += inverseDifference(userPreferences.flatmates, provider.flatmates);
        maxScore += 10;
    }
  
    // Food preference
    if ('food' in userPreferences && 'food' in provider) {
        score += (userPreferences.food === provider.food) ? 10 : 0;
        maxScore += 10;
    }
  
    // Internet preference (1-10 for searcher, true/false for provider)
    if ('internet' in userPreferences && 'internet' in provider) {
        score += provider.internet ? userPreferences.internet : 0;
        maxScore += 10;
      }
  
    // Quietness score
    if ('quietness' in userPreferences && 'quietness' in provider) {
        score += inverseDifference(userPreferences.quietness, provider.quietness);
        maxScore += 10;
      }
  
    // Washer preference (1-10 for searcher, true/false for provider)
    if ('washer' in userPreferences && 'washer' in provider) {
        score += provider.washer ? userPreferences.washer : 0;
        maxScore += 10;
      }
  
    // FlatSize preference
    if ('flatSize' in userPreferences && 'flatSize' in provider) {
        const { min, max } = parseRange(userPreferences.flatSize);
  
        score += (provider.flatSize >= min && provider.flatSize <= max) ? 10 : 0;
        maxScore += 10;
    }
  
    // RoomSize preference
    if ('roomSize' in userPreferences && 'roomSize' in provider) {
  
        const { min, max } = parseRange(userPreferences.roomSize);
        score += (provider.roomSize >= min && provider.roomSize <= max) ? 10 : 0;
        maxScore += 10;
    }
  
    // Gender preference
    if ('genderPreference' in userPreferences && 'genderPreference' in provider) {
        score += (userPreferences.genderPreference === provider.genderPreference) ? 10 : 0;
        maxScore += 10;
    }
  
   // Calculate distance score if preferred latitude and longitude are available
   if ('preferredLat' in userPreferences && 'preferredLon' in userPreferences && 'latitude' in provider && 'longitude' in provider) {
      const distance = geolib.getDistance(
          { latitude: userPreferences.preferredLat, longitude: userPreferences.preferredLon },
          { latitude: provider.latitude, longitude: provider.longitude }
      );
      const distanceScore = normalizeDistanceScore(distance, minDistance, maxDistance);
      score += distanceScore;
      maxScore += 10;
  }
  
  
  
    // Budget check
    if ('budget' in userPreferences && 'price' in provider) {
        if (userPreferences.budget >= provider.price) {
            score += 10; // Add points if within budget
            maxScore += 10;
        } else {
            score -= (provider.price - userPreferences.budget) / 100;
            maxScore += 10;
        }
    }
  
    return {
        score: Math.max(score, 0),  // Ensure the score is not negative
        maxScore: maxScore,
        matchPercent: Math.round(Math.max(score, 0)/maxScore*100),
  
    };
  };