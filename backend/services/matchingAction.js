const validator = require('validator')
const jwt = require('jsonwebtoken');


exports.likeMatch = async (request, response, User,searcherPreferences,providerPreferences) =>{
    const providerId = request.body.providerId;
    const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret).data.id;
    const user = await searcherPreferences.findOne({where: { id: userId }});
    console.log(user)
    user.seenProviders = [...user.seenProviders, providerId];
    await user.save()
    const provider = await providerPreferences.findOne({where: { id: providerId }});
    provider.likes = [...provider.likes, userId];
    await provider.save()
}

exports.dislikeMatch = async (request, response, User,searcherPreferences,providerPreferences) =>{
    const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret).data.id;
    const user = await searcherPreferences.findOne({where: { id: userId }});
    const providerId = request.body.providerId;
    user.seenProviders = [...user.seenProviders, providerId];
    await user.save()
}