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
    try {
    var idsToFilter = JSON.parse(request.body.currentId);
    } catch (error) {
        var idsToFilter = [] 
    }
    const preferences = await searcherPreferences.findOne({ id: userId });
    console.log(idsToFilter)
    if(idsToFilter && idsToFilter.length > 0){
    idsToFilter.forEach(element => {
        preferences.seenProviders.push(element)
    });
    }
    const providers = await providerPreferences.findAll({
        where:{
            id: {[Op.notIn]: preferences.seenProviders},

        }
    })
    if (!user || !preferences) {
        return res.status(404).send('User not found');
    }


    const filteredProviders = providers;

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
        let totalScore = 0;
        let maxScore = 0;
        let scores = {};
    
        const inverseDifference = (a, b) => 10 - Math.abs(a - b);
    
        const calculateFactorScore = (factor, scoreFunction) => {
            if (factor in userPreferences && factor in provider) {
                const factorScore = scoreFunction();
                scores[factor] = factorScore;
                totalScore += weights[factor] * factorScore;
                maxScore += weights[factor] * 10;
            }
        };
    
        calculateFactorScore('accessibility', () => inverseDifference(userPreferences.accessibility, provider.accessibility));
        calculateFactorScore('balcony', () => provider.balcony ? userPreferences.balcony : 0);
        calculateFactorScore('cleanliness', () => inverseDifference(userPreferences.cleanliness, provider.cleanliness));
        calculateFactorScore('flatmates', () => inverseDifference(userPreferences.flatmates, provider.flatmates));
        calculateFactorScore('food', () => userPreferences.food === provider.food ? 10 : 0);
        calculateFactorScore('internet', () => provider.internet ? userPreferences.internet : 0);
        calculateFactorScore('quietness', () => inverseDifference(userPreferences.quietness, provider.quietness));
        calculateFactorScore('washer', () => provider.washer ? userPreferences.washer : 0);
    
        calculateFactorScore('flatSize', () => {
            const { min, max } = parseRange(userPreferences.flatSize);
            return (provider.flatSize >= min && provider.flatSize <= max) ? 10 : 0;
        });
    
        calculateFactorScore('roomSize', () => {
            const { min, max } = parseRange(userPreferences.roomSize);
            return (provider.roomSize >= min && provider.roomSize <= max) ? 10 : 0;
        });
    
        calculateFactorScore('genderPreference', () => userPreferences.genderPreference === provider.genderPreference ? 10 : 0);
    
        if ('preferredLat' in userPreferences && 'preferredLon' in userPreferences && 'latitude' in provider && 'longitude' in provider) {
            const distance = geolib.getDistance(
                { latitude: userPreferences.preferredLat, longitude: userPreferences.preferredLon },
                { latitude: provider.latitude, longitude: provider.longitude }
            );
            const distanceScore = normalizeDistanceScore(distance, minDistance, maxDistance);
            scores['distance'] = distanceScore;
            totalScore += weights.distance * distanceScore;
            maxScore += weights.distance * 10;
        }
    
        calculateFactorScore('budget', () => {
            if (userPreferences.budget >= provider.price) {
                return 10;
            } else {
                return Math.max(-10, -((provider.price - userPreferences.budget) / 100));
            }
        });
    
        return {
            score: Math.max(totalScore, 0),
            maxScore: maxScore,
            matchPercent: Math.round(Math.max(totalScore, 0) / maxScore * 100),
            individualScores: scores
        };
    };